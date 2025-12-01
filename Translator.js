const kuroshiroPath =
  "https://cdn.jsdelivr.net/npm/kuroshiro@1.2.0/dist/kuroshiro.min.js";
const kuromojiPath =
  "https://cdn.jsdelivr.net/npm/kuroshiro-analyzer-kuromoji@1.1.0/dist/kuroshiro-analyzer-kuromoji.min.js";
const aromanize =
  "https://cdn.jsdelivr.net/npm/aromanize@0.1.5/aromanize.min.js";
const openCCPath =
  "https://cdn.jsdelivr.net/npm/opencc-js@1.0.5/dist/umd/full.min.js";
const pinyinProPath =
  "https://cdn.jsdelivr.net/npm/pinyin-pro@3.19.7/dist/index.min.js";
const tinyPinyinPath =
  "https://cdn.jsdelivr.net/npm/tiny-pinyin/dist/tiny-pinyin.min.js";

const dictPath = "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict";

// 최적화 #7 - 에러 메시지 표준화
const API_ERROR_MESSAGES = {
  400: {
    MISSING_API_KEY: I18n.t("translator.missingApiKey"),
    INVALID_API_KEY_FORMAT: I18n.t("translator.invalidApiKeyFormat"),
    DEFAULT: I18n.t("translator.invalidRequestFormat")
  },
  401: I18n.t("translator.invalidApiKey"),
  403: I18n.t("translator.accessForbidden"),
  429: I18n.t("translator.rateLimitExceeded"),
  500: I18n.t("translator.serviceUnavailable"),
  502: I18n.t("translator.serviceUnavailable"),
  503: I18n.t("translator.serviceUnavailable")
};

// 최적화 #7 - 에러 처리 헬퍼 함수
function handleAPIError(status, errorData) {
  const errorConfig = API_ERROR_MESSAGES[status];

  if (typeof errorConfig === 'object') {
    // 400 에러 - 코드별 메시지
    const code = errorData?.code;
    return errorConfig[code] || errorConfig.DEFAULT;
  }

  // 기타 에러 - 직접 메시지 반환
  return errorConfig || `${I18n.t("translator.requestFailed")} (${status})`;
}

// 전역 요청 상태 관리 (중복 요청 방지)
const _inflightRequests = new Map();
const _pendingRetries = new Map();

// 진행 중인 요청 키 생성
function getRequestKey(trackId, wantSmartPhonetic, lang) {
  return `${trackId}:${wantSmartPhonetic ? 'phonetic' : 'translation'}:${lang}`;
}

class Translator {
  // 특정 trackId에 대한 진행 중인 요청 정리 (곡 변경 시 호출)
  static clearInflightRequests(trackId) {
    if (!trackId) return;
    
    // _inflightRequests에서 해당 trackId로 시작하는 키 제거
    for (const key of _inflightRequests.keys()) {
      if (key.startsWith(`${trackId}:`)) {
        _inflightRequests.delete(key);
      }
    }
    
    // _pendingRetries에서도 제거
    for (const key of _pendingRetries.keys()) {
      if (key.startsWith(`${trackId}:`)) {
        _pendingRetries.delete(key);
      }
    }
  }

  // 모든 진행 중인 요청 정리
  static clearAllInflightRequests() {
    _inflightRequests.clear();
    _pendingRetries.clear();
  }

  constructor(lang, isUsingNetease = false) {
    this.finished = {
      ja: false,
      ko: false,
      zh: false,
      ru: false,
      vi: false,
      de: false,
      en: false,
      es: false, // Spanish
      fr: false, // French
      it: false, // Italian
      pt: false, // Portuguese
      nl: false, // Dutch
      pl: false, // Polish
      tr: false, // Turkish
      ar: false, // Arabic
      hi: false, // Hindi
      th: false, // Thai
      id: false, // Indonesian
    };
    this.isUsingNetease = isUsingNetease;
    this.initializationPromise = null;

    this.applyKuromojiFix();
    // Start initialization asynchronously but don't await in constructor
    this.initializationPromise = this.initializeAsync(lang);
  }

  /**
   * Async initialization method that can be awaited
   * @param {string} lang - Language code
   * @returns {Promise<void>}
   */
  async initializeAsync(lang) {
    try {
      await this.injectExternals(lang);
      await this.createTranslator(lang);
    } catch (error) {
      throw error;
    }
  }

  static async callGemini({
    trackId,
    artist,
    title,
    text,
    wantSmartPhonetic = false,
    provider = null,
    ignoreCache = false,
  }) {
    if (!text?.trim()) throw new Error("No text provided for translation");

    // Get API key from localStorage
    const apiKey = StorageManager.getItem("lyrics-plus:visual:gemini-api-key");

    // Check if API key is provided
    if (!apiKey || apiKey.trim() === "") {
      throw new Error(
        I18n.t("translator.missingApiKey")
      );
    }

    // trackId가 전달되지 않으면 현재 재생 중인 곡에서 가져옴
    let finalTrackId = trackId;
    if (!finalTrackId) {
      finalTrackId = Spicetify.Player.data?.item?.uri?.split(':')[2];
    }
    if (!finalTrackId) {
      throw new Error("No track ID available");
    }

    // 사용자의 현재 언어 가져오기
    const userLang = I18n.getCurrentLanguage();
    
    // 중복 요청 방지: 동일한 trackId + type + lang 조합에 대한 요청이 진행 중이면 해당 Promise 반환
    const requestKey = getRequestKey(finalTrackId, wantSmartPhonetic, userLang);
    
    // ignoreCache가 아닌 경우에만 중복 요청 체크
    if (!ignoreCache && _inflightRequests.has(requestKey)) {
      console.log(`[Translator] Deduplicating request for: ${requestKey}`);
      return _inflightRequests.get(requestKey);
    }

    // 실제 API 호출을 수행하는 함수
    const executeRequest = async () => {
      const endpoints = [
        "https://lyrics.api.ivl.is/lyrics/translate",
      ];

      const userHash = Utils.getUserHash();

      const body = {
        trackId: finalTrackId,
        artist,
        title,
        text,
        wantSmartPhonetic,
        provider,
        apiKey,
        ignore_cache: ignoreCache,
        lang: userLang,
        userHash,
      };

      const tryFetch = async (url) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800000);

        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(body),
            signal: controller.signal,
            mode: "cors",
          });

          clearTimeout(timeoutId);
          return res;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      };

      try {
        let res;
        let lastError;

        for (const url of endpoints) {
          try {
            res = await tryFetch(url);
            if (res.ok) {
              break;
            }
          } catch (error) {
            lastError = error;
            continue;
          }
        }

        if (!res || !res.ok) {
          if (res) {
            const errorData = await res
              .json()
              .catch(() => ({ message: "Unknown error" }));

            // 진행 중 응답 처리 (202): 재시도 없이 기존 요청 대기
            if (res.status === 202 && errorData.status === "translation_in_progress") {
              console.log(`[Translator] Translation in progress for: ${requestKey}, waiting...`);
              
              // 이미 재시도 대기 중인 경우 해당 Promise 반환
              if (_pendingRetries.has(requestKey)) {
                return _pendingRetries.get(requestKey);
              }
              
              // 일정 시간 후 자동 재시도 (폴링)
              const retryPromise = new Promise((resolve, reject) => {
                const retryDelay = Math.min((errorData.retry_after || 5) * 1000, 30000);
                const maxRetries = 20; // 최대 20회 재시도 (약 100초)
                let retryCount = 0;
                
                const pollStatus = async () => {
                  retryCount++;
                  
                  try {
                    // 상태 확인 API 호출
                    const statusUrl = `https://lyrics.api.ivl.is/lyrics/translate?action=status&trackId=${finalTrackId}&lang=${userLang}&isPhonetic=${wantSmartPhonetic}`;
                    const statusRes = await fetch(statusUrl);
                    const statusData = await statusRes.json();
                    
                    if (statusData.status === "completed") {
                      // 완료되었으면 다시 요청 (캐시에서 가져옴)
                      _pendingRetries.delete(requestKey);
                      const result = await Translator.callGemini({
                        trackId: finalTrackId,
                        artist,
                        title,
                        text,
                        wantSmartPhonetic,
                        provider,
                        ignoreCache: false,
                      });
                      resolve(result);
                      return;
                    } else if (statusData.status === "failed" || statusData.status === "not_found") {
                      _pendingRetries.delete(requestKey);
                      reject(new Error(statusData.message || "Translation failed"));
                      return;
                    }
                    
                    // 아직 진행 중이면 계속 대기
                    if (retryCount < maxRetries) {
                      setTimeout(pollStatus, retryDelay);
                    } else {
                      _pendingRetries.delete(requestKey);
                      reject(new Error("Translation timeout - please try again later"));
                    }
                  } catch (pollError) {
                    if (retryCount < maxRetries) {
                      setTimeout(pollStatus, retryDelay);
                    } else {
                      _pendingRetries.delete(requestKey);
                      reject(pollError);
                    }
                  }
                };
                
                setTimeout(pollStatus, retryDelay);
              });
              
              _pendingRetries.set(requestKey, retryPromise);
              return retryPromise;
            }

            if (errorData.error && errorData.message) {
              throw new Error(errorData.message);
            }

            // 최적화 #7 - 표준화된 에러 처리 사용
            const errorMessage = handleAPIError(res.status, errorData);
            throw new Error(errorMessage);
          }

          throw lastError || new Error("All endpoints failed");
        }

        const data = await res.json();

        if (data.error) {
          // 최적화 #7 - 표준화된 에러 처리 사용
          const errorCode = data.code;
          const errorConfig = API_ERROR_MESSAGES[400];

          if (errorConfig[errorCode]) {
            throw new Error(errorConfig[errorCode]);
          }

          // 기본 메시지
          const errorMessage = data.message || I18n.t("translator.translationFailed");
          if (errorMessage.includes("API") || errorMessage.includes("키")) {
            throw new Error(I18n.t("translator.apiKeyError"));
          }
          throw new Error(errorMessage);
        }

        return data;
      } catch (error) {
        if (error.name === "AbortError") {
          throw new Error(I18n.t("translator.requestTimeout"));
        }
        throw new Error(`${I18n.t("translator.failedPrefix")}: ${error.message}`);
      }
    };

    // Promise를 생성하고 Map에 저장
    const requestPromise = executeRequest().finally(() => {
      // 요청 완료 후 Map에서 제거
      _inflightRequests.delete(requestKey);
    });

    // ignoreCache가 아닌 경우에만 중복 요청 방지 등록
    if (!ignoreCache) {
      _inflightRequests.set(requestKey, requestPromise);
    }

    return requestPromise;
  }

  includeExternal(url) {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        if (existingScript.dataset)
          existingScript.dataset.loaded =
            existingScript.dataset.loaded || "true";
        return resolve();
      }

      const script = document.createElement("script");
      script.setAttribute("type", "text/javascript");
      script.setAttribute("src", url);

      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      });

      script.addEventListener("error", () => {
        reject(new Error(`Failed to load script: ${url}`));
      });

      document.head.appendChild(script);
    });
  }

  async injectExternals(lang) {
    const langCode = lang?.slice(0, 2);
    try {
      switch (langCode) {
        case "ja":
          await Promise.all([
            this.includeExternal(kuromojiPath),
            this.includeExternal(kuroshiroPath),
          ]);
          break;
        case "ko":
          await this.includeExternal(aromanize);
          break;
        case "zh":
          await this.includeExternal(openCCPath);
          this.includeExternal(pinyinProPath).catch(() => {});
          this.includeExternal(tinyPinyinPath).catch(() => {});
          break;
        case "ru":
        case "vi":
        case "de":
        case "en":
        case "es":
        case "fr":
        case "it":
        case "pt":
        case "nl":
        case "pl":
        case "tr":
        case "ar":
        case "hi":
        case "th":
        case "id":
          // These languages will use Gemini API for translation
          // No external libraries needed
          this.finished[langCode] = true;
          break;
      }
    } catch (error) {
      throw error;
    }
  }
  async awaitFinished(language) {
    const langCode = language?.slice(0, 2);
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
    if (langCode && !this.finished[langCode]) {
      await this.injectExternals(language);
      await this.createTranslator(language);
    }
  }

  /**
   * Fix an issue with kuromoji when loading dict from external urls
   * Adapted from: https://github.com/mobilusoss/textlint-browser-runner/pull/7
   */
  applyKuromojiFix() {
    if (typeof XMLHttpRequest.prototype.realOpen !== "undefined") return;
    XMLHttpRequest.prototype.realOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, bool) {
      if (url.indexOf(dictPath.replace("https://", "https:/")) === 0) {
        this.realOpen(method, url.replace("https:/", "https://"), bool);
      } else {
        this.realOpen(method, url, bool);
      }
    };
  }

  async createTranslator(lang) {
    const langCode = lang.slice(0, 2);

    switch (langCode) {
      case "ja":
        if (this.kuroshiro) return;

        // Wait for libraries to be available with timeout
        await this.waitForGlobals(["Kuroshiro", "KuromojiAnalyzer"], 10000);

        this.kuroshiro = new Kuroshiro.default();
        await this.kuroshiro.init(new KuromojiAnalyzer({ dictPath }));
        this.finished.ja = true;
        break;

      case "ko":
        if (this.Aromanize) return;

        await this.waitForGlobals(["Aromanize"], 5000);

        this.Aromanize = Aromanize;
        this.finished.ko = true;
        break;

      case "zh":
        if (this.OpenCC) return;

        await this.waitForGlobals(["OpenCC"], 5000);

        this.OpenCC = OpenCC;
        this.finished.zh = true;
        break;

      case "ru":
      case "vi":
      case "de":
      case "en":
      case "es":
      case "fr":
      case "it":
      case "pt":
      case "nl":
      case "pl":
      case "tr":
      case "ar":
      case "hi":
      case "th":
      case "id":
        // These languages use Gemini API for translation
        this.finished[langCode] = true;
        break;
    }
  }

  /**
   * Wait for global variables to become available
   * @param {string[]} globalNames - Array of global variable names to wait for
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForGlobals(globalNames, timeoutMs = 5000) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkGlobals = () => {
        const allAvailable = globalNames.every(
          (name) => typeof window[name] !== "undefined"
        );

        if (allAvailable) {
          resolve();
          return;
        }

        if (Date.now() - startTime > timeoutMs) {
          reject(
            new Error(`Timeout waiting for globals: ${globalNames.join(", ")}`)
          );
          return;
        }

        setTimeout(checkGlobals, 50);
      };

      checkGlobals();
    });
  }

  // 최적화 #12 - Romaji character map
  static _romajiMap = { 'ō': 'ou', 'ū': 'uu', 'ā': 'aa', 'ī': 'ii', 'ē': 'ee' };
  static _romajiPattern = /[ōūāīē]/g;

  static normalizeRomajiString(s) {
    if (typeof s !== "string") return "";
    // 최적화 #12 - 단일 replace로 변경
    return s
      .replace(this._romajiPattern, match => this._romajiMap[match])
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  async romajifyText(text, target = "romaji", mode = "spaced") {
    // Ensure initialization is complete
    await this.awaitFinished("ja");

    const out = await this.kuroshiro.convert(text, {
      to: target,
      mode: mode,
      romajiSystem: "hepburn",
    });
    return Translator.normalizeRomajiString(out);
  }

  async convertToRomaja(text, target) {
    // Ensure initialization is complete
    await this.awaitFinished("ko");

    if (target === "hangul") return text;
    if (!this.Aromanize || typeof this.Aromanize.hangulToLatin !== "function") {
      throw new Error("Korean converter not initialized");
    }
    return this.Aromanize.hangulToLatin(text, "rr-translit");
  }

  async convertChinese(text, from, target) {
    // Ensure initialization is complete
    await this.awaitFinished("zh");

    const converter = this.OpenCC.Converter({
      from: from,
      to: target,
    });

    return converter(text);
  }

  async loadPinyinPro() {
    if (typeof pinyinPro !== "undefined") return true;
    const urls = [
      pinyinProPath,
      "https://cdn.jsdelivr.net/npm/pinyin-pro@3.19.7/dist/index.js",
      "https://unpkg.com/pinyin-pro@3.19.7/dist/index.min.js",
      "https://unpkg.com/pinyin-pro@3.19.7/dist/index.js",
      "https://fastly.jsdelivr.net/npm/pinyin-pro@3.19.7/dist/index.min.js",
      "https://fastly.jsdelivr.net/npm/pinyin-pro@3.19.7/dist/index.js",
    ];
    for (const url of urls) {
      try {
        await this.includeExternal(url);
        await this.waitForGlobals(["pinyinPro"], 8000);
        return true;
      } catch {}
    }
    return false;
  }

  async loadTinyPinyin() {
    if (typeof TinyPinyin !== "undefined") return true;
    const urls = [
      tinyPinyinPath,
      "https://unpkg.com/tiny-pinyin/dist/tiny-pinyin.min.js",
      "https://fastly.jsdelivr.net/npm/tiny-pinyin/dist/tiny-pinyin.min.js",
    ];
    for (const url of urls) {
      try {
        await this.includeExternal(url);
        await this.waitForGlobals(["TinyPinyin"], 8000);
        return true;
      } catch {}
    }
    return false;
  }

  async convertToPinyin(text, options = {}) {
    try {
      if (await this.loadTinyPinyin()) {
        return TinyPinyin.convertToPinyin(text || "");
      }
      if (await this.loadPinyinPro()) {
        const toneType = options.toneType || "mark";
        const type = options.type || "string";
        const nonZh = options.nonZh || "consecutive";
        return pinyinPro.pinyin(text || "", { toneType, type, nonZh });
      }
      return text || "";
    } catch {
      return text || "";
    }
  }
}
