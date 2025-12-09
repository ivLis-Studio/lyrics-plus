// Run "npm i @types/react" to have this type package available in workspace
/// <reference types="react" />
/// <reference path="../../globals.d.ts" />

// Furigana Converter Module for Lyrics Plus
const FuriganaConverter = (() => {
  let kuromojiInstance = null;
  let isInitializing = false;
  let initPromise = null;
  const conversionCache = new Map();

  // Debug mode - set to false to reduce console logs
  const DEBUG_MODE = false;
  const MAX_CONVERSION_CACHE_SIZE = 1000;
  let hasLoggedKuromojiWarning = false;

  // Patch XMLHttpRequest to fix URL issues
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    // Fix Kuromoji dictionary URLs
    if (
      typeof url === "string" &&
      url.includes("/dict/") &&
      url.includes(".dat.gz")
    ) {
      // If URL doesn't start with http/https, fix it
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url =
          "https://unpkg.com/kuromoji@0.1.2/dict/" + url.split("/dict/").pop();
      }
      // If URL has wrong host, fix it
      else if (url.includes("xpui.app.spotify.com")) {
        const filename = url.split("/dict/").pop();
        url = "https://unpkg.com/kuromoji@0.1.2/dict/" + filename;
      }
    }
    return originalXHROpen.call(this, method, url, ...args);
  };

  const init = async () => {
    if (kuromojiInstance) {
      return Promise.resolve();
    }

    if (isInitializing) {
      return initPromise;
    }

    isInitializing = true;
    initPromise = new Promise((resolve, reject) => {
      if (typeof window.kuromoji === "undefined") {
        reject(new Error("Kuromoji library not loaded"));
        return;
      }

      // Use any path - our XHR patch will fix it
      const dicPath = "/dict";

      window.kuromoji
        .builder({
          dicPath: dicPath,
        })
        .build((err, tokenizer) => {
          if (err) {
            isInitializing = false;
            reject(err);
            return;
          }

          kuromojiInstance = tokenizer;
          isInitializing = false;

          // Trigger re-render by dispatching a custom event
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("furigana-ready"));
          }, 100);

          resolve();
        });
    });

    return initPromise;
  };

  const containsKanji = (text) => {
    const kanjiRegex = /[\u4E00-\u9FAF\u3400-\u4DBF]/;
    return kanjiRegex.test(text);
  };

  const katakanaToHiragana = (katakana) => {
    if (!katakana) return "";

    return katakana
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);
        if (code >= 0x30a1 && code <= 0x30f6) {
          return String.fromCharCode(code - 0x60);
        }
        return char;
      })
      .join("");
  };

  const convertToFurigana = (text) => {
    if (!text || typeof text !== "string") {
      return text;
    }

    if (!containsKanji(text)) {
      return text;
    }

    if (conversionCache.has(text)) {
      return conversionCache.get(text);
    }

    if (!kuromojiInstance) {
      if (DEBUG_MODE && !hasLoggedKuromojiWarning) {
        console.warn("[Lyrics Plus] Kuromoji is not initialized yet.");
        hasLoggedKuromojiWarning = true;
      }
      return text;
    }

    try {
      const tokens = kuromojiInstance.tokenize(text);
      let result = "";

      for (const token of tokens) {
        const surface = token.surface_form;
        const reading = token.reading || token.pronunciation; // Fallback to pronunciation

        // Only add ruby if token has kanji AND reading
        if (reading && containsKanji(surface)) {
          const hiragana = katakanaToHiragana(reading);

          // Process character by character to handle mixed kanji/kana
          let tokenResult = "";
          let readingIndex = 0;
          let i = 0;

          while (i < surface.length) {
            const char = surface[i];

            if (containsKanji(char)) {
              // Found a kanji - collect consecutive kanji
              let kanjiSequence = char;
              i++;

              while (i < surface.length && containsKanji(surface[i])) {
                kanjiSequence += surface[i];
                i++;
              }

              // Find the reading for this kanji sequence
              // Look ahead in surface to find kana that matches reading
              let nextKanaInSurface = "";
              let tempI = i;
              while (tempI < surface.length && !containsKanji(surface[tempI])) {
                nextKanaInSurface += surface[tempI];
                tempI++;
              }

              // Find where this kana appears in the remaining reading
              let kanjiReading = "";
              if (nextKanaInSurface.length > 0) {
                // Find the kana in the reading
                const remainingReading = hiragana.substring(readingIndex);
                const kanaIndex = remainingReading.indexOf(nextKanaInSurface);

                if (kanaIndex > 0) {
                  // Reading up to the kana is for the kanji
                  kanjiReading = remainingReading.substring(0, kanaIndex);
                } else if (kanaIndex === 0) {
                  // No reading for this kanji? Shouldn't happen but handle it
                  kanjiReading = "";
                } else {
                  // Kana not found - take all remaining as kanji reading
                  kanjiReading = remainingReading;
                }
              } else {
                // No more kana in surface - rest of reading is for this kanji
                kanjiReading = hiragana.substring(readingIndex);
              }

              if (kanjiReading) {
                tokenResult += `<ruby>${kanjiSequence}<rt>${kanjiReading}</rt></ruby>`;
                readingIndex += kanjiReading.length;
              } else {
                tokenResult += kanjiSequence;
              }
            } else {
              // Regular kana - just add it
              tokenResult += char;
              readingIndex++;
              i++;
            }
          }

          result += tokenResult;
        } else {
          result += surface;
        }
      }

      if (conversionCache.size > MAX_CONVERSION_CACHE_SIZE) {
        const firstKey = conversionCache.keys().next().value;
        conversionCache.delete(firstKey);
      }
      conversionCache.set(text, result);

      return result;
    } catch (error) {
      if (DEBUG_MODE) {
        console.error("[Lyrics Plus] Furigana conversion failed:", error);
      }
      return text;
    }
  };

  const isAvailable = () => {
    return kuromojiInstance !== null;
  };

  const clearCache = () => {
    conversionCache.clear();
  };

  return {
    init,
    convertToFurigana,
    containsKanji,
    isAvailable,
    clearCache,
  };
})();

window.FuriganaConverter = FuriganaConverter;

// Load Kuromoji library for furigana conversion
if (typeof window.kuromoji === "undefined") {
  const kuromojiScript = document.createElement("script");
  kuromojiScript.src =
    "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js";
  kuromojiScript.async = false; // Load synchronously to ensure it's available
  kuromojiScript.onload = () => {
    // Initialize immediately
    if (typeof window.FuriganaConverter !== "undefined") {
      window.FuriganaConverter.init()
        .then(() => {
          // Trigger lyrics re-render if furigana is enabled
          if (CONFIG?.visual?.["furigana-enabled"]) {
            // Try multiple methods to trigger re-render
            if (window.lyricContainer) {
              try {
                window.lyricContainer.forceUpdate();
              } catch (e) { }
            }
          }
        })
        .catch((err) => { });
    }
  };
  kuromojiScript.onerror = (err) => { };
  document.head.appendChild(kuromojiScript);
} else {
  // If Kuromoji is already loaded, initialize immediately
  if (typeof window.FuriganaConverter !== "undefined") {
    window.FuriganaConverter.init()
      .then(() => { })
      .catch((err) => { });
  }
}

// === lyrics-plus-overlay 전송 모듈 ===
// Sends lyrics data to the desktop overlay application
const OverlaySender = {
  PORT: 15000,
  progressInterval: null,
  lastSentUri: null,
  lastSentLyrics: null,
  lastSentOffset: null,
  _lastTrackInfo: null,
  _lastLyrics: null,
  lastConfigDelay: undefined,

  // 연결 상태
  _isConnected: false,
  _connectionCheckInterval: null,
  _lastConnectionAttempt: 0,

  // 설정 (localStorage에 저장)
  get enabled() {
    return localStorage.getItem('lyrics-plus:overlay-enabled') !== 'false';
  },
  set enabled(value) {
    localStorage.setItem('lyrics-plus:overlay-enabled', value ? 'true' : 'false');
    if (value) {
      this.startProgressSync();
      this.checkConnection();
    } else {
      this.stopProgressSync();
    }
  },

  _isSettingsOpen: false,
  _settingsTimer: null,

  setSettingsOpen(isOpen) {
    this._isSettingsOpen = isOpen;
    if (this._settingsTimer) {
      clearInterval(this._settingsTimer);
      this._settingsTimer = null;
    }

    if (isOpen) {
      console.log('[OverlaySender] 설정창 열림 - 연결 확인 폴링 시작');
      this.checkConnection();
      this._settingsTimer = setInterval(() => {
        if (!this.isConnected) {
          this.checkConnection();
        }
      }, 2000);
    } else {
      console.log('[OverlaySender] 설정창 닫힘 - 연결 확인 폴링 종료');
    }
  },

  get isConnected() {
    return this._isConnected;
  },
  set isConnected(value) {
    const wasConnected = this._isConnected;
    this._isConnected = value;

    // 연결 상태 변경 이벤트 발송
    window.dispatchEvent(new CustomEvent('lyrics-plus:overlay-connection', {
      detail: { connected: value }
    }));

    // 연결됨 상태로 변경될 때
    if (value && !wasConnected) {
      console.log('[OverlaySender] 오버레이 연결됨 ✓');
      Spicetify.showNotification?.('오버레이 연결됨', false);
      // 가사 재전송
      setTimeout(() => this.resendWithNewOffset(), 100);
    }
    // 연결 끊김 상태로 변경될 때
    else if (!value && wasConnected) {
      console.log('[OverlaySender] 오버레이 연결 끊김');
    }
  },

  // 연결 확인
  async checkConnection() {
    if (!this.enabled) return false;

    try {
      const response = await fetch(`http://localhost:${this.PORT}/progress`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: 0, isPlaying: false }),
        signal: AbortSignal.timeout(1000)
      });
      this.isConnected = response.ok;
      return this.isConnected;
    } catch (e) {
      this.isConnected = false;
      return false;
    }
  },

  // 오버레이 앱 열기 (딥링크)
  openOverlayApp() {
    try {
      window.open('lyrics-plus://overlay', '_blank');
      // 연결 확인 지연
      setTimeout(() => this.checkConnection(), 2000);
    } catch (e) {
      console.error('[OverlaySender] 앱 열기 실패:', e);
    }
  },

  // 오버레이 앱 다운로드 페이지
  getDownloadUrl() {
    return 'https://github.com/ivLis-Studio/lyrics-plus-overlay/releases/latest';
  },

  async sendToEndpoint(endpoint, data) {
    if (!this.enabled) return;

    try {
      const response = await fetch(`http://localhost:${this.PORT}${endpoint}`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(2000)
      });

      if (!this._isConnected && response.ok) {
        this.isConnected = true;
      }
    } catch (e) {
      if (this._isConnected) {
        this.isConnected = false;
      }
    }
  },

  // 현재 트랙의 싱크 오프셋 가져오기
  async getSyncOffset(uri) {
    let offset = 0;

    // 1. 전역 딜레이 설정
    if (typeof CONFIG !== 'undefined' && CONFIG.visual && typeof CONFIG.visual.delay === 'number') {
      offset += CONFIG.visual.delay;
    }

    // 2. TrackSyncDB에서 트랙별 오프셋
    try {
      if (typeof TrackSyncDB !== 'undefined' && TrackSyncDB.getOffset) {
        const dbOffset = await TrackSyncDB.getOffset(uri);
        if (dbOffset) offset += dbOffset;
      }
    } catch (e) { }

    // 3. localStorage 개별 트랙 딜레이
    try {
      const delayKey = `lyrics-delay:${uri}`;
      const delay = localStorage.getItem(delayKey);
      if (delay) offset += Number(delay);
    } catch (e) { }

    return -offset;
  },

  // 가사 전송 요청 순서 추적
  _reqId: 0,
  _lastReqId: 0,

  // 가사 전송
  async sendLyrics(trackInfo, lyrics, forceResend = false) {
    if (!trackInfo || !lyrics || !Array.isArray(lyrics)) return;
    if (!this.enabled) return;

    // 요청 ID 발급 (동기적으로 실행되어 순서 보장)
    const currentReqId = ++this._reqId;

    this._lastTrackInfo = trackInfo;
    this._lastLyrics = lyrics;

    const offset = await this.getSyncOffset(trackInfo.uri);

    // 비동기 작업 후, 더 최신 요청이 이미 처리되었는지 확인
    if (currentReqId < this._lastReqId) {
      console.log(`[OverlaySender] 오래된 요청 무시됨 (#${currentReqId} < #${this._lastReqId})`);
      return;
    }
    this._lastReqId = currentReqId;

    const lyricsHash = JSON.stringify(lyrics);

    if (!forceResend &&
      this.lastSentUri === trackInfo.uri &&
      this.lastSentLyrics === lyricsHash &&
      this.lastSentOffset === offset) {
      return;
    }

    this.lastSentUri = trackInfo.uri;
    this.lastSentLyrics = lyricsHash;
    this.lastSentOffset = offset;

    let albumArt = null;
    try {
      const imageUrl = Spicetify.Player.data?.item?.metadata?.image_xlarge_url;
      if (imageUrl && imageUrl.indexOf('localfile') === -1) {
        albumArt = `https://i.scdn.co/image/${imageUrl.substring(imageUrl.lastIndexOf(':') + 1)}`;
      }
    } catch (e) { }

    const mappedLines = lyrics.map(l => {
      // 원어 텍스트 (originalText가 있으면 사용, 없으면 text)
      const originalText = l.originalText || l.text || '';

      // 발음 텍스트 (text와 originalText가 다르면 text가 발음)
      const pronText = (l.text && l.text !== l.originalText && l.text !== originalText) ? l.text : null;

      // 번역 텍스트 - 여러 필드에서 찾기 (text2가 가장 우선)
      let transText = l.text2 || l.translation || l.translationText || null;
      // 빈 문자열이면 null로 처리
      if (transText && typeof transText === 'string' && transText.trim() === '') {
        transText = null;
      }
      // 원어와 같으면 표시할 필요 없음
      if (transText && transText === originalText) {
        transText = null;
      }

      return {
        startTime: (l.startTime || 0) + offset,
        endTime: l.endTime ? l.endTime + offset : null,
        text: originalText,
        pronText: pronText,
        transText: transText
      };
    });

    console.log('[OverlaySender] 가사 전송:', { lines: mappedLines.length, offset });

    await this.sendToEndpoint('/lyrics', {
      track: {
        title: trackInfo.title || Spicetify.Player.data?.item?.metadata?.title || '',
        artist: trackInfo.artist || Spicetify.Player.data?.item?.metadata?.artist_name || '',
        album: Spicetify.Player.data?.item?.metadata?.album_title || '',
        albumArt: albumArt,
        duration: Spicetify.Player.getDuration() || 0
      },
      lyrics: mappedLines,
      isSynced: lyrics.some(l => l.startTime !== undefined && l.startTime !== null)
    });
  },

  async resendWithNewOffset() {
    if (this._lastTrackInfo && this._lastLyrics) {
      console.log('[OverlaySender] 가사 재전송');
      await this.sendLyrics(this._lastTrackInfo, this._lastLyrics, true);
    }
  },

  _worker: null,

  startProgressSync() {
    if (this._worker) return;
    if (!this.enabled) return;

    // Web Worker로 타이머 실행 (백그라운드 스로틀링 방지)
    const blob = new Blob([`
      let interval = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (interval) clearInterval(interval);
          interval = setInterval(() => {
            self.postMessage('tick');
          }, 250);
        } else if (e.data === 'stop') {
          if (interval) clearInterval(interval);
          interval = null;
        }
      };
    `], { type: 'application/javascript' });

    this._worker = new Worker(URL.createObjectURL(blob));

    this._worker.onmessage = async () => {
      if (!this.enabled) return;
      if (this._isSendingProgress) return;

      // 연결되지 않았고 설정창도 안 열려있으면 진행률 전송 중단 (네트워크 보호)
      if (!this.isConnected && !this._isSettingsOpen) return;

      // 전역 딜레이 변경 체크
      if (typeof CONFIG !== 'undefined' && CONFIG.visual) {
        if (this.lastConfigDelay === undefined) {
          this.lastConfigDelay = CONFIG.visual.delay;
        }
        if (this.lastConfigDelay !== CONFIG.visual.delay) {
          this.lastConfigDelay = CONFIG.visual.delay;
          this.resendWithNewOffset();
        }
      }

      this._isSendingProgress = true;
      try {
        const position = Spicetify.Player.getProgress() || 0;
        const duration = Spicetify.Player.getDuration() || 0;
        const remaining = (duration - position) / 1000; // seconds

        // 다음 곡 정보 가져오기
        let nextTrack = null;
        try {
          const queue = Spicetify.Queue;
          if (queue?.nextTracks?.length > 0) {
            const next = queue.nextTracks[0];
            if (next?.contextTrack?.metadata) {
              const imageUrl = next.contextTrack.metadata.image_url || next.contextTrack.metadata.image_xlarge_url;
              let albumArt = null;
              if (imageUrl && imageUrl.indexOf('localfile') === -1) {
                if (imageUrl.startsWith('spotify:image:')) {
                  albumArt = `https://i.scdn.co/image/${imageUrl.substring(imageUrl.lastIndexOf(':') + 1)}`;
                } else if (imageUrl.startsWith('http')) {
                  albumArt = imageUrl;
                }
              }
              nextTrack = {
                title: next.contextTrack.metadata.title || '',
                artist: next.contextTrack.metadata.artist_name || '',
                albumArt: albumArt
              };
            }
          }
        } catch (e) { }

        await this.sendToEndpoint('/progress', {
          position: position,
          isPlaying: Spicetify.Player.isPlaying() || false,
          duration: duration,
          remaining: remaining,
          nextTrack: nextTrack
        });
      } finally {
        this._isSendingProgress = false;
      }
    };

    this._worker.postMessage('start');
  },

  stopProgressSync() {
    if (this._worker) {
      this._worker.terminate(); // 워커 완전히 종료
      this._worker = null;
    }
  },

  setupOffsetListener() {
    // localStorage 변경 감지
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('lyrics-delay:')) {
        this.resendWithNewOffset();
      }
    });

    // 커스텀 이벤트 리스너
    window.addEventListener('lyrics-plus:delay-changed', () => {
      this.resendWithNewOffset();
    });

    window.addEventListener('lyrics-plus:offset-changed', () => {
      this.resendWithNewOffset();
    });

    // 페이지 가시성 변경 감지 (최소화 복구 시 재전송)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.enabled) {
        console.log('[OverlaySender] 페이지 활성화 - 가사 재전송');
        setTimeout(() => this.resendWithNewOffset(), 200);
      }
    });

    // 창 포커스 시에도 재전송 (최소화 복구 대응)
    window.addEventListener('focus', () => {
      if (this.enabled && this._lastTrackInfo) {
        console.log('[OverlaySender] 창 포커스 - 가사 재전송');
        setTimeout(() => this.resendWithNewOffset(), 300);
      }
    });

    // 트랙 변경 감지 (Spicetify 이벤트)
    Spicetify.Player.addEventListener('songchange', () => {
      // 트랙 변경 시 캐시 초기화해서 새 트랙 가사 전송 준비
      this.lastSentUri = null;
      this.lastSentLyrics = null;
      this.lastSentOffset = null;
    });
  },

  // 초기화
  init() {
    if (this.enabled) {
      this.startProgressSync();
      this.setupOffsetListener();
      // 초기 연결 확인
      setTimeout(() => this.checkConnection(), 1000);
    }
  }
};

// 오버레이 전송 초기화
OverlaySender.init();
window.OverlaySender = OverlaySender;

/** @type {React} */
const react = Spicetify.React;
const { useState, useEffect, useCallback, useMemo, useRef } = react;

// Update Banner Component - Fluent Design Style
const UpdateBanner = ({ updateInfo, onDismiss }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const installCommand = Utils.getInstallCommand();
  const platformName = Utils.getPlatformName();

  const handleCopy = async () => {
    const success = await Utils.copyToClipboard(installCommand);
    if (success) {
      setCopied(true);
      Spicetify.showNotification(I18n.t("notifications.installCommandCopied"));
      setTimeout(() => setCopied(false), 2500);
    } else {
      Spicetify.showNotification(I18n.t("notifications.copyFailed"), true);
    }
  };

  return react.createElement(
    "div",
    {
      className: "lyrics-plus-update-banner",
      style: {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        margin: "12px 16px",
        backdropFilter: "blur(40px) saturate(180%)",
        WebkitBackdropFilter: "blur(40px) saturate(180%)",
        boxShadow:
          "0 8px 32px 0 rgba(0, 0, 0, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        animation: "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        position: "relative",
        zIndex: 100,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
    react.createElement(
      "div",
      {
        style: {
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        },
      },
      react.createElement(
        "div",
        { style: { flex: 1, minWidth: 0 } },
        react.createElement(
          "div",
          {
            style: {
              fontSize: "15px",
              fontWeight: "600",
              color: "rgba(255, 255, 255, 0.95)",
              marginBottom: "6px",
              letterSpacing: "-0.01em",
            },
          },
          I18n.t("notifications.updateAvailable")
        ),
        react.createElement(
          "div",
          {
            style: {
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.6)",
              lineHeight: "1.5",
            },
          },
          `${I18n.t("update.versionChange")} ${updateInfo.currentVersion} → ${updateInfo.latestVersion}`
        )
      ),
      react.createElement(
        "div",
        { style: { display: "flex", gap: "8px", alignItems: "center" } },
        react.createElement(
          "button",
          {
            onClick: () => setIsExpanded(!isExpanded),
            className: "lyrics-update-button-primary",
            style: {
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "rgba(255, 255, 255, 0.95)",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              backdropFilter: "blur(10px)",
              letterSpacing: "-0.01em",
            },
          },
          isExpanded ? I18n.t("update.collapse") : I18n.t("update.expand")
        ),
        react.createElement(
          "button",
          {
            onClick: onDismiss,
            className: "lyrics-update-button-close",
            style: {
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.5)",
              cursor: "pointer",
              fontSize: "20px",
              padding: "4px 8px",
              borderRadius: "6px",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              lineHeight: "1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
          },
          "×"
        )
      )
    ),
    isExpanded &&
    react.createElement(
      "div",
      {
        style: {
          padding: "0 20px 20px 20px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          animation: "expandDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        },
      },
      react.createElement(
        "div",
        { style: { marginTop: "16px" } },
        react.createElement(
          "div",
          {
            style: {
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.7)",
              marginBottom: "10px",
              fontWeight: "500",
            },
          },
          platformName
        ),
        react.createElement(
          "div",
          {
            style: {
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "12px 14px",
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.85)",
              wordBreak: "break-all",
              lineHeight: "1.6",
              marginBottom: "12px",
              userSelect: "all",
            },
          },
          installCommand
        )
      ),
      react.createElement(
        "div",
        { style: { display: "flex", gap: "8px", marginTop: "12px" } },
        react.createElement(
          "button",
          {
            onClick: handleCopy,
            className: "lyrics-update-button-secondary",
            disabled: copied,
            style: {
              flex: 1,
              background: copied
                ? "rgba(16, 185, 129, 0.15)"
                : "rgba(255, 255, 255, 0.08)",
              border: copied
                ? "1px solid rgba(16, 185, 129, 0.3)"
                : "1px solid rgba(255, 255, 255, 0.15)",
              color: copied
                ? "rgba(16, 185, 129, 1)"
                : "rgba(255, 255, 255, 0.9)",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: copied ? "default" : "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              letterSpacing: "-0.01em",
            },
          },
          copied ? I18n.t("update.copied") : I18n.t("update.copyCommand")
        ),
        react.createElement(
          "a",
          {
            href: updateInfo.releaseUrl,
            target: "_blank",
            rel: "noopener noreferrer",
            style: {
              flex: 1,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "rgba(255, 255, 255, 0.9)",
              padding: "10px 16px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              letterSpacing: "-0.01em",
            },
          },
          I18n.t("update.releaseNotes")
        )
      )
    )
  );
};
/** @type {import("react").ReactDOM | null} */
let reactDOM = Spicetify.ReactDOM;

function ensureReactDOM() {
  if (
    reactDOM &&
    (typeof reactDOM.render === "function" ||
      typeof reactDOM.createPortal === "function")
  ) {
    return reactDOM;
  }

  const resolved = window?.Spicetify?.ReactDOM || window?.ReactDOM || null;
  if (resolved && resolved !== reactDOM) {
    reactDOM = resolved;
    window.reactDOM = resolved;
  }

  return reactDOM;
}

window.lyricsPlusEnsureReactDOM = ensureReactDOM;
// Define a function called "render" to specify app entry point
// This function will be used to mount app to main view.
function render() {
  return react.createElement(LyricsContainer, null);
}

// Optimized utility functions with better error handling and performance
const APP_NAME = "lyrics-plus";

// IndexedDB for track sync offsets
const DB_NAME = "lyrics-plus-db";
const DB_VERSION = 1;
const STORE_NAME = "track-sync-offsets";

let dbInstance = null;

const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("[Lyrics Plus] IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log("[Lyrics Plus] IndexedDB initialized");
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
        console.log("[Lyrics Plus] IndexedDB object store created");
      }
    };
  });
};

const TrackSyncDB = {
  async getOffset(trackUri) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(trackUri);

        request.onsuccess = () => resolve(request.result || 0);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("[Lyrics Plus] Failed to get offset:", error);
      return 0;
    }
  },

  async setOffset(trackUri, offset) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(offset, trackUri);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("[Lyrics Plus] Failed to set offset:", error);
    }
  },

  async clearOffset(trackUri) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(trackUri);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("[Lyrics Plus] Failed to clear offset:", error);
    }
  },

  async getAllOffsets() {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAllKeys();

        request.onsuccess = () => {
          const keys = request.result;
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = () => {
            const values = getAllRequest.result;
            const result = {};
            keys.forEach((key, index) => {
              result[key] = values[index];
            });
            resolve(result);
          };

          getAllRequest.onerror = () => reject(getAllRequest.error);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("[Lyrics Plus] Failed to get all offsets:", error);
      return {};
    }
  },

  async importOffsets(offsetsObj) {
    try {
      const db = await initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        // Clear existing data first
        const clearRequest = store.clear();

        clearRequest.onsuccess = () => {
          // Add all new offsets
          Object.entries(offsetsObj).forEach(([trackUri, offset]) => {
            store.put(offset, trackUri);
          });
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error("[Lyrics Plus] Failed to import offsets:", error);
    }
  },
};

// Migrate from localStorage to IndexedDB
(async () => {
  try {
    const oldOffsets = localStorage.getItem("lyrics-plus:track-sync-offsets");
    if (oldOffsets) {
      console.log("[Lyrics Plus] Migrating track-sync-offsets to IndexedDB");
      const offsetsObj = JSON.parse(oldOffsets);
      await TrackSyncDB.importOffsets(offsetsObj);
      localStorage.removeItem("lyrics-plus:track-sync-offsets");
      console.log("[Lyrics Plus] Migration complete");
    }
  } catch (error) {
    console.error("[Lyrics Plus] Migration failed:", error);
  }
})();

const __storageKeys = localStorage.getItem(`${APP_NAME}:storage-keys`);
const StorageKeys = new Set(__storageKeys ? JSON.parse(__storageKeys) : []);
/**
 *
 * @param {string} newKey
 */
const saveStorageKeys = (newKey) => {
  if (typeof newKey !== "string") return;
  if (!newKey.startsWith(APP_NAME)) return;
  StorageKeys.add(newKey);
  try {
    localStorage.setItem(
      `${APP_NAME}:storage-keys`,
      JSON.stringify(Array.from(StorageKeys))
    );
  } catch (e) {
    console.error("Failed to save storage keys:", e);
  }
};
const StorageManager = {
  get(key, defaultVal = true) {
    saveStorageKeys(key);
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value === "true" : defaultVal;
    } catch (error) {
      return defaultVal;
    }
  },

  getPersisted(key) {
    saveStorageKeys(key);
    // Try Spicetify LocalStorage first (more reliable)
    try {
      const value = Spicetify?.LocalStorage?.get(key);
      if (typeof value === "string") return value;
    } catch (error) {
      // Error ignored
    }

    // Fallback to regular localStorage
    try {
      return localStorage.getItem(key);
    } catch (error) {
      // Error ignored
    }

    return null;
  },

  /**
   *
   * @deprecated Use saveConfig instead for unified saving
   */
  setPersisted(key, value) {
    saveStorageKeys(key);
    const stringValue = String(value);
    let success = false;

    // Try Spicetify LocalStorage first
    try {
      Spicetify?.LocalStorage?.set(key, stringValue);
      success = true;
    } catch (error) {
      // Error ignored
    }

    // Fallback to regular localStorage
    try {
      localStorage.setItem(key, stringValue);
      success = true;
    } catch (error) {
      // Error ignored
    }

    if (!success) {
      // Failed to persist data
    }
  },

  // Unified config save method to reduce duplication
  saveConfig(name, value) {
    saveStorageKeys(`${APP_NAME}:visual:${name}`);
    if (name === "gemini-api-key" || name === "gemini-api-key-romaji") {
      // Save sensitive keys to both storages for persistence
      this.setPersisted(`${APP_NAME}:visual:${name}`, value);
    } else if (name === "language") {
      // Language setting needs to be saved to both storages for I18n system
      this.setPersisted(`${APP_NAME}:visual:${name}`, value);
    } else {
      localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
    }
  },

  getItem(key) {
    saveStorageKeys(key);
    return localStorage.getItem(key);
  },
  setItem(key, value) {
    saveStorageKeys(key);
    return localStorage.setItem(key, value);
  },
  removeItem(key) {
    saveStorageKeys(key);
    return localStorage.removeItem(key);
  },
  getItemRaw(key) {
    return localStorage.getItem(key);
  },
  setItemRaw(key, value) {
    return localStorage.setItem(key, value);
  },
  removeItemRaw(key) {
    return localStorage.removeItem(key);
  },
  SpicetifyLocalStorageGet(key) {
    saveStorageKeys(key);
    return Spicetify.LocalStorage.get(key);
  },
  SpicetifyLocalStorageGetRaw(key) {
    return Spicetify.LocalStorage.get(key);
  },

  // Generate or retrieve client ID
  getClientId() {
    const CLIENT_ID_KEY = `${APP_NAME}:client-id`;
    let clientId = this.getItemRaw(CLIENT_ID_KEY);

    if (!clientId) {
      // Generate new UUID v4
      clientId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      // Save to both storages for persistence
      this.setPersisted(CLIENT_ID_KEY, clientId);
      console.log("[Lyrics Plus] Generated new Client ID:", clientId);
    }

    return clientId;
  },

  async exportConfig() {
    const config = {};
    const CLIENT_ID_KEY = `${APP_NAME}:client-id`;

    StorageKeys.forEach((key) => {
      // Client ID는 내보내기에서 제외
      if (key === CLIENT_ID_KEY) return;

      const val = StorageManager.getItem(key);
      if (val !== null) config[key] = val;
    });

    // IndexedDB의 track-sync-offsets를 포함
    const trackSyncOffsets = await TrackSyncDB.getAllOffsets();
    if (Object.keys(trackSyncOffsets).length > 0) {
      config["lyrics-plus:track-sync-offsets"] = JSON.stringify(trackSyncOffsets);
      console.log("[Lyrics Plus] Exporting track-sync-offsets from IndexedDB:", trackSyncOffsets);
    } else {
      console.log("[Lyrics Plus] No track-sync-offsets found in IndexedDB");
    }

    console.log("[Lyrics Plus] Exported config keys:", Object.keys(config));

    return config;
  },
  async importConfig(config) {
    const CLIENT_ID_KEY = `${APP_NAME}:client-id`;

    // track-sync-offsets를 IndexedDB로 가져오기
    if (config["lyrics-plus:track-sync-offsets"]) {
      try {
        const offsetsObj = JSON.parse(config["lyrics-plus:track-sync-offsets"]);
        await TrackSyncDB.importOffsets(offsetsObj);
        console.log("[Lyrics Plus] Imported track-sync-offsets to IndexedDB");
        delete config["lyrics-plus:track-sync-offsets"]; // localStorage에 저장하지 않음
      } catch (error) {
        console.error("[Lyrics Plus] Failed to import track-sync-offsets:", error);
      }
    }

    // Client ID가 있다면 삭제 (불러오기에서 제외)
    if (config[CLIENT_ID_KEY]) {
      delete config[CLIENT_ID_KEY];
      console.log("[Lyrics Plus] Client ID excluded from import");
    }

    // 나머지 설정을 localStorage에 저장
    Object.entries(config).forEach(([key, value]) => {
      StorageManager.setItemRaw(key, value);
      saveStorageKeys(key);
    });
  },
};

const KARAOKE = 0;
const SYNCED = 1;
const UNSYNCED = 2;

const CONFIG = {
  visual: {
    language:
      StorageManager.getItem("lyrics-plus:visual:language") || "ko",
    "playbar-button": StorageManager.get(
      "lyrics-plus:visual:playbar-button",
      false
    ),
    colorful: StorageManager.get("lyrics-plus:visual:colorful", false),
    "gradient-background": StorageManager.get(
      "lyrics-plus:visual:gradient-background"
    ),
    "background-brightness":
      StorageManager.getItem("lyrics-plus:visual:background-brightness") ||
      "30",
    "solid-background": StorageManager.get(
      "lyrics-plus:visual:solid-background",
      false
    ),
    "video-background": StorageManager.get(
      "lyrics-plus:visual:video-background",
      false
    ),
    "video-blur":
      StorageManager.getItem("lyrics-plus:visual:video-blur") || "5",
    "video-cover": StorageManager.get(
      "lyrics-plus:visual:video-cover",
      false
    ),
    "solid-background-color":
      StorageManager.getItem("lyrics-plus:visual:solid-background-color") ||
      "#1e3a8a",
    noise: StorageManager.get("lyrics-plus:visual:noise"),
    "background-color":
      StorageManager.getItem("lyrics-plus:visual:background-color") ||
      "var(--spice-main)",
    "active-color":
      StorageManager.getItem("lyrics-plus:visual:active-color") ||
      "var(--spice-text)",
    "inactive-color":
      StorageManager.getItem("lyrics-plus:visual:inactive-color") ||
      "rgba(var(--spice-rgb-subtext),0.5)",
    "highlight-color":
      StorageManager.getItem("lyrics-plus:visual:highlight-color") ||
      "var(--spice-button)",
    alignment:
      StorageManager.getItem("lyrics-plus:visual:alignment") || "center",
    "lines-before":
      StorageManager.getItem("lyrics-plus:visual:lines-before") || "0",
    "lines-after":
      StorageManager.getItem("lyrics-plus:visual:lines-after") || "2",
    "font-size": StorageManager.getItem("lyrics-plus:visual:font-size") || "32",
    "font-family":
      StorageManager.getItem("lyrics-plus:visual:font-family") ||
      "Pretendard Variable",
    "original-font-family":
      StorageManager.getItem("lyrics-plus:visual:original-font-family") ||
      "Pretendard Variable",
    "phonetic-font-family":
      StorageManager.getItem("lyrics-plus:visual:phonetic-font-family") ||
      "Pretendard Variable",
    "translation-font-family":
      StorageManager.getItem("lyrics-plus:visual:translation-font-family") ||
      "Pretendard Variable",
    "original-font-weight":
      StorageManager.getItem("lyrics-plus:visual:original-font-weight") ||
      "400",
    "original-font-size":
      StorageManager.getItem("lyrics-plus:visual:original-font-size") || "32",
    "translation-font-weight":
      StorageManager.getItem("lyrics-plus:visual:translation-font-weight") ||
      "300",
    "translation-font-size":
      StorageManager.getItem("lyrics-plus:visual:translation-font-size") ||
      "24",
    "translation-spacing":
      StorageManager.getItem("lyrics-plus:visual:translation-spacing") || "8",
    "phonetic-font-weight":
      StorageManager.getItem("lyrics-plus:visual:phonetic-font-weight") ||
      "400",
    "phonetic-font-size":
      StorageManager.getItem("lyrics-plus:visual:phonetic-font-size") || "20",
    "phonetic-opacity":
      StorageManager.getItem("lyrics-plus:visual:phonetic-opacity") || "70",
    "phonetic-spacing":
      StorageManager.getItem("lyrics-plus:visual:phonetic-spacing") || "4",
    "phonetic-hyphen-replace":
      StorageManager.getItem("lyrics-plus:visual:phonetic-hyphen-replace") || "keep",
    "original-letter-spacing":
      StorageManager.getItem("lyrics-plus:visual:original-letter-spacing") || "0",
    "phonetic-letter-spacing":
      StorageManager.getItem("lyrics-plus:visual:phonetic-letter-spacing") || "0",
    "translation-letter-spacing":
      StorageManager.getItem("lyrics-plus:visual:translation-letter-spacing") || "0",
    "furigana-font-weight":
      StorageManager.getItem("lyrics-plus:visual:furigana-font-weight") ||
      "300",
    "furigana-font-size":
      StorageManager.getItem("lyrics-plus:visual:furigana-font-size") || "14",
    "furigana-opacity":
      StorageManager.getItem("lyrics-plus:visual:furigana-opacity") || "80",
    "furigana-spacing":
      StorageManager.getItem("lyrics-plus:visual:furigana-spacing") || "2",
    "text-shadow-enabled": StorageManager.get(
      "lyrics-plus:visual:text-shadow-enabled",
      true
    ),
    "text-shadow-color":
      StorageManager.getItem("lyrics-plus:visual:text-shadow-color") ||
      "#000000",
    "text-shadow-opacity":
      StorageManager.getItem("lyrics-plus:visual:text-shadow-opacity") || "50",
    "text-shadow-blur":
      StorageManager.getItem("lyrics-plus:visual:text-shadow-blur") || "2",
    "original-opacity":
      StorageManager.getItem("lyrics-plus:visual:original-opacity") || "100",
    "translation-opacity":
      StorageManager.getItem("lyrics-plus:visual:translation-opacity") || "85",
    "translate:translated-lyrics-source":
      StorageManager.getItem(
        "lyrics-plus:visual:translate:translated-lyrics-source"
      ) || "geminiKo",
    "translate:display-mode":
      StorageManager.getItem("lyrics-plus:visual:translate:display-mode") ||
      "replace",
    "translate:detect-language-override":
      StorageManager.getItem(
        "lyrics-plus:visual:translate:detect-language-override"
      ) || "off",
    "translation-mode:english":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:english") ||
      "none",
    "translation-mode:japanese":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:japanese") ||
      "none",
    "translation-mode:korean":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:korean") ||
      "none",
    "translation-mode:chinese":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:chinese") ||
      "none",
    "translation-mode:russian":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:russian") ||
      "none",
    "translation-mode:vietnamese":
      StorageManager.getItem(
        "lyrics-plus:visual:translation-mode:vietnamese"
      ) || "none",
    "translation-mode:german":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:german") ||
      "none",
    "translation-mode:spanish":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:spanish") ||
      "none",
    "translation-mode:french":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:french") ||
      "none",
    "translation-mode:italian":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:italian") ||
      "none",
    "translation-mode:portuguese":
      StorageManager.getItem(
        "lyrics-plus:visual:translation-mode:portuguese"
      ) || "none",
    "translation-mode:dutch":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:dutch") ||
      "none",
    "translation-mode:polish":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:polish") ||
      "none",
    "translation-mode:turkish":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:turkish") ||
      "none",
    "translation-mode:arabic":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:arabic") ||
      "none",
    "translation-mode:hindi":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:hindi") ||
      "none",
    "translation-mode:thai":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:thai") ||
      "none",
    "translation-mode:indonesian":
      StorageManager.getItem(
        "lyrics-plus:visual:translation-mode:indonesian"
      ) || "none",
    "translation-mode:gemini":
      StorageManager.getItem("lyrics-plus:visual:translation-mode:gemini") ||
      "none",
    "translation-mode-2:english":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:english") ||
      "none",
    "translation-mode-2:japanese":
      StorageManager.getItem(
        "lyrics-plus:visual:translation-mode-2:japanese"
      ) || "none",
    "translation-mode-2:korean":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:korean") ||
      "none",
    "translation-mode-2:chinese":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:chinese") ||
      "none",
    "translation-mode-2:russian":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:russian") ||
      "none",
    "translation-mode-2:vietnamese":
      StorageManager.getItem(
        "lyrics-plus:visual:translation-mode-2:vietnamese"
      ) || "none",
    "translation-mode-2:german":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:german") ||
      "none",
    "translation-mode-2:spanish":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:spanish") ||
      "none",
    "translation-mode-2:french":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:french") ||
      "none",
    "translation-mode-2:italian":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:italian") ||
      "none",
    "translation-mode-2:portuguese":
      StorageManager.getItem(
        "lyrics-plus:visual:translation-mode-2:portuguese"
      ) || "none",
    "translation-mode-2:dutch":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:dutch") ||
      "none",
    "translation-mode-2:polish":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:polish") ||
      "none",
    "translation-mode-2:turkish":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:turkish") ||
      "none",
    "translation-mode-2:arabic":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:arabic") ||
      "none",
    "translation-mode-2:hindi":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:hindi") ||
      "none",
    "translation-mode-2:thai":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:thai") ||
      "none",
    "translation-mode-2:indonesian":
      StorageManager.getItem(
        "lyrics-plus:visual:translation-mode-2:indonesian"
      ) || "none",
    "translation-mode-2:gemini":
      StorageManager.getItem("lyrics-plus:visual:translation-mode-2:gemini") ||
      "none",
    "gemini-api-key":
      StorageManager.getPersisted("lyrics-plus:visual:gemini-api-key") || "",
    "gemini-api-key-romaji":
      StorageManager.getPersisted("lyrics-plus:visual:gemini-api-key-romaji") ||
      "",
    translate: StorageManager.get("lyrics-plus:visual:translate", false),
    "furigana-enabled": StorageManager.get(
      "lyrics-plus:visual:furigana-enabled",
      false
    ),
    "ja-detect-threshold":
      StorageManager.getItem("lyrics-plus:visual:ja-detect-threshold") || "40",
    "hans-detect-threshold":
      StorageManager.getItem("lyrics-plus:visual:hans-detect-threshold") ||
      "40",
    "fade-blur": StorageManager.get("lyrics-plus:visual:fade-blur"),
    "highlight-mode": StorageManager.get("lyrics-plus:visual:highlight-mode", false),
    "highlight-intensity":
      StorageManager.getItem("lyrics-plus:visual:highlight-intensity") || "70",
    "karaoke-bounce": StorageManager.get(
      "lyrics-plus:visual:karaoke-bounce",
      true
    ),
    "karaoke-mode-enabled": StorageManager.get(
      "lyrics-plus:visual:karaoke-mode-enabled",
      true
    ),
    // Prefetch settings
    "prefetch-enabled": StorageManager.get(
      "lyrics-plus:visual:prefetch-enabled",
      true
    ),
    "prefetch-video-enabled": StorageManager.get(
      "lyrics-plus:visual:prefetch-video-enabled",
      true
    ),
    // Community sync settings
    "community-sync-enabled": StorageManager.get(
      "lyrics-plus:visual:community-sync-enabled",
      true
    ),
    "community-sync-auto-apply": StorageManager.get(
      "lyrics-plus:visual:community-sync-auto-apply",
      true
    ),
    "community-sync-min-confidence":
      Number(StorageManager.getItem("lyrics-plus:visual:community-sync-min-confidence")) || 0.5,
    "community-sync-auto-submit": StorageManager.get(
      "lyrics-plus:visual:community-sync-auto-submit",
      false
    ),
    "fullscreen-key":
      StorageManager.getItem("lyrics-plus:visual:fullscreen-key") || "f12",
    "synced-compact": StorageManager.get("lyrics-plus:visual:synced-compact"),
    // 메타데이터 번역 (제목/아티스트)
    "translate-metadata": StorageManager.get(
      "lyrics-plus:visual:translate-metadata",
      false
    ),
    "translate-metadata-mode":
      StorageManager.getItem("lyrics-plus:visual:translate-metadata-mode") || "translated",
    // Fullscreen settings
    "fullscreen-two-column": StorageManager.get(
      "lyrics-plus:visual:fullscreen-two-column",
      true
    ),
    "fullscreen-layout-reverse": StorageManager.get(
      "lyrics-plus:visual:fullscreen-layout-reverse",
      false
    ),
    "fullscreen-show-album": StorageManager.get(
      "lyrics-plus:visual:fullscreen-show-album",
      true
    ),
    "fullscreen-show-info": StorageManager.get(
      "lyrics-plus:visual:fullscreen-show-info",
      true
    ),
    "fullscreen-center-when-no-lyrics": StorageManager.get(
      "lyrics-plus:visual:fullscreen-center-when-no-lyrics",
      true
    ),
    "fullscreen-album-size":
      StorageManager.getItem("lyrics-plus:visual:fullscreen-album-size") ||
      "400",
    "fullscreen-album-radius":
      StorageManager.getItem("lyrics-plus:visual:fullscreen-album-radius") ||
      "12",
    "fullscreen-title-size":
      StorageManager.getItem("lyrics-plus:visual:fullscreen-title-size") ||
      "48",
    "fullscreen-artist-size":
      StorageManager.getItem("lyrics-plus:visual:fullscreen-artist-size") ||
      "24",
    "fullscreen-lyrics-right-padding":
      Number(StorageManager.getItem("lyrics-plus:visual:fullscreen-lyrics-right-padding")) ||
      0,
    // Fullscreen UI elements
    "fullscreen-show-clock": StorageManager.get(
      "lyrics-plus:visual:fullscreen-show-clock",
      true
    ),
    "fullscreen-clock-size":
      Number(StorageManager.getItem("lyrics-plus:visual:fullscreen-clock-size")) ||
      48,
    "fullscreen-show-context": StorageManager.get(
      "lyrics-plus:visual:fullscreen-show-context",
      true
    ),
    "fullscreen-show-next-track": StorageManager.get(
      "lyrics-plus:visual:fullscreen-show-next-track",
      true
    ),
    "fullscreen-next-track-seconds":
      Number(StorageManager.getItem("lyrics-plus:visual:fullscreen-next-track-seconds")) ||
      15,
    "fullscreen-show-controls": StorageManager.get(
      "lyrics-plus:visual:fullscreen-show-controls",
      true
    ),
    "fullscreen-show-volume": StorageManager.get(
      "lyrics-plus:visual:fullscreen-show-volume",
      true
    ),
    "fullscreen-show-progress": StorageManager.get(
      "lyrics-plus:visual:fullscreen-show-progress",
      true
    ),
    "fullscreen-show-lyrics-progress": StorageManager.get(
      "lyrics-plus:visual:fullscreen-show-lyrics-progress",
      false
    ),
    // Fullscreen control styles
    "fullscreen-control-button-size":
      Number(StorageManager.getItem("lyrics-plus:visual:fullscreen-control-button-size")) ||
      36,
    "fullscreen-controls-background": StorageManager.get(
      "lyrics-plus:visual:fullscreen-controls-background",
      false
    ),
    // Fullscreen auto-hide
    "fullscreen-auto-hide-ui": StorageManager.get(
      "lyrics-plus:visual:fullscreen-auto-hide-ui",
      true
    ),
    "fullscreen-auto-hide-delay":
      Number(StorageManager.getItem("lyrics-plus:visual:fullscreen-auto-hide-delay")) ||
      3,
    // Browser fullscreen (monitor fill)
    "fullscreen-browser-fullscreen": StorageManager.get(
      "lyrics-plus:visual:fullscreen-browser-fullscreen",
      false
    ),

    delay: 0,
  },
  providers: {
    lrclib: {
      on: StorageManager.get("lyrics-plus:provider:lrclib:on"),
      get desc() { return window.I18n ? I18n.t("providerDescriptions.lrclib") : "Lyrics from lrclib.net"; },
      modes: [SYNCED, UNSYNCED],
    },
    ivlyrics: {
      on: StorageManager.get("lyrics-plus:provider:ivlyrics:on", true),
      get desc() { return window.I18n ? I18n.t("providerDescriptions.ivLyrics") : "Lyrics from ivLyrics API"; },
      modes: [KARAOKE, SYNCED, UNSYNCED],
    },
    spotify: {
      on: StorageManager.get("lyrics-plus:provider:spotify:on"),
      get desc() { return window.I18n ? I18n.t("providerDescriptions.spotify") : "Lyrics from Spotify"; },
      modes: [SYNCED, UNSYNCED],
    },
    local: {
      on: StorageManager.get("lyrics-plus:provider:local:on"),
      get desc() { return window.I18n ? I18n.t("providerDescriptions.cache") : "Cached lyrics"; },
      modes: [SYNCED, UNSYNCED],
    },
  },
  providersOrder: StorageManager.getItem("lyrics-plus:services-order"),
  get modes() { return window.I18n ? [I18n.t("modes.karaoke"), I18n.t("modes.synced"), I18n.t("modes.unsynced")] : ["Karaoke", "Synced", "Unsynced"]; },
  locked: StorageManager.getItem("lyrics-plus:lock-mode") || "-1",
};

try {
  CONFIG.providersOrder = JSON.parse(CONFIG.providersOrder);
  if (
    !Array.isArray(CONFIG.providersOrder) ||
    Object.keys(CONFIG.providers).length !== CONFIG.providersOrder.length
  ) {
    throw "";
  }
} catch {
  CONFIG.providersOrder = ["ivlyrics", "spotify", "lrclib", "local"];
  StorageManager.setItem(
    "lyrics-plus:services-order",
    JSON.stringify(CONFIG.providersOrder)
  );
}

CONFIG.locked = Number.parseInt(CONFIG.locked);
CONFIG.visual["lines-before"] = Number.parseInt(CONFIG.visual["lines-before"]);
CONFIG.visual["lines-after"] = Number.parseInt(CONFIG.visual["lines-after"]);
CONFIG.visual["font-size"] = Number.parseInt(CONFIG.visual["font-size"]);
CONFIG.visual["original-font-weight"] = Number.parseInt(
  CONFIG.visual["original-font-weight"]
);
CONFIG.visual["original-font-size"] = Number.parseInt(
  CONFIG.visual["original-font-size"]
);
CONFIG.visual["translation-font-weight"] = Number.parseInt(
  CONFIG.visual["translation-font-weight"]
);
CONFIG.visual["translation-font-size"] = Number.parseInt(
  CONFIG.visual["translation-font-size"]
);
CONFIG.visual["text-shadow-opacity"] = Number.parseInt(
  CONFIG.visual["text-shadow-opacity"]
);
CONFIG.visual["text-shadow-blur"] = Number.parseInt(
  CONFIG.visual["text-shadow-blur"]
);
CONFIG.visual["original-opacity"] = Number.parseInt(
  CONFIG.visual["original-opacity"]
);
CONFIG.visual["translation-opacity"] = Number.parseInt(
  CONFIG.visual["translation-opacity"]
);
CONFIG.visual["background-brightness"] = Number.parseInt(
  CONFIG.visual["background-brightness"]
);
CONFIG.visual["ja-detect-threshold"] = Number.parseInt(
  CONFIG.visual["ja-detect-threshold"]
);
CONFIG.visual["hans-detect-threshold"] = Number.parseInt(
  CONFIG.visual["hans-detect-threshold"]
);
CONFIG.visual["highlight-intensity"] = Number.parseInt(
  CONFIG.visual["highlight-intensity"]
);

let CACHE = {};

const emptyState = {
  karaoke: null,
  synced: null,
  unsynced: null,
  currentLyrics: null,
};

// Enhanced cache system with memory-efficient LRU and automatic cleanup
const CacheManager = {
  _cache: new Map(),
  _maxSize: 100, // Limit cache to 100 songs
  _ttl: 30 * 60 * 1000, // 30 minutes TTL
  _cleanupTimer: null,
  _statsEnabled: false,

  // Performance statistics
  _stats: {
    hits: 0,
    misses: 0,
    evictions: 0,
    cleanups: 0,
  },

  init() {
    // Start periodic cleanup to prevent memory leaks
    this._startPeriodicCleanup();

    // Listen for memory pressure events
    if ("memory" in performance) {
      this._setupMemoryPressureListener();
    }
  },

  get(key) {
    const item = this._cache.get(key);
    if (!item) {
      if (this._statsEnabled) this._stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiry) {
      this._cache.delete(key);
      if (this._statsEnabled) this._stats.misses++;
      return null;
    }

    // Update access time for LRU (move to end)
    this._cache.delete(key);
    item.lastAccessed = Date.now();
    this._cache.set(key, item);

    if (this._statsEnabled) this._stats.hits++;
    return item.data;
  },

  set(key, data) {
    // Clean up if cache is getting too large
    if (this._cache.size >= this._maxSize) {
      this._cleanupOldEntries();
    }

    this._cache.set(key, {
      data,
      expiry: Date.now() + this._ttl,
      lastAccessed: Date.now(),
      size: this._estimateSize(data),
    });
  },

  _cleanupOldEntries() {
    // LRU eviction - remove oldest entries
    const entries = Array.from(this._cache.entries());
    const toRemove = Math.floor(entries.length * 0.3); // Remove 30% to reduce frequent cleanups

    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    for (let i = 0; i < toRemove; i++) {
      this._cache.delete(entries[i][0]);
    }

    if (this._statsEnabled) {
      this._stats.evictions += toRemove;
      this._stats.cleanups++;
    }
  },

  _startPeriodicCleanup() {
    // Clean up expired entries every 5 minutes
    this._cleanupTimer = setInterval(() => {
      const now = Date.now();
      const keysToDelete = [];

      for (const [key, item] of this._cache.entries()) {
        if (now > item.expiry) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => this._cache.delete(key));

      if (this._statsEnabled && keysToDelete.length > 0) {
        this._stats.cleanups++;
      }
    }, 5 * 60 * 1000);
  },

  _setupMemoryPressureListener() {
    // Aggressive cleanup on memory pressure
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === "memory") {
              const { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit } =
                entry;
              const memoryUsage = usedJSHeapSize / jsHeapSizeLimit;

              // If memory usage > 80%, clear half the cache
              if (memoryUsage > 0.8) {
                this._aggressiveCleanup();
              }
            }
          }
        });
        observer.observe({ entryTypes: ["measure"] });
      } catch (error) {
        // Performance Observer not available
      }
    }
  },

  _aggressiveCleanup() {
    const entries = Array.from(this._cache.entries());
    const toRemove = Math.floor(entries.length * 0.5);

    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    for (let i = 0; i < toRemove; i++) {
      this._cache.delete(entries[i][0]);
    }
  },

  _estimateSize(data) {
    // Rough estimation of object size in bytes
    try {
      return JSON.stringify(data).length * 2; // 2 bytes per character (UTF-16)
    } catch {
      return 1000; // Default estimate
    }
  },

  clear() {
    this._cache.clear();
    if (this._cleanupTimer) {
      clearInterval(this._cleanupTimer);
      this._cleanupTimer = null;
    }
  },

  // Clear cache entries for a specific URI
  clearByUri(uri) {
    const keysToDelete = [];
    for (const [key] of this._cache) {
      if (key.includes(uri)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => this._cache.delete(key));
    return keysToDelete.length;
  },

  // Get cache statistics
  getStats() {
    const hitRate =
      (this._stats.hits / (this._stats.hits + this._stats.misses)) * 100;
    return {
      ...this._stats,
      hitRate: isNaN(hitRate) ? 0 : hitRate.toFixed(2),
      cacheSize: this._cache.size,
      maxSize: this._maxSize,
    };
  },

  enableStats() {
    this._statsEnabled = true;
  },
};

// Rate limiting utility
const RateLimiter = {
  _calls: new Map(),

  canMakeCall(key, maxCalls = 5, windowMs = 60000) {
    const now = Date.now();
    const calls = this._calls.get(key) || [];

    // Remove calls outside the window
    const validCalls = calls.filter((time) => now - time < windowMs);

    if (validCalls.length >= maxCalls) {
      return false;
    }

    validCalls.push(now);
    this._calls.set(key, validCalls);
    return true;
  },
};

// Prefetcher for next track elements (lyrics, phonetic, translation, video background)
const Prefetcher = {
  _prefetchCache: new Map(),
  _inflightRequests: new Map(),
  _lastPrefetchedUri: null,
  _prefetchDelay: 1500, // 1.5초 지연 후 프리페치 시작
  _prefetchTimer: null,
  _lyricsContainer: null, // LyricsContainer 참조

  /**
   * LyricsContainer 참조 설정
   */
  setLyricsContainer(container) {
    this._lyricsContainer = container;
  },

  /**
   * 다음 곡의 모든 요소를 미리 요청 (가사 → 번역/발음 → 영상 배경)
   * @param {Object} trackInfo - 트랙 정보 (uri, artist, title 등)
   * @param {number} mode - 가사 모드
   */
  async prefetchNextTrack(trackInfo, mode = -1) {
    if (!trackInfo?.uri) return;

    // 이미 프리페치된 곡이면 스킵
    if (this._lastPrefetchedUri === trackInfo.uri) return;

    // 이전 프리페치 타이머 취소
    if (this._prefetchTimer) {
      clearTimeout(this._prefetchTimer);
      this._prefetchTimer = null;
    }

    // 약간의 지연 후 프리페치 시작 (현재 곡 로딩에 영향을 주지 않도록)
    this._prefetchTimer = setTimeout(async () => {
      this._lastPrefetchedUri = trackInfo.uri;

      console.log(`[Prefetcher] Starting prefetch for: ${trackInfo.title}`);

      try {
        // 1단계: 가사 먼저 프리페치 (필수)
        const lyrics = await this._prefetchLyrics(trackInfo, mode);

        if (!lyrics || (!lyrics.synced && !lyrics.unsynced && !lyrics.karaoke)) {
          console.log(`[Prefetcher] No lyrics found for: ${trackInfo.title}`);
          return;
        }

        // 2단계: 가사 로드 완료 후 병렬로 번역/발음 및 영상 배경 프리페치
        const prefetchPromises = [];

        // 발음/번역 프리페치 (Gemini)
        if (CONFIG.visual["prefetch-enabled"] !== false) {
          prefetchPromises.push(this._prefetchTranslations(trackInfo, lyrics));
        }

        // 영상 배경 프리페치
        if (CONFIG.visual["video-background"] && CONFIG.visual["prefetch-video-enabled"] !== false) {
          prefetchPromises.push(this._prefetchVideoBackground(trackInfo.uri));
        }

        await Promise.allSettled(prefetchPromises);
        console.log(`[Prefetcher] Completed all prefetch for: ${trackInfo.title}`);
      } catch (error) {
        console.warn(`[Prefetcher] Prefetch failed:`, error);
      }
    }, this._prefetchDelay);
  },

  /**
   * 가사 프리페치
   */
  async _prefetchLyrics(trackInfo, mode) {
    const uri = trackInfo.uri;

    // 이미 CACHE에 있으면 반환
    if (CACHE[uri]) {
      console.log(`[Prefetcher] Lyrics already cached for: ${trackInfo.title}`);
      return CACHE[uri];
    }

    // 이미 요청 중이면 기존 요청 반환
    const inflightKey = `lyrics:${uri}`;
    if (this._inflightRequests.has(inflightKey)) {
      return this._inflightRequests.get(inflightKey);
    }

    const prefetchPromise = (async () => {
      try {
        console.log(`[Prefetcher] Fetching lyrics for: ${trackInfo.title}`);

        // LyricsContainer의 tryServices 사용
        if (this._lyricsContainer && typeof this._lyricsContainer.tryServices === 'function') {
          const resp = await this._lyricsContainer.tryServices(trackInfo, mode);

          if (resp.provider) {
            // 가사 캐시에 저장
            CACHE[resp.uri] = resp;
            console.log(`[Prefetcher] Lyrics cached for: ${trackInfo.title} (provider: ${resp.provider})`);
            return resp;
          }
        }

        return null;
      } catch (error) {
        console.warn(`[Prefetcher] Lyrics prefetch failed:`, error.message);
        return null;
      } finally {
        this._inflightRequests.delete(inflightKey);
      }
    })();

    this._inflightRequests.set(inflightKey, prefetchPromise);
    return prefetchPromise;
  },

  /**
   * Gemini 번역/발음 프리페치
   */
  async _prefetchTranslations(trackInfo, lyrics) {
    const uri = trackInfo.uri;
    const trackId = uri?.split(':')[2];  // spotify:track:XXXX -> XXXX
    const cacheKeyBase = `prefetch:translation:${uri}`;

    // 이미 캐시에 있으면 스킵
    if (this._prefetchCache.has(cacheKeyBase)) {
      console.log(`[Prefetcher] Translation already cached for: ${trackInfo.title}`);
      return;
    }

    // 이미 요청 중이면 기존 요청 반환
    if (this._inflightRequests.has(cacheKeyBase)) {
      return this._inflightRequests.get(cacheKeyBase);
    }

    const lyricsArray = lyrics.synced || lyrics.unsynced || lyrics.karaoke;
    if (!lyricsArray || lyricsArray.length === 0) return;

    // 언어 감지
    const detectedLanguage = Utils.detectLanguage(lyricsArray);
    if (!detectedLanguage) return;

    // 현재 설정된 display mode 확인
    let friendlyLanguage = null;
    try {
      friendlyLanguage = new Intl.DisplayNames(["en"], { type: "language" })
        .of(detectedLanguage.split("-")[0])
        ?.toLowerCase();
    } catch (error) {
      // ignore
    }

    const provider = CONFIG.visual["translate:translated-lyrics-source"];
    const modeKey = provider === "geminiKo" && !friendlyLanguage ? "gemini" : friendlyLanguage;
    const displayMode1 = CONFIG.visual[`translation-mode:${modeKey}`];
    const displayMode2 = CONFIG.visual[`translation-mode-2:${modeKey}`];

    // 번역/발음 모드가 설정되어 있지 않으면 스킵
    if ((!displayMode1 || displayMode1 === "none") && (!displayMode2 || displayMode2 === "none")) {
      return;
    }

    // Section header 제외한 텍스트 추출
    const allLines = lyricsArray.map((l) => l?.text || "").filter(Boolean);
    const nonSectionLines = allLines.filter((line) => !Utils.isSectionHeader(line));
    const text = nonSectionLines.join("\n");

    if (!text.trim()) return;

    // 발음이 필요한지, 번역이 필요한지 확인
    const needPhonetic = displayMode1 === "gemini_romaji" || displayMode2 === "gemini_romaji";
    const needTranslation = (displayMode1 && displayMode1 !== "none" && displayMode1 !== "gemini_romaji") ||
      (displayMode2 && displayMode2 !== "none" && displayMode2 !== "gemini_romaji");

    const prefetchPromise = (async () => {
      try {
        console.log(`[Prefetcher] Fetching translation for: ${trackInfo.title} (phonetic: ${needPhonetic}, translation: ${needTranslation})`);

        // CacheManager에도 저장 (getGeminiTranslation에서 사용)
        const processTranslationResult = (outText) => {
          if (!outText) return null;

          let lines;
          if (Array.isArray(outText)) {
            lines = outText;
          } else if (typeof outText === "string") {
            lines = outText.split("\n");
          } else {
            return null;
          }

          const originalNonSectionIndices = [];
          lyricsArray.forEach((line, i) => {
            const lineText = line?.text || "";
            if (!Utils.isSectionHeader(lineText) && lineText.trim() !== "") {
              originalNonSectionIndices.push(i);
            }
          });

          const cleanTranslationLines = lines.filter(
            (line) => line && line.trim() !== "" && !Utils.isSectionHeader(line.trim())
          );

          const mapped = lyricsArray.map((line, i) => {
            const originalText = line?.text || "";
            if (Utils.isSectionHeader(originalText)) {
              return { ...line, text: null, originalText };
            }
            if (originalText.trim() === "") {
              return { ...line, text: "", originalText };
            }
            const positionInNonSectionLines = originalNonSectionIndices.indexOf(i);
            const translatedText = cleanTranslationLines[positionInNonSectionLines]?.trim() || "";
            return { ...line, text: translatedText || line?.text || "", originalText };
          });

          return mapped;
        };

        // 발음 요청 (wantSmartPhonetic = true)
        if (needPhonetic) {
          try {
            const phoneticResponse = await Translator.callGemini({
              trackId,
              artist: trackInfo.artist,
              title: trackInfo.title,
              text,
              wantSmartPhonetic: true,
              provider: lyrics.provider,
              ignoreCache: false,
            });

            if (phoneticResponse.phonetic) {
              const mapped = processTranslationResult(phoneticResponse.phonetic);
              if (mapped) {
                CacheManager.set(`${uri}:gemini_romaji`, mapped);
                console.log(`[Prefetcher] Phonetic cached for: ${trackInfo.title}`);
              }
            }
          } catch (error) {
            console.warn(`[Prefetcher] Phonetic prefetch failed:`, error.message);
          }
        }

        // 번역 요청 (wantSmartPhonetic = false)
        if (needTranslation) {
          try {
            const translationResponse = await Translator.callGemini({
              trackId,
              artist: trackInfo.artist,
              title: trackInfo.title,
              text,
              wantSmartPhonetic: false,
              provider: lyrics.provider,
              ignoreCache: false,
            });

            if (translationResponse.vi) {
              const mapped = processTranslationResult(translationResponse.vi);
              if (mapped) {
                // mode1, mode2 중 번역이 필요한 것에 캐시 저장
                if (displayMode1 && displayMode1 !== "none" && displayMode1 !== "gemini_romaji") {
                  CacheManager.set(`${uri}:${displayMode1}`, mapped);
                }
                if (displayMode2 && displayMode2 !== "none" && displayMode2 !== "gemini_romaji") {
                  CacheManager.set(`${uri}:${displayMode2}`, mapped);
                }
                console.log(`[Prefetcher] Translation cached for: ${trackInfo.title}`);
              }
            }
          } catch (error) {
            console.warn(`[Prefetcher] Translation prefetch failed:`, error.message);
          }
        }

        // 결과를 프리페치 캐시에 저장 (완료 표시용)
        this._prefetchCache.set(cacheKeyBase, {
          lyricsArray,
          displayMode1,
          displayMode2,
          timestamp: Date.now(),
        });

        console.log(`[Prefetcher] Prefetch completed for: ${trackInfo.title}`);
        return true;
      } catch (error) {
        console.warn(`[Prefetcher] Translation prefetch failed:`, error.message);
        return null;
      } finally {
        this._inflightRequests.delete(cacheKeyBase);
      }
    })();

    this._inflightRequests.set(cacheKeyBase, prefetchPromise);
    return prefetchPromise;
  },

  /**
   * 영상 배경 정보 프리페치
   */
  async _prefetchVideoBackground(uri) {
    const trackId = uri.split(":")[2];
    const cacheKey = `prefetch:video:${trackId}`;

    // 이미 캐시에 있으면 스킵
    if (this._prefetchCache.has(cacheKey)) {
      console.log(`[Prefetcher] Video info already cached for trackId: ${trackId}`);
      return;
    }

    // 이미 요청 중이면 기존 요청 반환
    if (this._inflightRequests.has(cacheKey)) {
      return this._inflightRequests.get(cacheKey);
    }

    const prefetchPromise = (async () => {
      try {
        console.log(`[Prefetcher] Fetching video info for trackId: ${trackId}`);

        const userHash = Utils.getUserHash();
        const response = await fetch(`https://lyrics.api.ivl.is/lyrics/youtube?trackId=${trackId}&userHash=${userHash}`);
        const data = await response.json();

        if (data.success) {
          this._prefetchCache.set(cacheKey, {
            data: data.data,
            timestamp: Date.now(),
          });
          console.log(`[Prefetcher] Video info cached for trackId: ${trackId}`);
        }

        return data;
      } catch (error) {
        console.warn(`[Prefetcher] Video prefetch failed:`, error.message);
        return null;
      } finally {
        this._inflightRequests.delete(cacheKey);
      }
    })();

    this._inflightRequests.set(cacheKey, prefetchPromise);
    return prefetchPromise;
  },

  /**
   * 프리페치된 영상 배경 정보 가져오기
   */
  getVideoInfo(uri) {
    const trackId = uri.split(":")[2];
    const cacheKey = `prefetch:video:${trackId}`;
    const cached = this._prefetchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      return cached.data;
    }
    return null;
  },

  /**
   * 캐시 정리
   */
  clearCache() {
    this._prefetchCache.clear();
    this._inflightRequests.clear();
    this._lastPrefetchedUri = null;
  },

  /**
   * 오래된 캐시 항목 정리 (30분 이상)
   */
  cleanupOldEntries() {
    const now = Date.now();
    const maxAge = 30 * 60 * 1000;

    for (const [key, value] of this._prefetchCache) {
      if (now - value.timestamp > maxAge) {
        this._prefetchCache.delete(key);
      }
    }
  },
};

// 주기적으로 오래된 프리페치 캐시 정리 (10분마다)
setInterval(() => {
  Prefetcher.cleanupOldEntries();
}, 10 * 60 * 1000);

let lyricContainerUpdate;
let reloadLyrics;

const fontSizeLimit = { min: 16, max: 256, step: 4 };

const thresholdSizeLimit = { min: 0, max: 100, step: 5 };

class LyricsContainer extends react.Component {
  constructor() {
    super();
    this.state = {
      karaoke: null,
      synced: null,
      unsynced: null,
      currentLyrics: null,
      romaji: null,
      furigana: null,
      hiragana: null,
      hangul: null,
      romaja: null,
      katakana: null,
      cn: null,
      hk: null,
      tw: null,
      uri: "",
      provider: "",
      colors: {
        background: "",
        inactive: "",
      },
      tempo: "0.25s",
      explicitMode: -1,
      lockMode: CONFIG.locked,
      mode: -1,
      isLoading: false,
      versionIndex: 0,
      versionIndex2: 0,
      isFullscreen: false,
      isFADMode: false,
      isCached: false,
      language: null,
      isPhoneticLoading: false,
      isTranslationLoading: false,
      currentLyricIndex: 0,
      videoInfo: null,
      // 메타데이터 번역
      translatedMetadata: null,
    };
    this.currentTrackUri = "";
    this.nextTrackUri = "";
    this.availableModes = [];
    this.styleVariables = {};
    this.fullscreenContainer = document.createElement("div");
    this.fullscreenContainer.id = "lyrics-fullscreen-container";
    this.mousetrap = null;
    this.containerRef = react.createRef(null);
    this.translator = null;
    this.initMoustrap();
    // Cache last state
    this.languageOverride = CONFIG.visual["translate:detect-language-override"];
    this.reRenderLyricsPage = false;
    this.displayMode = null;

    // Prevent infinite render loops
    this.lastProcessedUri = null;
    this.lastProcessedMode = null;

    // Translation loading timers - separate for phonetic and translation
    this.phoneticLoadingTimer = null;
    this.translationLoadingTimer = null;

    // Mouse idle timer for auto-hiding controls
    this.mouseIdleTimer = null;
    this.isMouseActive = true;

    // Mouse event handlers for auto-hide controls (defined here so ref can use them)
    this._handleMouseMove = () => {
      this.isMouseActive = true;
      const container = this.containerRef.current;
      if (container) {
        container.classList.remove('controls-hidden');
      }

      // Clear existing timer
      if (this.mouseIdleTimer) {
        clearTimeout(this.mouseIdleTimer);
      }

      // Set new timer - hide after 3 seconds of inactivity
      this.mouseIdleTimer = setTimeout(() => {
        this.isMouseActive = false;
        const container = this.containerRef.current;
        if (container) {
          container.classList.add('controls-hidden');
        }
      }, 3000);
    };

    this._handleMouseLeave = () => {
      // Immediately hide when mouse leaves
      if (this.mouseIdleTimer) clearTimeout(this.mouseIdleTimer);
      this.isMouseActive = false;
      const container = this.containerRef.current;
      if (container) {
        container.classList.add('controls-hidden');
      }
    };

    // Bind regenerate translation method
    this.regenerateTranslation = this.regenerateTranslation.bind(this);
  }

  /**
   * 메타데이터 번역 요청 (제목/아티스트)
   * @param {string} uri - 트랙 URI
   * @param {string} title - 원본 제목
   * @param {string} artist - 원본 아티스트
   */
  async fetchMetadataTranslation(uri, title, artist) {
    // 메타데이터 번역 설정이 꺼져 있으면 스킵
    if (!CONFIG.visual["translate-metadata"]) {
      return;
    }

    const trackId = uri?.split(':')[2];
    if (!trackId || !title || !artist) {
      return;
    }

    try {
      const result = await Translator.translateMetadata({
        trackId,
        title,
        artist,
        ignoreCache: false,
      });

      // 현재 트랙이 여전히 같은지 확인
      if (this.currentTrackUri === uri && result) {
        this.setState({ translatedMetadata: result });
      }
    } catch (error) {
      console.warn('[Lyrics Plus] Metadata translation failed:', error);
    }
  }

  /**
   * 저장된 선택 영상 로드 (IndexedDB에서)
   * @param {string} trackUri - 트랙 URI
   */
  async loadSavedVideoForTrack(trackUri) {
    if (!trackUri) return;

    try {
      const savedVideo = await Utils.getSelectedVideo(trackUri);
      if (savedVideo && savedVideo.youtubeVideoId) {
        console.log(`[Lyrics Plus] Loading saved video for track: ${savedVideo.youtubeVideoId}`);
        this.setState({
          videoInfo: {
            youtubeVideoId: savedVideo.youtubeVideoId,
            youtubeTitle: savedVideo.youtubeTitle,
            captionStartTime: savedVideo.captionStartTime,
            communityEntryId: savedVideo.communityEntryId,
            isAutoGenerated: savedVideo.isAutoGenerated
          }
        });
      }
    } catch (error) {
      console.error('[Lyrics Plus] Failed to load saved video:', error);
    }
  }

  /**
   * 발음 로딩 상태를 시작합니다 (1초 후에 로딩 메시지 표시)
   */
  startPhoneticLoading() {
    this.clearPhoneticLoading();
    this.phoneticLoadingTimer = setTimeout(() => {
      this.setState({ isPhoneticLoading: true });
    }, 1000);
  }

  /**
   * 발음 로딩 상태를 종료합니다
   */
  clearPhoneticLoading() {
    if (this.phoneticLoadingTimer) {
      clearTimeout(this.phoneticLoadingTimer);
      this.phoneticLoadingTimer = null;
    }
    this.setState({ isPhoneticLoading: false });
  }

  /**
   * 번역 로딩 상태를 시작합니다 (1초 후에 로딩 메시지 표시)
   */
  startTranslationLoading() {
    this.clearTranslationLoading();
    this.translationLoadingTimer = setTimeout(() => {
      this.setState({ isTranslationLoading: true });
    }, 1000);
  }

  /**
   * 번역 로딩 상태를 종료합니다
   */
  clearTranslationLoading() {
    if (this.translationLoadingTimer) {
      clearTimeout(this.translationLoadingTimer);
      this.translationLoadingTimer = null;
    }
    this.setState({ isTranslationLoading: false });
  }

  /**
   * 번역 재생성 메서드 - ignore_cache를 true로 설정하여 새로운 번역 요청
   */
  async regenerateTranslation() {
    // 번역이 활성화되어 있는지 확인
    const provider = CONFIG.visual["translate:translated-lyrics-source"];

    if (!provider || provider === "none") {
      return;
    }

    // 현재 가사가 있는지 확인
    if (!this.state.currentLyrics || this.state.currentLyrics.length === 0) {
      Spicetify.showNotification(I18n.t("notifications.noLyricsLoaded"), true, 2000);
      return;
    }

    const originalLanguage = this.provideLanguageCode(this.state.currentLyrics);
    const friendlyLanguage =
      originalLanguage &&
      new Intl.DisplayNames(["en"], { type: "language" })
        .of(originalLanguage.split("-")[0])
        ?.toLowerCase();
    const modeKey =
      provider === "geminiKo" && !friendlyLanguage
        ? "gemini"
        : friendlyLanguage;
    const mode1 = CONFIG.visual[`translation-mode:${modeKey}`];
    const mode2 = CONFIG.visual[`translation-mode-2:${modeKey}`];

    // Gemini 번역인지 확인
    const isGeminiMode =
      mode1?.startsWith("gemini") || mode2?.startsWith("gemini");

    if (!isGeminiMode) {
      Spicetify.showNotification(
        I18n.t("notifications.translationRegenerateGeminiOnly"),
        true,
        3000
      );
      return;
    }

    // 발음과 번역 중 어떤 것이 필요한지 확인
    const needPhonetic = mode1 === "gemini_romaji" || mode2 === "gemini_romaji";
    const needTranslation = mode1 === "gemini_ko" || mode2 === "gemini_ko";

    // trackId 가져오기
    const trackId = Spicetify.Player.data?.item?.uri?.split(':')[2];
    if (!trackId) {
      Spicetify.showNotification("No track playing", true, 2000);
      return;
    }

    try {
      this.startTranslationLoading();

      Spicetify.showNotification(I18n.t("notifications.regeneratingTranslation"), false, 2000);

      // 먼저 로컬 캐시에서 해당 트랙의 번역 캐시 삭제
      const userLang = I18n.getCurrentLanguage();
      try {
        // 번역 캐시 삭제 (발음과 번역 모두)
        await Promise.all([
          LyricsCache.clearTranslationForTrack(trackId),
        ]);
        // 메모리 캐시도 초기화
        Translator.clearMemoryCache(trackId);
        Translator.clearInflightRequests(trackId);
        console.log(`[regenerateTranslation] Cleared local cache for ${trackId}`);
      } catch (e) {
        console.warn('[regenerateTranslation] Failed to clear cache:', e);
      }

      // 원본 가사 가져오기 (번역되지 않은 원문)
      const lyricsState = this.state;
      const currentMode = this.getCurrentMode();

      // 원본 가사를 가져오기 위해 synced, karaoke, unsynced 중 현재 모드에 해당하는 것 사용
      let originalLyrics = [];
      if (currentMode === KARAOKE && this.state.karaoke) {
        originalLyrics = this.state.karaoke;
      } else if (currentMode === SYNCED && this.state.synced) {
        originalLyrics = this.state.synced;
      } else if (currentMode === UNSYNCED && this.state.unsynced) {
        originalLyrics = this.state.unsynced;
      } else {
        // fallback: currentLyrics에서 originalText 사용
        originalLyrics = this.state.currentLyrics || [];
      }

      // Section line 제거하고 원문 텍스트만 추출 (getGeminiTranslation과 동일)
      const allLines = originalLyrics.map((l) => l?.text || "").filter(Boolean);
      const nonSectionLines = allLines.filter(
        (line) => !Utils.isSectionHeader(line)
      );
      const text = nonSectionLines.join("\n");

      // 발음과 번역을 별도로 요청 (둘 다 필요한 경우)
      let phoneticResponse = null;
      let translationResponse = null;

      // 발음 요청 (gemini_romaji)
      if (needPhonetic) {
        phoneticResponse = await Translator.callGemini({
          trackId,
          artist: this.state.artist || lyricsState.artist,
          title: this.state.title || lyricsState.title,
          text,
          wantSmartPhonetic: true,
          provider: lyricsState.provider,
          ignoreCache: true,
        });
      }

      // 번역 요청 (gemini_ko)
      if (needTranslation) {
        translationResponse = await Translator.callGemini({
          trackId,
          artist: this.state.artist || lyricsState.artist,
          title: this.state.title || lyricsState.title,
          text,
          wantSmartPhonetic: false,
          provider: lyricsState.provider,
          ignoreCache: true,
        });
      }

      // 번역 결과를 getGeminiTranslation과 동일한 방식으로 처리하는 함수
      const processTranslationResult = (outText, lyrics) => {
        if (!outText) return null;

        // Handle both array and string formats
        let lines;
        if (Array.isArray(outText)) {
          lines = outText;
        } else if (typeof outText === "string") {
          lines = outText.split("\n");
        } else {
          return null;
        }

        // Create mapping arrays for proper alignment
        const originalNonSectionLines = [];
        const originalNonSectionIndices = [];

        // Collect non-section lines from original lyrics (excluding empty lines)
        lyrics.forEach((line, i) => {
          const text = line?.text || "";
          if (!Utils.isSectionHeader(text) && text.trim() !== "") {
            originalNonSectionLines.push(text);
            originalNonSectionIndices.push(i);
          }
        });

        // Filter out section headers and empty lines from translation results
        const cleanTranslationLines = lines.filter(
          (line) =>
            line && line.trim() !== "" && !Utils.isSectionHeader(line.trim())
        );

        // Use the clean translation lines for mapping
        lines = cleanTranslationLines;

        // Smart mapping that accounts for section headers and empty lines
        const mapped = lyrics.map((line, i) => {
          const originalText = line?.text || "";

          // If this is a section header, keep original and don't show translation
          if (Utils.isSectionHeader(originalText)) {
            return {
              ...line,
              text: null,
              originalText: originalText,
            };
          }

          // If this is an empty line, keep it empty
          if (originalText.trim() === "") {
            return {
              ...line,
              text: "",
              originalText: originalText,
            };
          }

          // Find the translation index for this non-section, non-empty line
          const positionInNonSectionLines =
            originalNonSectionIndices.indexOf(i);
          const translatedText = lines[positionInNonSectionLines]?.trim() || "";

          return {
            ...line,
            text: translatedText || line?.text || "",
            originalText: originalText,
          };
        });

        return mapped;
      };

      // mode1과 mode2 각각 처리 - 둘 다 활성화된 경우 각각의 결과를 올바르게 할당
      let translatedLyrics1 = null;
      let translatedLyrics2 = null;

      // mode1 처리
      if (mode1 === "gemini_romaji" && phoneticResponse?.phonetic) {
        translatedLyrics1 = processTranslationResult(phoneticResponse.phonetic, originalLyrics);
      } else if (mode1 === "gemini_ko" && translationResponse?.vi) {
        translatedLyrics1 = processTranslationResult(translationResponse.vi, originalLyrics);
      }

      // mode2 처리 (mode1과 독립적으로)
      if (mode2 === "gemini_romaji" && phoneticResponse?.phonetic) {
        translatedLyrics2 = processTranslationResult(phoneticResponse.phonetic, originalLyrics);
      } else if (mode2 === "gemini_ko" && translationResponse?.vi) {
        translatedLyrics2 = processTranslationResult(translationResponse.vi, originalLyrics);
      }

      // _dmResults에 번역 결과 저장
      const currentUri = this.state.uri;
      if (!this._dmResults) {
        this._dmResults = {};
      }
      if (!this._dmResults[currentUri]) {
        this._dmResults[currentUri] = {};
      }

      // mode1과 mode2 결과 저장
      this._dmResults[currentUri].mode1 = translatedLyrics1;
      this._dmResults[currentUri].mode2 = translatedLyrics2;
      this._dmResults[currentUri].lastMode1 = mode1;
      this._dmResults[currentUri].lastMode2 = mode2;

      // CacheManager에도 새 결과 저장 (getGeminiTranslation에서 캐시 히트하도록)
      if (translatedLyrics1 && mode1) {
        CacheManager.set(`${currentUri}:${mode1}`, translatedLyrics1);
      }
      if (translatedLyrics2 && mode2) {
        CacheManager.set(`${currentUri}:${mode2}`, translatedLyrics2);
      }

      // lyricsSource를 다시 호출하여 기존 로직으로 화면 업데이트
      // 이렇게 하면 optimizeTranslations이 호출되어 사용자 설정에 따라 번역이 표시됨
      this.lyricsSource(this.state, currentMode);
      Spicetify.showNotification(I18n.t("notifications.translationRegenerated"), false, 2000);
    } catch (error) {
      Spicetify.showNotification(
        `${I18n.t("notifications.translationRegenerateFailed")}: ${error.message}`,
        true,
        3000
      );
    } finally {
      this.clearTranslationLoading();
    }
  }

  infoFromTrack(track) {
    const meta = track?.metadata;
    if (!meta) {
      return null;
    }
    return {
      duration: Number(meta.duration),
      album: meta.album_title,
      artist: meta.artist_name,
      title: meta.title,
      uri: track.uri,
      image: meta.image_url,
    };
  }

  async fetchColors(uri) {
    let vibrant = 0;
    try {
      try {
        const { fetchExtractedColorForTrackEntity } =
          Spicetify.GraphQL.Definitions;
        const { data } = await Spicetify.GraphQL.Request(
          fetchExtractedColorForTrackEntity,
          { uri }
        );
        const { hex } =
          data.trackUnion.albumOfTrack.coverArt.extractedColors.colorDark;
        vibrant = Number.parseInt(hex.replace("#", ""), 16);
      } catch {
        const colors = await Spicetify.CosmosAsync.get(
          `https://spclient.wg.spotify.com/colorextractor/v1/extract-presets?uri=${uri}&format=json`
        );
        vibrant = colors.entries[0].color_swatches.find(
          (color) => color.preset === "VIBRANT_NON_ALARMING"
        ).color;
      }
    } catch {
      vibrant = 8747370;
    }

    this.setState({
      colors: {
        background: Utils.convertIntToRGB(vibrant),
        inactive: Utils.convertIntToRGB(vibrant, 3),
      },
    });
  }

  async fetchTempo(uri) {
    const audio = await Spicetify.CosmosAsync.get(
      `https://api.spotify.com/v1/audio-features/${uri.split(":")[2]}`
    );
    let tempo = audio.tempo;

    const MIN_TEMPO = 60;
    const MAX_TEMPO = 150;
    const MAX_PERIOD = 0.4;
    if (!tempo) tempo = 105;
    if (tempo < MIN_TEMPO) tempo = MIN_TEMPO;
    if (tempo > MAX_TEMPO) tempo = MAX_TEMPO;

    let period =
      MAX_PERIOD - ((tempo - MIN_TEMPO) / (MAX_TEMPO - MIN_TEMPO)) * MAX_PERIOD;
    period = Math.round(period * 100) / 100;

    this.setState({
      tempo: `${String(period)}s`,
    });
  }

  async tryServices(trackInfo, mode = -1) {
    const currentMode = CONFIG.modes[mode] || "";
    let finalData = { ...emptyState, uri: trackInfo.uri };
    for (const id of CONFIG.providersOrder) {
      const service = CONFIG.providers[id];
      if (!service.on) continue;
      if (mode !== -1 && !service.modes.includes(mode)) continue;

      let data;
      try {
        data = await Providers[id](trackInfo);
      } catch (e) {
        continue;
      }

      if (data.error || (!data.karaoke && !data.synced && !data.unsynced))
        continue;
      if (mode === -1) {
        finalData = data;
        return finalData;
      }

      if (!data[currentMode]) {
        for (const key in data) {
          if (!finalData[key]) {
            finalData[key] = data[key];
          }
        }
        continue;
      }

      for (const key in data) {
        if (!finalData[key]) {
          finalData[key] = data[key];
        }
      }

      if (
        data.provider !== "local" &&
        finalData.provider &&
        finalData.provider !== data.provider
      ) {
        const styledMode =
          currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
        finalData.copyright = `${styledMode} lyrics provided by ${data.provider
          }\n${finalData.copyright || ""}`.trim();
      }

      return finalData;
    }

    return finalData;
  }

  async fetchLyrics(track, mode = -1, refresh = false) {
    try {
      const info = this.infoFromTrack(track);
      if (!info) {
        this.setState({ error: "No track info", isLoading: false });
        return;
      }

      // keep artist/title for prompts
      this.setState({ artist: info.artist, title: info.title, coverUrl: info.image, translatedMetadata: null });

      // 메타데이터 번역 요청 (백그라운드에서 비동기로)
      this.fetchMetadataTranslation(info.uri, info.title, info.artist);

      let isCached = this.lyricsSaved(info.uri);

      if (CONFIG.visual.colorful || CONFIG.visual["gradient-background"]) {
        this.fetchColors(info.uri);
      }

      this.fetchTempo(info.uri);
      this.resetDelay();

      let tempState;
      // if lyrics are cached
      if (
        (mode === -1 && CACHE[info.uri]) ||
        CACHE[info.uri]?.[CONFIG.modes?.[mode]]
      ) {
        tempState = { ...CACHE[info.uri], isCached };
        if (CACHE[info.uri]?.mode) {
          this.state.explicitMode = CACHE[info.uri]?.mode;
          tempState = { ...tempState, mode: CACHE[info.uri]?.mode };
        }
      } else {
        // Save current mode before loading to maintain UI consistency
        const currentMode = this.getCurrentMode();
        this.lastModeBeforeLoading = currentMode !== -1 ? currentMode : SYNCED;
        this.setState({ ...emptyState, isLoading: true, isCached: false });

        const resp = await this.tryServices(info, mode);
        if (resp.provider) {
          // Cache lyrics
          CACHE[resp.uri] = resp;
        }

        // This True when the user presses the Cache Lyrics button and saves it to localStorage.
        isCached = this.lyricsSaved(resp.uri);

        // In case user skips tracks too fast and multiple callbacks
        // set wrong lyrics to current track.
        if (resp.uri === this.currentTrackUri) {
          tempState = { ...resp, isLoading: false, isCached };
        } else {
          return;
        }
      }

      // Check if lyrics indicate no lyrics / instrumental
      // Conditions: 
      // 1. Total lines <= 3
      // 2. First line contains "no lyrics" or "instrumental"
      const checkNoLyrics = (lyrics) => {
        if (!lyrics || lyrics.length === 0) return false;
        if (lyrics.length > 3) return false;

        // Check first non-empty line
        const firstLine = lyrics[0]?.text?.toLowerCase()?.trim() || '';
        if (firstLine.includes('no lyrics') || firstLine.includes('instrumental')) {
          return true;
        }

        // Also check if all lines combined contain these keywords
        const allText = lyrics.map(line => line.text || '').join(' ').toLowerCase();
        if (allText.includes('no lyrics') || allText.includes('instrumental')) {
          return true;
        }

        return false;
      };

      // If all lyrics types indicate no lyrics, treat as instrumental
      const isInstrumental =
        checkNoLyrics(tempState.karaoke) ||
        checkNoLyrics(tempState.synced) ||
        checkNoLyrics(tempState.unsynced);

      if (isInstrumental) {
        tempState = {
          ...tempState,
          karaoke: null,
          synced: null,
          unsynced: null,
          error: "Instrumental"
        };
      }

      let finalMode = mode;
      if (mode === -1) {
        if (this.state.explicitMode !== -1) {
          finalMode = this.state.explicitMode;
        } else if (this.state.lockMode !== -1) {
          finalMode = this.state.lockMode;
        } else {
          // Auto switch: prefer karaoke, then synced, then unsynced
          if (tempState.karaoke) {
            finalMode = KARAOKE;
          } else if (tempState.synced) {
            finalMode = SYNCED;
          } else if (tempState.unsynced) {
            finalMode = UNSYNCED;
          }
        }
      }

      // if song changed one time
      if (tempState.uri !== this.state.uri || refresh) {
        // Detect language from the new lyrics data
        let defaultLanguage = null;
        if (tempState.synced) {
          defaultLanguage = Utils.detectLanguage(tempState.synced);
        } else if (tempState.unsynced) {
          defaultLanguage = Utils.detectLanguage(tempState.unsynced);
        }

        // reset and apply - preserve cached translations if available
        this.setState({
          furigana: null,
          romaji: null,
          hiragana: null,
          katakana: null,
          hangul: null,
          romaja: null,
          cn: null,
          hk: null,
          tw: null,
          ...tempState,
          language: defaultLanguage,
          ...this.applyTranslationStates(tempState),
        });
        return;
      }

      // Preserve cached translations when not changing songs
      this.setState({
        ...tempState,
        ...this.applyTranslationStates(tempState),
      });
    } catch (error) {
      this.setState({
        error: `Failed to fetch lyrics: ${error.message}`,
        isLoading: false,
        ...emptyState,
      });
    }
  }

  lyricsSource(lyricsState, mode) {
    if (!lyricsState) return;

    let lyrics = lyricsState[CONFIG.modes[mode]];
    // Fallback: if the preferred mode has no lyrics, use any available lyrics
    if (!lyrics) {
      lyrics =
        lyricsState.karaoke ||
        lyricsState.synced ||
        lyricsState.unsynced ||
        null;
      if (!lyrics) {
        this.setState({ currentLyrics: [] });
        // 오버레이에 가사 없음 상태 전송 (트랙 정보 업데이트용)
        if (typeof OverlaySender !== 'undefined') {
          OverlaySender.sendLyrics(
            { uri: lyricsState.uri, title: this.state.title, artist: this.state.artist },
            []
          );
        }
        return;
      }
    }

    // Clean up any existing progress flags from previous songs
    const currentUri = lyricsState.uri;
    if (this.lastCleanedUri !== currentUri) {
      // Remove all progress flags
      Object.keys(this).forEach((key) => {
        if (key.includes(":inProgress")) {
          delete this[key];
        }
      });
      // Reset per-track progressive results and inflight maps
      this._dmResults = {};
      this._inflightGemini = new Map();
      this.lastCleanedUri = currentUri;
    }

    // Handle translation and display modes efficiently
    const originalLanguage = this.provideLanguageCode(lyrics);
    let friendlyLanguage = null;

    if (originalLanguage) {
      try {
        friendlyLanguage = new Intl.DisplayNames(["en"], { type: "language" })
          .of(originalLanguage.split("-")[0])
          ?.toLowerCase();
      } catch (error) {
        // Error ignored
      }
    }

    // For Gemini mode, use generic keys if no specific language detected
    const provider = CONFIG.visual["translate:translated-lyrics-source"];
    const modeKey =
      provider === "geminiKo" && !friendlyLanguage
        ? "gemini"
        : friendlyLanguage;

    const displayMode1 = CONFIG.visual[`translation-mode:${modeKey}`];
    const displayMode2 = CONFIG.visual[`translation-mode-2:${modeKey}`];

    this.language = originalLanguage;
    this.displayMode = displayMode1; // Keep for legacy compatibility
    this.displayMode2 = displayMode2;

    const processMode = async (mode, baseLyrics) => {
      if (!mode || mode === "none") {
        console.log("[processMode] Mode is none or empty:", mode);
        return null;
      }
      console.log("[processMode] Processing mode:", mode);
      try {
        if (String(mode).startsWith("gemini")) {
          const result = await this.getGeminiTranslation(
            lyricsState,
            baseLyrics,
            mode
          );
          console.log("[processMode] Gemini result sample:", result?.[0]);
          return result;
        } else {
          return await this.getTraditionalConversion(
            lyricsState,
            baseLyrics,
            originalLanguage,
            mode
          );
        }
      } catch (error) {
        const modeDisplayName =
          mode === "gemini_romaji"
            ? "Romaji, Romaja, Pinyin translation"
            : "Korean translation";
        Spicetify.showNotification(
          `${modeDisplayName} failed: ${error.message || "Unknown error"}`,
          true,
          4000
        );
        return null; // Return null on failure
      }
    };

    const { uri } = lyricsState; // Capture the URI for this specific request

    // If no display modes are active, just optimize the original lyrics (e.g., to handle note lines)
    if (
      (!displayMode1 || displayMode1 === "none") &&
      (!displayMode2 || displayMode2 === "none")
    ) {
      const optimizedLyrics = this.optimizeTranslations(
        lyrics,
        null,
        null,
        null,
        null
      );
      const finalLyrics = Array.isArray(optimizedLyrics) ? optimizedLyrics : [];
      this.setState({
        currentLyrics: finalLyrics,
      });
      // 🔹 lyrics-plus-overlay 앱으로 원문 가사 전송 (번역 모드 미사용)
      if (typeof OverlaySender !== 'undefined') {
        OverlaySender.sendLyrics(
          { uri, title: this.state.title, artist: this.state.artist },
          finalLyrics
        );
      }
      return;
    }

    // 즉시 원문 표시 - 번역이 로딩되는 동안에도 사용자가 가사를 볼 수 있도록
    // URI 체크: 곡이 변경되지 않았을 때만 표시
    if (this.state.uri === uri) {
      const optimizedOriginal = this.optimizeTranslations(
        lyrics,
        null,
        null,
        null,
        null
      );
      const originalLyrics = Array.isArray(optimizedOriginal) ? optimizedOriginal : [];
      this.setState({
        currentLyrics: originalLyrics,
      });
      // 🔹 lyrics-plus-overlay 앱으로 원문 가사 먼저 전송 (번역 로딩 전)
      if (typeof OverlaySender !== 'undefined') {
        OverlaySender.sendLyrics(
          { uri, title: this.state.title, artist: this.state.artist },
          originalLyrics
        );
      }
    }

    // Progressive loading: keep results per track so Mode 1 does not disappear when Mode 2 finishes
    // Check if display modes changed - if so, clear cached results
    if (this._dmResults[currentUri]) {
      const cached = this._dmResults[currentUri];
      // If mode settings changed, invalidate cache for that mode
      if (cached.lastMode1 !== displayMode1) {
        cached.mode1 = null;
      }
      if (cached.lastMode2 !== displayMode2) {
        cached.mode2 = null;
      }
    }

    this._dmResults[currentUri] = this._dmResults[currentUri] || {
      mode1: null,
      mode2: null,
    };
    this._dmResults[currentUri].lastMode1 = displayMode1;
    this._dmResults[currentUri].lastMode2 = displayMode2;

    let lyricsMode1 = this._dmResults[currentUri].mode1;
    let lyricsMode2 = this._dmResults[currentUri].mode2;

    const updateCombinedLyrics = () => {
      // Guard clause to prevent race conditions from previous songs
      if (this.state.uri !== uri) {
        return;
      }
      console.log(
        "[updateCombinedLyrics] Mode1 data:",
        lyricsMode1 ? "present" : "null"
      );
      console.log(
        "[updateCombinedLyrics] Mode2 data:",
        lyricsMode2 ? "present" : "null"
      );
      // Smart deduplication and optimization - pass display modes
      const optimizedTranslations = this.optimizeTranslations(
        lyrics,
        lyricsMode1,
        lyricsMode2,
        lyricsMode1 ? displayMode1 : null,
        lyricsMode2 ? displayMode2 : null
      );
      const finalLyrics = Array.isArray(optimizedTranslations)
        ? optimizedTranslations
        : [];

      this.setState({
        currentLyrics: finalLyrics,
      });

      // 🔹 lyrics-plus-overlay 앱으로 가사 전송
      if (typeof OverlaySender !== 'undefined') {
        OverlaySender.sendLyrics(
          { uri, title: this.state.title, artist: this.state.artist },
          finalLyrics
        );
      }
    };

    // 스마트 로딩 전략: 두 모드 모두 활성화된 경우 둘 다 완료될 때까지 기다림
    const mode1Active = displayMode1 && displayMode1 !== "none";
    const mode2Active = displayMode2 && displayMode2 !== "none";

    console.log(
      "[displayTranslations] Mode1:",
      displayMode1,
      "Active:",
      mode1Active
    );
    console.log(
      "[displayTranslations] Mode2:",
      displayMode2,
      "Active:",
      mode2Active
    );

    if (mode1Active && mode2Active) {
      // 두 개 모드 모두 활성화: 각각 완료되는 즉시 업데이트 (Progressive Loading)
      // 캐시된 결과가 있으면 재사용, 없으면 새로 요청
      const promise1 = lyricsMode1
        ? Promise.resolve(lyricsMode1)
        : processMode(displayMode1, lyrics);
      const promise2 = lyricsMode2
        ? Promise.resolve(lyricsMode2)
        : processMode(displayMode2, lyrics);

      // 각 promise가 완료되는 즉시 업데이트
      promise1
        .then((result) => {
          // Guard clause: 다른 곡으로 변경되었는지 확인
          if (this.state.uri !== uri) {
            return;
          }
          if (result) {
            lyricsMode1 = result;
            this._dmResults[currentUri].mode1 = result;
            updateCombinedLyrics(); // 첫 번째 결과가 나오면 즉시 표시
          }
        })
        .catch((error) => {
          console.error("[Mode1] Error:", error);
          // 실패해도 계속 진행
        });

      promise2
        .then((result) => {
          // Guard clause: 다른 곡으로 변경되었는지 확인
          if (this.state.uri !== uri) {
            return;
          }
          if (result) {
            lyricsMode2 = result;
            this._dmResults[currentUri].mode2 = result;
            updateCombinedLyrics(); // 두 번째 결과가 나오면 즉시 추가 표시
          }
        })
        .catch((error) => {
          console.error("[Mode2] Error:", error);
          // 실패해도 계속 진행
        });
    } else if (mode1Active) {
      // Mode1만 활성화: Mode1 완료 시 바로 업데이트
      // Mode2는 비활성화되었으므로 null로 설정
      lyricsMode2 = null;
      this._dmResults[currentUri].mode2 = null;

      // 캐시된 결과가 있으면 바로 업데이트, 없으면 새로 요청
      if (lyricsMode1) {
        updateCombinedLyrics();
      } else {
        processMode(displayMode1, lyrics)
          .then((result) => {
            lyricsMode1 = result;
            this._dmResults[currentUri].mode1 = result;
            updateCombinedLyrics();
          })
          .catch((error) => {
            // 실패해도 UI 업데이트 (원문은 이미 표시됨)
            updateCombinedLyrics();
          });
      }
    } else if (mode2Active) {
      // Mode2만 활성화: Mode2 완료 시 바로 업데이트
      // Mode1은 비활성화되었으므로 null로 설정
      lyricsMode1 = null;
      this._dmResults[currentUri].mode1 = null;

      // 캐시된 결과가 있으면 바로 업데이트, 없으면 새로 요청
      if (lyricsMode2) {
        updateCombinedLyrics();
      } else {
        processMode(displayMode2, lyrics)
          .then((result) => {
            lyricsMode2 = result;
            this._dmResults[currentUri].mode2 = result;
            updateCombinedLyrics();
          })
          .catch((error) => {
            // 실패해도 UI 업데이트 (원문은 이미 표시됨)
            updateCombinedLyrics();
          });
      }
    }
  }

  /**
   * Smart optimization for translations - removes duplicates and identical content
   * @param {Array} originalLyrics - Original lyrics
   * @param {Array} mode1 - Translation from Display Mode 1
   * @param {Array} mode2 - Translation from Display Mode 2
   * @param {String} displayMode1 - Mode type for mode1 (e.g., "gemini_romaji", "gemini_ko")
   * @param {String} displayMode2 - Mode type for mode2
   * @returns {Array} Optimized lyrics with smart deduplication
   */
  optimizeTranslations(
    originalLyrics,
    mode1,
    mode2,
    displayMode1,
    displayMode2
  ) {
    // React 31 방지: 배열 유효성 검사
    if (!originalLyrics || !Array.isArray(originalLyrics)) {
      return [];
    }

    // Determine which mode is phonetic (romaji) and which is translation
    const mode1IsPhonetic = displayMode1 === "gemini_romaji";
    const mode2IsPhonetic = displayMode2 === "gemini_romaji";

    // Helper: note/placeholder-only line (e.g., ♪, …)
    const isNoteLine = (text) => {
      const t = String(text || "").trim();
      if (!t) return true;
      return /^[\s♪♩♫♬·•・。.、…~\-]+$/.test(t);
    };

    // Helper function to normalize text for comparison
    const normalizeForComparison = (text) => {
      if (!text || typeof text !== "string") return "";
      return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, "") // remove punctuation/symbols but keep letters/numbers of any script
        .replace(/\s+/g, " ")
        .trim();
    };

    // Helper function to check if two translations are similar (>85% similarity)
    const areTranslationsSimilar = (text1, text2) => {
      if (!text1 || !text2) return false;
      const norm1 = normalizeForComparison(text1);
      const norm2 = normalizeForComparison(text2);
      if (!norm1 || !norm2) return false;
      if (norm1 === norm2) return true;
      const words1 = norm1.split(" ").filter((w) => w.length > 2);
      const words2 = norm2.split(" ").filter((w) => w.length > 2);
      if (words1.length === 0 || words2.length === 0) return false;
      const commonWords = words1.filter((word) => words2.includes(word));
      const similarity =
        commonWords.length / Math.max(words1.length, words2.length);
      return similarity > 0.85;
    };

    // Process each line to determine what to display
    const processedLyrics = originalLyrics.map((line, i) => {
      // React 31 방지: null/undefined 체크 및 안전한 텍스트 추출
      if (!line) {
        return { text: null, text2: null, originalText: "" };
      }

      // Safely extract original text
      const originalText =
        typeof line === "object" ? line.text || "" : String(line || "");
      let translation1 = "";
      let translation2 = "";

      // Safely extract translations with boundary check
      if (mode1 && Array.isArray(mode1) && i < mode1.length && mode1[i]) {
        translation1 =
          typeof mode1[i] === "object"
            ? mode1[i].text || ""
            : String(mode1[i] || "");
      }
      if (mode2 && Array.isArray(mode2) && i < mode2.length && mode2[i]) {
        translation2 =
          typeof mode2[i] === "object"
            ? mode2[i].text || ""
            : String(mode2[i] || "");
      }

      // If original is a note/placeholder line, never show sub-lines
      if (isNoteLine(originalText)) {
        return { ...line, originalText, text: null, text2: null };
      }

      // Ignore translations that are notes-only
      if (isNoteLine(translation1)) translation1 = "";
      if (isNoteLine(translation2)) translation2 = "";

      const normalizedOriginal = normalizeForComparison(originalText);
      const normalizedTrans1 = normalizeForComparison(translation1);
      const normalizedTrans2 = normalizeForComparison(translation2);

      const trans1SameAsOriginal =
        normalizedTrans1 && normalizedTrans1 === normalizedOriginal;
      const trans2SameAsOriginal =
        normalizedTrans2 && normalizedTrans2 === normalizedOriginal;
      const translationsSame =
        normalizedTrans1 &&
        normalizedTrans2 &&
        (normalizedTrans1 === normalizedTrans2 ||
          areTranslationsSimilar(translation1, translation2));

      let finalText = null; // This will be phonetic (romaji/발음)
      let finalText2 = null; // This will be translation (번역)

      // Helper function to process phonetic hyphen replacement
      const processPhoneticHyphen = (text) => {
        if (!text || typeof text !== "string") return text;
        const hyphenMode = CONFIG.visual["phonetic-hyphen-replace"] || "keep";
        if (hyphenMode === "keep") return text;
        if (hyphenMode === "space") return text.replace(/-/g, " ");
        if (hyphenMode === "remove") return text.replace(/-/g, "");
        return text;
      };

      // Assign to correct slots based on mode types
      let phoneticText = "";
      let translationText = "";

      if (mode1IsPhonetic) {
        phoneticText = processPhoneticHyphen(translation1);
      } else if (mode1) {
        translationText = translation1;
      }

      if (mode2IsPhonetic) {
        phoneticText = processPhoneticHyphen(translation2);
      } else if (mode2) {
        translationText = translation2;
      }

      // Deduplication logic
      if (translationsSame) {
        // Both are the same, always show in translation slot (not phonetic)
        const combinedText = translation1 || translation2;
        if (!trans1SameAsOriginal) {
          finalText2 = combinedText; // Always use translation slot when they're the same
        }
      } else {
        // Different results - assign to correct slots
        // finalText = phonetic, finalText2 = translation
        if (!trans1SameAsOriginal && phoneticText) finalText = phoneticText;
        if (!trans2SameAsOriginal && translationText)
          finalText2 = translationText;
        // Also handle case where trans1 is same but trans2 is not
        if (trans1SameAsOriginal && !trans2SameAsOriginal) {
          if (mode2IsPhonetic) {
            finalText = translation2;
          } else {
            finalText2 = translation2;
          }
        } else if (!trans1SameAsOriginal && trans2SameAsOriginal) {
          if (mode1IsPhonetic) {
            finalText = translation1;
          } else {
            finalText2 = translation1;
          }
        }
      }

      // Create safe line object ensuring all properties are valid
      const safeLine = {
        ...(line && typeof line === "object" ? line : {}),
        originalText: String(originalText),
        text: finalText ? String(finalText) : null,
        text2: finalText2 ? String(finalText2) : (line.text2 ? String(line.text2) : null),
      };

      return safeLine;
    });

    return processedLyrics;
  }

  getGeminiTranslation(lyricsState, lyrics, mode) {
    return new Promise((resolve, reject) => {
      const viKey = StorageManager.getPersisted(
        `${APP_NAME}:visual:gemini-api-key`
      );
      const romajiKey = StorageManager.getPersisted(
        `${APP_NAME}:visual:gemini-api-key-romaji`
      );

      // Determine mode type and API key
      let wantSmartPhonetic = false;
      let apiKey;

      if (mode === "gemini_romaji") {
        // Use Smart Phonetic logic for the unified Romaji, Romaja, Pinyin button
        wantSmartPhonetic = true;
        apiKey = "no";
      } else {
        // Default to Korean
        apiKey = "no";
      }

      if (!apiKey || !Array.isArray(lyrics) || lyrics.length === 0) {
        return reject(
          new Error(
            "Gemini API key missing. Please add at least one key in Settings."
          )
        );
      }

      const cacheKey = mode;
      const cacheKey2 = `${lyricsState.uri}:${cacheKey}`;
      const cached = CacheManager.get(cacheKey2);

      if (cached) {
        // Fix cached items if they have double-encoded JSON structure
        let fixNeeded = false;
        let targetField = wantSmartPhonetic ? 'phonetic' : 'vi';

        if (cached[targetField] && Array.isArray(cached[targetField]) &&
          cached[targetField].length === 1 && typeof cached[targetField][0] === 'string' &&
          cached[targetField][0].trim().startsWith('{')) {
          try {
            const parsed = JSON.parse(cached[targetField][0]);
            if (wantSmartPhonetic && Array.isArray(parsed.phonetic)) {
              cached.phonetic = parsed.phonetic;
              fixNeeded = true;
            } else if (!wantSmartPhonetic && Array.isArray(parsed.vi)) {
              cached.vi = parsed.vi;
              fixNeeded = true;
            } else if (parsed.vi && Array.isArray(parsed.vi)) {
              // Fallback
              cached[targetField] = parsed.vi;
              fixNeeded = true;
            }
          } catch (e) { }
        }

        return resolve(cached);
      }

      // De-duplicate concurrent calls per (uri, type). Share the same promise for callers
      const inflightKey = `${lyricsState.uri}:${cacheKey}`;
      if (this._inflightGemini?.has(inflightKey)) {
        return this._inflightGemini
          .get(inflightKey)
          .then(resolve)
          .catch(reject);
      }

      // Use optimized rate limiter with separate keys for each translation type
      const rateLimitKey = mode.replace("gemini_", "gemini-");
      if (!RateLimiter.canMakeCall(rateLimitKey, 5, 2000)) {
        const modeName =
          mode === "gemini_romaji" ? "Romaji, Romaja, Pinyin" : "Korean";
        return reject(
          new Error(
            I18n.t("notifications.tooManyTranslationRequests")
          )
        );
      }

      // Filter out section headers before sending to Gemini for translation
      const allLines = lyrics.map((l) => l?.text || "").filter(Boolean);
      const nonSectionLines = allLines.filter(
        (line) => !Utils.isSectionHeader(line)
      );
      const text = nonSectionLines.join("\n");

      // Start appropriate loading indicator based on mode type (1초 후 표시)
      if (wantSmartPhonetic) {
        this.startPhoneticLoading();
      } else {
        this.startTranslationLoading();
      }

      const inflightPromise = Translator.callGemini({
        apiKey,
        artist: this.state.artist || lyricsState.artist,
        title: this.state.title || lyricsState.title,
        text,
        wantSmartPhonetic,
        provider: lyricsState.provider,
      })
        .then((response) => {
          let outText;
          if (wantSmartPhonetic) {
            outText = response.phonetic;
          } else {
            outText = response.vi;
          }

          if (!outText) throw new Error("Empty result from Gemini.");

          // Handle nested JSON packaging (API issue workaround)
          if (Array.isArray(outText) && outText.length === 1 && typeof outText[0] === 'string') {
            try {
              if (outText[0].trim().startsWith('{')) {
                const parsed = JSON.parse(outText[0]);
                if (wantSmartPhonetic && Array.isArray(parsed.phonetic)) {
                  outText = parsed.phonetic;
                } else if (!wantSmartPhonetic && Array.isArray(parsed.vi)) {
                  outText = parsed.vi;
                } else if (parsed.vi && Array.isArray(parsed.vi)) {
                  // Fallback: request was phonetic but response came as vi?
                  // or just general structure match
                  outText = parsed.vi;
                }
              }
            } catch (e) {
              // Not valid JSON, process as standard array
            }
          }

          // Handle both array and string formats
          let lines;
          if (Array.isArray(outText)) {
            lines = outText;
          } else if (typeof outText === "string") {
            lines = outText.split("\n");
          } else {
            throw new Error("Invalid translation format received from Gemini.");
          }

          // Create mapping arrays for proper alignment
          const originalNonSectionLines = [];
          const originalNonSectionIndices = [];

          // Collect non-section lines from original lyrics (excluding empty lines)
          lyrics.forEach((line, i) => {
            const text = line?.text || "";
            if (!Utils.isSectionHeader(text) && text.trim() !== "") {
              originalNonSectionLines.push(text);
              originalNonSectionIndices.push(i);
            }
          });

          // Filter out section headers and empty lines from translation results
          const cleanTranslationLines = lines.filter(
            (line) =>
              line && line.trim() !== "" && !Utils.isSectionHeader(line.trim())
          );

          // Use the clean translation lines for mapping
          lines = cleanTranslationLines;

          // Smart mapping that accounts for section headers and empty lines
          const mapped = lyrics.map((line, i) => {
            const originalText = line?.text || "";

            // If this is a section header, keep original and don't show translation
            if (Utils.isSectionHeader(originalText)) {
              return {
                ...line,
                text: null,
                originalText: originalText,
              };
            }

            // If this is an empty line, keep it empty
            if (originalText.trim() === "") {
              return {
                ...line,
                text: "",
                originalText: originalText,
              };
            }

            // Find the translation index for this non-section, non-empty line
            const positionInNonSectionLines =
              originalNonSectionIndices.indexOf(i);
            const translatedText =
              lines[positionInNonSectionLines]?.trim() || "";

            return {
              ...line,
              text: translatedText || line?.text || "",
              originalText: originalText,
            };
          });
          CacheManager.set(cacheKey2, mapped);
          return mapped;
        })
        .finally(() => {
          // Clear appropriate loading indicator based on mode type
          if (wantSmartPhonetic) {
            this.clearPhoneticLoading();
          } else {
            this.clearTranslationLoading();
          }
          this._inflightGemini = this._inflightGemini || new Map();
          this._inflightGemini?.delete(inflightKey);
        });

      this._inflightGemini = this._inflightGemini || new Map();
      this._inflightGemini.set(inflightKey, inflightPromise);
      inflightPromise.then(resolve).catch(reject);
    });
  }

  getTraditionalConversion(lyricsState, lyrics, language, displayMode) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(lyrics))
        return reject(new Error("Invalid lyrics format for conversion."));

      const cacheKey = `${lyricsState.uri}:trad:${language}:${displayMode}`;
      const cached = CacheManager.get(cacheKey);
      if (cached) return resolve(cached);

      // De-duplicate concurrent calls per (uri, language, mode)
      this._inflightTrad = this._inflightTrad || new Map();
      const inflightKey = `${lyricsState.uri}:trad:${language}:${displayMode}`;
      if (this._inflightTrad.has(inflightKey)) {
        return this._inflightTrad.get(inflightKey).then(resolve).catch(reject);
      }

      // Start translation loading indicator (1초 후 표시)
      this.startTranslationLoading();

      const inflightPromise = this.translateLyrics(
        language,
        lyrics,
        displayMode
      )
        .then((translated) => {
          if (translated !== undefined && translated !== null) {
            CacheManager.set(cacheKey, translated);
            return translated;
          }
          throw new Error("Empty result from conversion.");
        })
        .finally(() => {
          this.clearTranslationLoading();
          this._inflightTrad.delete(inflightKey);
        });

      this._inflightTrad.set(inflightKey, inflightPromise);
      inflightPromise.then(resolve).catch(reject);
    });
  }

  provideLanguageCode(lyrics) {
    if (!lyrics) return null;

    const provider = CONFIG.visual["translate:translated-lyrics-source"];

    // For Gemini API, always detect language from lyrics (no override needed)
    if (provider === "geminiKo") {
      // If we have a cached language in state, use it
      if (this.state.language) {
        return this.state.language;
      }

      // Otherwise, detect language from lyrics
      const detectedLanguage = Utils.detectLanguage(lyrics);

      return detectedLanguage;
    }

    // For Kuromoji mode, use language override if set
    if (CONFIG.visual["translate:detect-language-override"] !== "off") {
      const overrideLanguage =
        CONFIG.visual["translate:detect-language-override"];
      return overrideLanguage;
    }

    // If we have a cached language in state, use it
    if (this.state.language) {
      return this.state.language;
    }

    // Otherwise, detect language from lyrics
    const detectedLanguage = Utils.detectLanguage(lyrics);

    return detectedLanguage;
  }

  async translateLyrics(language, lyrics, targetConvert) {
    if (
      !language ||
      !Array.isArray(lyrics) ||
      String(targetConvert).startsWith("gemini")
    ) {
      return lyrics;
    }

    if (!this.translator) {
      this.translator = new Translator(language);
    }
    await this.translator.awaitFinished(language);

    let result;
    try {
      if (language === "ja") {
        // Japanese
        const map = {
          romaji: { target: "romaji", mode: "spaced" },
          furigana: { target: "hiragana", mode: "furigana" },
          hiragana: { target: "hiragana", mode: "normal" },
          katakana: { target: "katakana", mode: "normal" },
        };

        if (!map[targetConvert]) return lyrics;

        result = await Promise.all(
          lyrics.map(
            async (lyric) =>
              await this.translator.romajifyText(
                lyric?.text || "",
                map[targetConvert].target,
                map[targetConvert].mode
              )
          )
        );
      } else if (language === "ko") {
        // Korean
        if (targetConvert !== "romaja") return lyrics;
        result = await Promise.all(
          lyrics.map(
            async (lyric) =>
              await this.translator.convertToRomaja(
                lyric?.text || "",
                targetConvert
              )
          )
        );
      } else if (language === "zh-hans") {
        // Chinese (Simplified)
        if (targetConvert === "pinyin") {
          result = await Promise.all(
            lyrics.map(
              async (lyric) =>
                await this.translator.convertToPinyin(lyric?.text || "", {
                  toneType: "mark",
                  type: "string",
                })
            )
          );
          // Warn if pinyin conversion produced no visible changes (likely CDN blocked -> fallback)
          const anyChanged = lyrics.some(
            (lyric, i) => (result?.[i] ?? "") !== (lyric?.text || "")
          );
          if (!anyChanged) {
            Spicetify.showNotification(
              "Pinyin library unavailable. Showing original. Allow jsDelivr or unpkg.",
              true,
              4000
            );
          }
        } else {
          const map = {
            cn: { from: "cn", target: "cn" },
            tw: { from: "cn", target: "tw" },
            hk: { from: "cn", target: "hk" },
          };

          // prevent conversion between the same language.
          if (targetConvert === "cn") {
            Spicetify.showNotification(
              "Conversion skipped: Already in Simplified Chinese",
              false,
              2000
            );
            return lyrics;
          }

          result = await Promise.all(
            lyrics.map(
              async (lyric) =>
                await this.translator.convertChinese(
                  lyric?.text || "",
                  map[targetConvert].from,
                  map[targetConvert].target
                )
            )
          );
        }
      } else if (language === "zh-hant") {
        // Chinese (Traditional)
        if (targetConvert === "pinyin") {
          result = await Promise.all(
            lyrics.map(
              async (lyric) =>
                await this.translator.convertToPinyin(lyric?.text || "", {
                  toneType: "mark",
                  type: "string",
                })
            )
          );
          // Warn if pinyin conversion produced no visible changes (likely CDN blocked -> fallback)
          const anyChanged = lyrics.some(
            (lyric, i) => (result?.[i] ?? "") !== (lyric?.text || "")
          );
          if (!anyChanged) {
            Spicetify.showNotification(
              "Pinyin library unavailable. Showing original. Allow jsDelivr or unpkg.",
              true,
              4000
            );
          }
        } else {
          const map = {
            cn: { from: "t", target: "cn" },
            hk: { from: "t", target: "hk" },
            tw: { from: "t", target: "tw" },
          };

          if (!map[targetConvert]) return lyrics;

          // Allow conversion from Traditional Chinese to different variants/simplified
          result = await Promise.all(
            lyrics.map(
              async (lyric) =>
                await this.translator.convertChinese(
                  lyric?.text || "",
                  map[targetConvert].from,
                  map[targetConvert].target
                )
            )
          );
        }
      }

      const res = Utils.processTranslatedLyrics(result, lyrics);
      Spicetify.showNotification(
        "✓ Conversion completed successfully",
        false,
        2000
      );
      return res;
    } catch (error) {
      Spicetify.showNotification(
        `Conversion failed: ${error.message || "Unknown error"}`,
        true,
        3000
      );
    }
  }

  /**
   * 커뮤니티 싱크 오프셋 자동 적용
   */
  async applyCommunityOffset(trackUri) {
    try {
      // 이미 로컬에 저장된 오프셋이 있으면 스킵
      const localOffset = await Utils.getTrackSyncOffset(trackUri);
      if (localOffset && localOffset !== 0) {
        console.log(`[Lyrics Plus] Using local offset: ${localOffset}ms`);
        return;
      }

      // 커뮤니티 오프셋 조회
      const communityData = await Utils.getCommunityOffset(trackUri);
      if (!communityData) return;

      const minConfidence = CONFIG.visual["community-sync-min-confidence"] || 0.5;

      // 신뢰도가 최소값 이상인 경우에만 적용
      if ((communityData.confidence ?? 0) >= minConfidence) {
        const offsetToApply = communityData.medianOffsetMs ?? communityData.offsetMs ?? 0;

        if (offsetToApply !== 0) {
          await Utils.setTrackSyncOffset(trackUri, offsetToApply);
          console.log(`[Lyrics Plus] Applied community offset: ${offsetToApply}ms (confidence: ${communityData.confidence})`);

          // UI 업데이트를 위해 이벤트 발생
          window.dispatchEvent(new CustomEvent('lyrics-plus:offset-changed', {
            detail: { trackUri, offset: offsetToApply }
          }));
        }
      }
    } catch (error) {
      console.error("[Lyrics Plus] Failed to apply community offset:", error);
    }
  }

  resetDelay() {
    CONFIG.visual.delay =
      Number(
        StorageManager.getItem(`lyrics-delay:${Spicetify.Player.data.item.uri}`)
      ) || 0;
  }

  // Helper method to get translation states for saving/restoring
  getTranslationStates() {
    return {
      romaji: this.state.romaji,
      furigana: this.state.furigana,
      hiragana: this.state.hiragana,
      katakana: this.state.katakana,
      hangul: this.state.hangul,
      romaja: this.state.romaja,
      cn: this.state.cn,
      hk: this.state.hk,
      tw: this.state.tw,
      currentLyrics: this.state.currentLyrics,
      language: this.state.language,
    };
  }

  // Helper method to apply translation states
  applyTranslationStates(states, additional = {}) {
    return {
      ...additional,
      ...(states.romaji && { romaji: states.romaji }),
      ...(states.furigana && { furigana: states.furigana }),
      ...(states.hiragana && { hiragana: states.hiragana }),
      ...(states.katakana && { katakana: states.katakana }),
      ...(states.hangul && { hangul: states.hangul }),
      ...(states.romaja && { romaja: states.romaja }),
      ...(states.cn && { cn: states.cn }),
      ...(states.hk && { hk: states.hk }),
      ...(states.tw && { tw: states.tw }),
      ...(states.currentLyrics && { currentLyrics: states.currentLyrics }),
      ...(states.language && { language: states.language }),
    };
  }

  saveLocalLyrics(uri, lyrics) {
    // Include translations and phonetic conversions in cache
    const fullLyricsData = {
      ...lyrics,
      ...this.getTranslationStates(),
    };

    const localLyrics =
      JSON.parse(StorageManager.getItem(`${APP_NAME}:local-lyrics`)) || {};
    localLyrics[uri] = fullLyricsData;
    StorageManager.setItem(
      `${APP_NAME}:local-lyrics`,
      JSON.stringify(localLyrics)
    );
    this.setState({ isCached: true });
  }

  deleteLocalLyrics(uri) {
    const localLyrics =
      JSON.parse(StorageManager.getItem(`${APP_NAME}:local-lyrics`)) || {};
    delete localLyrics[uri];
    StorageManager.setItem(
      `${APP_NAME}:local-lyrics`,
      JSON.stringify(localLyrics)
    );
    this.setState({ isCached: false });
  }

  lyricsSaved(uri) {
    const localLyrics =
      JSON.parse(StorageManager.getItem(`${APP_NAME}:local-lyrics`)) || {};
    return !!localLyrics[uri];
  }

  resetTranslationCache(uri) {
    // Clear translation cache for this URI
    const clearedCount = CacheManager.clearByUri(uri);

    // Clear progressive results for this track
    if (this._dmResults && this._dmResults[uri]) {
      delete this._dmResults[uri];
    }

    // Clear inflight Gemini requests for this track
    if (this._inflightGemini) {
      const keysToDelete = [];
      for (const [key] of this._inflightGemini) {
        if (key.includes(uri)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach((key) => this._inflightGemini.delete(key));
    }

    // Check if there are any translations to reset
    const hasTranslations =
      this.state.romaji ||
      this.state.furigana ||
      this.state.hiragana ||
      this.state.katakana ||
      this.state.hangul ||
      this.state.romaja ||
      this.state.cn ||
      this.state.hk ||
      this.state.tw;

    // Reset translation states
    this.setState({
      romaji: null,
      furigana: null,
      hiragana: null,
      katakana: null,
      hangul: null,
      romaja: null,
      cn: null,
      hk: null,
      tw: null,
    });

    // Force re-process lyrics with current display modes
    const currentMode = this.getCurrentMode();
    this.lyricsSource(this.state, currentMode);

    if (hasTranslations) {
      Spicetify.showNotification(
        `✓ Reset ${clearedCount} translation cache entries`,
        false,
        2000
      );
    } else {
      Spicetify.showNotification(
        I18n.t("notifications.translationCacheRemoved"),
        false,
        2000
      );
    }
  }

  processLyricsFromFile(event) {
    const file = event.target.files;
    if (!file.length) return;
    const reader = new FileReader();

    if (file[0].size > 1024 * 1024) {
      Spicetify.showNotification(
        "File too large: Maximum size is 1MB",
        true,
        3000
      );
      return;
    }

    reader.onload = (e) => {
      try {
        const localLyrics = Utils.parseLocalLyrics(e.target.result);
        const parsedKeys = Object.keys(localLyrics)
          .filter((key) => localLyrics[key])
          .map((key) => key[0].toUpperCase() + key.slice(1))
          .map((key) => `<strong>${key}</strong>`);

        if (!parsedKeys.length) {
          Spicetify.showNotification(
            "No valid lyrics found in file",
            true,
            3000
          );
          return;
        }

        this.setState({
          ...localLyrics,
          provider: "local",
          ...this.applyTranslationStates(localLyrics),
        });
        CACHE[this.currentTrackUri] = {
          ...localLyrics,
          provider: "local",
          uri: this.currentTrackUri,
        };
        this.saveLocalLyrics(this.currentTrackUri, localLyrics);

        Spicetify.showNotification(
          `✓ Successfully loaded ${parsedKeys.join(", ")} lyrics from file`,
          false,
          3000
        );
      } catch (e) {
        Spicetify.showNotification(
          "Failed to load lyrics: Invalid file format",
          true,
          3000
        );
      }
    };

    reader.onerror = (e) => {
      Spicetify.showNotification(
        "Failed to read file: File may be corrupted",
        true,
        3000
      );
    };

    reader.readAsText(file[0]);
    event.target.value = "";
  }
  initMoustrap() {
    if (!this.mousetrap && Spicetify.Mousetrap) {
      this.mousetrap = new Spicetify.Mousetrap();
    }
  }

  componentDidMount() {
    // Prevent duplicate global registration
    if (window.lyricContainer && window.lyricContainer !== this) {
      if (typeof window.lyricContainer.componentWillUnmount === "function") {
        window.lyricContainer.componentWillUnmount();
      }
    }

    // Register instance for external access
    window.lyricContainer = this;

    // Prefetcher에 LyricsContainer 참조 설정
    Prefetcher.setLyricsContainer(this);

    // Cache DOM elements to avoid repeated queries
    this._domCache = {
      viewport: null,
      fadContainer: null,
      fileInput: null,
    };

    // Check for updates when app starts
    setTimeout(() => {
      Utils.showUpdateNotificationIfAvailable().catch((error) => {
        // Error ignored
      });
    }, 3000); // Delay to avoid interfering with app startup

    // Initialize enhanced cache system only once
    if (!CacheManager._initialized) {
      CacheManager.init();
      CacheManager._initialized = true;
    }

    this.onQueueChange = async ({ data: queue }) => {
      // 이전 트랙의 진행 중인 번역 요청 정리
      const previousTrackId = this.currentTrackUri?.split(':')[2];
      if (previousTrackId) {
        Translator.clearInflightRequests(previousTrackId);
      }

      this.state.explicitMode = this.state.lockMode;
      this.currentTrackUri = queue.current.uri;
      this.fetchLyrics(queue.current, this.state.explicitMode);
      this.viewPort.scrollTo(0, 0);

      // 트랙 변경 시 videoInfo 초기화 후 저장된 영상 확인
      this.setState({ videoInfo: null });
      this.loadSavedVideoForTrack(queue.current.uri);

      // 커뮤니티 싱크 오프셋 자동 적용
      if (CONFIG.visual["community-sync-enabled"] && CONFIG.visual["community-sync-auto-apply"]) {
        this.applyCommunityOffset(queue.current.uri);
      }

      // 다음 곡의 모든 요소 프리페치 (가사 → 번역/발음 → 영상 배경)
      const nextTrack = queue.queued?.[0] || queue.nextUp?.[0];
      const nextInfo = this.infoFromTrack(nextTrack);
      // Debounce next track fetch
      if (!nextInfo || nextInfo.uri === this.nextTrackUri) return;
      this.nextTrackUri = nextInfo.uri;

      // Prefetcher가 가사부터 번역/영상까지 순차적으로 처리
      Prefetcher.prefetchNextTrack(nextInfo, this.state.explicitMode);
    };

    if (Spicetify.Player?.data?.item) {
      this.state.explicitMode = this.state.lockMode;
      this.currentTrackUri = Spicetify.Player.data.item.uri;
      this.fetchLyrics(Spicetify.Player.data.item, this.state.explicitMode);
      // 초기 로드 시 저장된 영상 확인
      this.loadSavedVideoForTrack(Spicetify.Player.data.item.uri);
    }

    this.updateVisualOnConfigChange();
    Utils.addQueueListener(this.onQueueChange);

    lyricContainerUpdate = () => {
      this.reRenderLyricsPage = !this.reRenderLyricsPage;
      this.updateVisualOnConfigChange();
      this.forceUpdate();
    };

    reloadLyrics = async (clearCache = true) => {
      // 메모리 캐시는 항상 초기화
      CACHE = {};

      // 현재 트랙 정보
      const item = Spicetify.Player.data?.item;
      const trackUri = item?.uri;
      const trackId = trackUri?.split(":").pop();

      // CacheManager (Gemini 번역 메모리 캐시)도 항상 현재 트랙에 대해 초기화
      if (trackUri) {
        CacheManager.clearByUri(trackUri);
      }

      // clearCache가 true이고 트랙 정보가 있으면 로컬 캐시도 삭제
      if (clearCache && trackId) {
        await LyricsCache.clearTrack(trackId);
        Translator.clearMemoryCache(trackId);
        Translator.clearInflightRequests(trackId);
      }

      this.updateVisualOnConfigChange();
      this.forceUpdate();
      this.fetchLyrics(
        Spicetify.Player.data.item,
        this.state.explicitMode,
        true
      );
    };

    // Cache viewport element for better performance
    this.viewPort =
      this._domCache?.viewport ??
      (this._domCache &&
        (this._domCache.viewport =
          document.querySelector(".Root__main-view .os-viewport") ??
          document.querySelector(
            ".Root__main-view .main-view-container__scroll-node"
          )));

    this.configButton = new Spicetify.Menu.Item(
      "Lyrics Plus config",
      false,
      openConfig,
      "lyrics"
    );
    this.configButton.register();

    // Throttled font size change to improve performance
    let fontSizeChangeTimeout = null;
    this.onFontSizeChange = (event) => {
      if (!event.ctrlKey) return;

      // Prevent too frequent updates
      if (fontSizeChangeTimeout) return;

      fontSizeChangeTimeout = setTimeout(() => {
        fontSizeChangeTimeout = null;
      }, 50); // 50ms throttle

      const dir = event.deltaY < 0 ? 1 : -1;
      let temp = CONFIG.visual["font-size"] + dir * fontSizeLimit.step;
      if (temp < fontSizeLimit.min) {
        temp = fontSizeLimit.min;
      } else if (temp > fontSizeLimit.max) {
        temp = fontSizeLimit.max;
      }
      CONFIG.visual["font-size"] = temp;
      StorageManager.saveConfig("font-size", temp);
      lyricContainerUpdate();
    };

    this.toggleFullscreen = () => {
      const isEnabled = !this.state.isFullscreen;
      const useBrowserFullscreen = CONFIG.visual["fullscreen-browser-fullscreen"] === true;
      if (isEnabled) {
        document.body.append(this.fullscreenContainer);
        this.mousetrap.bind("esc", this.toggleFullscreen);
        // ESC 키 직접 리스너 추가 (Mousetrap이 캡처하지 못할 경우 대비)
        this._escHandler = (e) => {
          if (e.key === "Escape" && this.state.isFullscreen) {
            e.preventDefault();
            e.stopPropagation();
            this.toggleFullscreen();
          }
        };
        document.addEventListener("keydown", this._escHandler);

        // 브라우저 전체화면 변경 감지 리스너 추가
        this._fullscreenChangeHandler = () => {
          // 브라우저 전체화면이 종료되었고, lyrics-plus 전체화면이 활성화된 상태라면
          if (!document.fullscreenElement && this.state.isFullscreen && useBrowserFullscreen) {
            this.toggleFullscreen();
          }
        };
        document.addEventListener("fullscreenchange", this._fullscreenChangeHandler);

        // 브라우저 전체화면 활성화
        if (useBrowserFullscreen && !document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.debug("Fullscreen request failed:", err);
          });
        }
      } else {
        this.fullscreenContainer.remove();
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => { });
        }
        this.mousetrap.unbind("esc");
        // ESC 키 리스너 제거
        if (this._escHandler) {
          document.removeEventListener("keydown", this._escHandler);
          this._escHandler = null;
        }
        // 브라우저 전체화면 변경 리스너 제거
        if (this._fullscreenChangeHandler) {
          document.removeEventListener("fullscreenchange", this._fullscreenChangeHandler);
          this._fullscreenChangeHandler = null;
        }
      }

      this.setState({
        isFullscreen: isEnabled,
      });
    };
    this.mousetrap.reset();
    this.mousetrap.bind(CONFIG.visual["fullscreen-key"], this.toggleFullscreen);
    window.addEventListener("fad-request", lyricContainerUpdate);

    // 설정 변경 리스너 - 노래방 모드 토글 처리
    this.handleConfigChange = (event) => {
      if (event.detail?.name === "karaoke-mode-enabled") {
        // 노래방 모드 설정이 변경되면 현재 모드를 다시 계산
        this.state.explicitMode = -1; // 명시적 모드 초기화
        this.forceUpdate();
      }
    };
    window.addEventListener("lyrics-plus", this.handleConfigChange);

    // Listen for lyric index changes from Pages.js
    this.handleLyricIndexChange = (event) => {
      if (event.detail && typeof event.detail.index === 'number') {
        this.setState({ currentLyricIndex: event.detail.index });
      }
    };
    window.addEventListener("lyrics-plus:lyric-index-changed", this.handleLyricIndexChange);
  }

  componentWillUnmount() {
    // Core cleanup
    Utils.removeQueueListener(this.onQueueChange);
    this.configButton?.deregister();
    this.mousetrap?.reset();
    window.removeEventListener("fad-request", lyricContainerUpdate);
    window.removeEventListener("lyrics-plus", this.handleConfigChange);
    window.removeEventListener("lyrics-plus:lyric-index-changed", this.handleLyricIndexChange);

    // Mouse idle timer cleanup
    if (this.mouseIdleTimer) {
      clearTimeout(this.mouseIdleTimer);
      this.mouseIdleTimer = null;
    }
    // Remove mouse event listeners from container
    const container = this.containerRef.current;
    if (container && this._handleMouseMove) {
      container.removeEventListener('mousemove', this._handleMouseMove);
      container.removeEventListener('mouseleave', this._handleMouseLeave);
    }
    this._handleMouseMove = null;
    this._handleMouseLeave = null;

    // ESC 키 리스너 정리
    if (this._escHandler) {
      document.removeEventListener("keydown", this._escHandler);
      this._escHandler = null;
    }

    // 브라우저 전체화면 변경 리스너 정리
    if (this._fullscreenChangeHandler) {
      document.removeEventListener("fullscreenchange", this._fullscreenChangeHandler);
      this._fullscreenChangeHandler = null;
    }

    // Clean up translation loading timer
    this.clearTranslationLoading();

    // Clean up cache system
    CacheManager.clear();

    // Clear DOM cache
    if (this._domCache) {
      this._domCache = null;
    }

    // Clean up global references
    if (window.lyricContainer === this) {
      delete window.lyricContainer;
    }

    // Clean up performance monitoring
    if (window.lyricsPerformance) {
      delete window.lyricsPerformance;
    }

    // Clean up inflight requests
    if (this._inflightGemini) {
      this._inflightGemini.clear();
      this._inflightGemini = null;
    }

    if (this._inflightTrad) {
      this._inflightTrad.clear();
      this._inflightTrad = null;
    }

    // Clean up progressive results
    if (this._dmResults) {
      this._dmResults = null;
    }

    // Force garbage collection hint
    if (window.gc && typeof window.gc === "function") {
      setTimeout(() => window.gc(), 100);
    }
  }

  updateVisualOnConfigChange() {
    this.availableModes = CONFIG.modes.filter((_, id) => {
      return Object.values(CONFIG.providers).some(
        (p) => p.on && p.modes.includes(id)
      );
    });

    if (!CONFIG.visual.colorful) {
      this.styleVariables = {
        "--lyrics-color-active": CONFIG.visual["active-color"],
        "--lyrics-color-inactive": CONFIG.visual["inactive-color"],
        "--lyrics-highlight-background": CONFIG.visual["highlight-color"],
        "--lyrics-background-noise": CONFIG.visual.noise
          ? "var(--background-noise)"
          : "unset",
      };
    } else if (CONFIG.visual.colorful) {
      this.styleVariables = {
        "--lyrics-color-active": "white",
        "--lyrics-color-inactive": "rgba(255, 255, 255, 0.4)",
        "--lyrics-color-background":
          this.state.colors.background || "transparent",
        "--lyrics-highlight-background": this.state.colors.inactive,
        "--lyrics-background-noise": CONFIG.visual.noise
          ? "var(--background-noise)"
          : "unset",
      };
    }

    this.styleVariables = {
      ...this.styleVariables,
      "--lyrics-align-text": CONFIG.visual.alignment,
      "--lyrics-font-size": `${CONFIG.visual["font-size"]}px`,
      "--animation-tempo": this.state.tempo,
      "--lyrics-font-family":
        CONFIG.visual["font-family"] || "var(--font-family)",
      "--lyrics-original-font-family":
        CONFIG.visual["original-font-family"] || "var(--font-family)",
      "--lyrics-phonetic-font-family":
        CONFIG.visual["phonetic-font-family"] || "var(--font-family)",
      "--lyrics-translation-font-family":
        CONFIG.visual["translation-font-family"] || "var(--font-family)",
      "--lyrics-fullscreen-right-padding": `${CONFIG.visual["fullscreen-lyrics-right-padding"] || 40}px`,
    };

    this.mousetrap.reset();
    this.mousetrap.bind(CONFIG.visual["fullscreen-key"], this.toggleFullscreen);
  }

  getCurrentMode() {
    let mode = -1;
    if (this.state.explicitMode !== -1) {
      mode = this.state.explicitMode;
    } else if (this.state.lockMode !== -1) {
      mode = this.state.lockMode;
    } else {
      // Auto switch: prefer karaoke, then synced, then unsynced
      // 노래방 모드가 비활성화되어 있으면 karaoke를 건너뛰고 synced부터 시작
      if (this.state.karaoke && CONFIG.visual["karaoke-mode-enabled"]) {
        mode = KARAOKE;
      } else if (this.state.synced) {
        mode = SYNCED;
      } else if (this.state.unsynced) {
        mode = UNSYNCED;
      }
    }
    return mode;
  }

  render() {
    // 미리보기 컴포넌트에서 사용할 수 있도록 첫 가사 시간을 전역으로 노출
    window.lyricsPlus_firstLyricTime = this.state.currentLyrics && this.state.currentLyrics.length > 0
      ? this.state.currentLyrics[0].startTime
      : 0;

    // Enhanced FAD container detection - try multiple selectors if main one fails
    let fadLyricsContainer = this._domCache?.fadContainer;

    if (!fadLyricsContainer || !document.contains(fadLyricsContainer)) {
      // Try main selector first
      fadLyricsContainer = document.getElementById("fad-lyrics-plus-container");

      // If not found, try alternative selectors for FAD extension
      if (!fadLyricsContainer) {
        const altSelectors = ["[data-fad-lyrics]", ".fad-lyrics-container"];

        for (const selector of altSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            fadLyricsContainer = element;
            break;
          }
        }
      }

      // Cache the result
      if (this._domCache) {
        this._domCache.fadContainer = fadLyricsContainer;
      }
    }

    this.state.isFADMode = !!fadLyricsContainer;

    if (this.state.isFADMode) {
      // Text colors will be set by FAD extension
      // Disable colorful backgrounds in FAD mode
      this.styleVariables = {};
    } else if (CONFIG.visual.colorful && this.state.colors.background) {
      const isLight = Utils.isColorLight(this.state.colors.background);
      this.styleVariables = {
        "--lyrics-color-active": isLight ? "black" : "white",
        "--lyrics-color-inactive": isLight
          ? "rgba(0, 0, 0, 0.4)"
          : "rgba(255, 255, 255, 0.4)",
        "--lyrics-color-background": this.state.colors.background,
        "--lyrics-highlight-background": this.state.colors.inactive,
        "--lyrics-background-noise": CONFIG.visual.noise
          ? "var(--background-noise)"
          : "unset",
      };
    } else if (CONFIG.visual["solid-background"]) {
      const isLight = Utils.isColorLight(
        CONFIG.visual["solid-background-color"]
      );
      this.styleVariables = {
        "--lyrics-color-active": isLight ? "black" : "white",
        "--lyrics-color-inactive": isLight
          ? "rgba(0, 0, 0, 0.4)"
          : "rgba(255, 255, 255, 0.4)",
        "--lyrics-color-background": CONFIG.visual["solid-background-color"],
        "--lyrics-highlight-background": isLight
          ? "rgba(0, 0, 0, 0.1)"
          : "rgba(255, 255, 255, 0.1)",
        "--lyrics-background-noise": CONFIG.visual.noise
          ? "var(--background-noise)"
          : "unset",
      };
    }

    const backgroundStyle = {};
    // Disable background features when in FAD mode (Full Screen extension)
    if (!this.state.isFADMode && CONFIG.visual["video-background"]) {
      // Video background is handled by the component
    } else if (!this.state.isFADMode && CONFIG.visual["gradient-background"]) {
      const brightness = CONFIG.visual["background-brightness"] / 100;
      // 앨범 커버 이미지 가져오기
      const albumArtUrl =
        Spicetify.Player.data?.item?.metadata?.image_xlarge_url ||
        Spicetify.Player.data?.item?.metadata?.image_large_url ||
        Spicetify.Player.data?.item?.metadata?.image_url;

      if (albumArtUrl) {
        backgroundStyle.backgroundImage = `url(${albumArtUrl})`;
        backgroundStyle.backgroundSize = "cover";
        backgroundStyle.backgroundPosition = "center";
        backgroundStyle.backgroundRepeat = "no-repeat";
        backgroundStyle.filter = `brightness(${brightness}) blur(20px)`;
        backgroundStyle.transform = "scale(1)"; // 블러 경계선 숨기기
      }
    } else if (
      !this.state.isFADMode &&
      CONFIG.visual.colorful &&
      this.state.colors.background
    ) {
      const brightness = CONFIG.visual["background-brightness"] / 100;
      backgroundStyle.backgroundColor = this.state.colors.background;
      backgroundStyle.filter = `brightness(${brightness})`;
    } else if (!this.state.isFADMode && CONFIG.visual["solid-background"]) {
      const brightness = CONFIG.visual["background-brightness"] / 100;
      backgroundStyle.backgroundColor = CONFIG.visual["solid-background-color"];
      backgroundStyle.filter = `brightness(${brightness})`;
    }

    // Helper function to convert hex color with opacity
    const hexToRgba = (hex, opacity) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
      }
      return hex;
    };

    // Build text shadow CSS value
    const shadowColor = hexToRgba(
      CONFIG.visual["text-shadow-color"],
      CONFIG.visual["text-shadow-opacity"]
    );
    const textShadow = CONFIG.visual["text-shadow-enabled"]
      ? `0 0 ${CONFIG.visual["text-shadow-blur"]}px ${shadowColor}`
      : "none";

    this.styleVariables = {
      ...this.styleVariables,
      "--lyrics-align-text": CONFIG.visual.alignment,
      "--lyrics-font-size": `${CONFIG.visual["font-size"]}px`,
      "--lyrics-font-family":
        CONFIG.visual["font-family"] || "var(--font-family)",
      "--lyrics-original-font-family":
        CONFIG.visual["original-font-family"] || "var(--font-family)",
      "--lyrics-phonetic-font-family":
        CONFIG.visual["phonetic-font-family"] || "var(--font-family)",
      "--lyrics-translation-font-family":
        CONFIG.visual["translation-font-family"] || "var(--font-family)",
      "--lyrics-original-font-weight": CONFIG.visual["original-font-weight"],
      "--lyrics-original-font-size": `${CONFIG.visual["original-font-size"]}px`,
      "--lyrics-translation-font-weight":
        CONFIG.visual["translation-font-weight"],
      "--lyrics-translation-font-size": `${CONFIG.visual["translation-font-size"]}px`,
      "--lyrics-translation-spacing": `${CONFIG.visual["translation-spacing"] || 8
        }px`,
      "--lyrics-phonetic-font-weight":
        CONFIG.visual["phonetic-font-weight"] || "400",
      "--lyrics-phonetic-font-size": `${CONFIG.visual["phonetic-font-size"] || 20
        }px`,
      "--lyrics-phonetic-opacity":
        (CONFIG.visual["phonetic-opacity"] || 70) / 100,
      "--lyrics-phonetic-spacing": `${CONFIG.visual["phonetic-spacing"] || 4
        }px`,
      "--lyrics-original-letter-spacing": `${CONFIG.visual["original-letter-spacing"] || 0}px`,
      "--lyrics-phonetic-letter-spacing": `${CONFIG.visual["phonetic-letter-spacing"] || 0}px`,
      "--lyrics-translation-letter-spacing": `${CONFIG.visual["translation-letter-spacing"] || 0}px`,
      "--lyrics-furigana-font-weight": CONFIG.visual["furigana-font-weight"],
      "--lyrics-furigana-font-size": `${CONFIG.visual["furigana-font-size"]}px`,
      "--lyrics-furigana-opacity": CONFIG.visual["furigana-opacity"] / 100,
      "--lyrics-furigana-spacing": `${CONFIG.visual["furigana-spacing"]}px`,
      "--lyrics-line-spacing": `${CONFIG.visual["line-spacing"] || 8}px`,
      "--lyrics-text-shadow": textShadow,
      "--lyrics-original-opacity": CONFIG.visual["original-opacity"] / 100,
      "--lyrics-translation-opacity":
        CONFIG.visual["translation-opacity"] / 100,
      "--highlight-inactive-opacity":
        (100 - (CONFIG.visual["highlight-intensity"] || 70)) / 100,
      "--animation-tempo": this.state.tempo,
      "--lyrics-fullscreen-right-padding": `${CONFIG.visual["fullscreen-lyrics-right-padding"] || 40}px`,
    };

    let mode = this.getCurrentMode();

    let activeItem;
    let showTranslationButton;

    // Get current display modes to track changes
    const originalLanguage = this.provideLanguageCode(this.state.currentLyrics);
    const friendlyLanguage =
      originalLanguage &&
      new Intl.DisplayNames(["en"], { type: "language" })
        .of(originalLanguage.split("-")[0])
        ?.toLowerCase();

    // For Gemini mode, use generic keys if no specific language detected
    const provider = CONFIG.visual["translate:translated-lyrics-source"];
    const modeKey =
      provider === "geminiKo" && !friendlyLanguage
        ? "gemini"
        : friendlyLanguage;

    const displayMode1 = CONFIG.visual[`translation-mode:${modeKey}`];
    const displayMode2 = CONFIG.visual[`translation-mode-2:${modeKey}`];
    const currentModeKey = `${mode}_${displayMode1 || "none"}_${displayMode2 || "none"
      }`;

    // Only call lyricsSource on state/mode/translation changes, not every render
    if (
      this.lastProcessedUri !== this.state.uri ||
      this.lastProcessedMode !== currentModeKey
    ) {
      this.lastProcessedUri = this.state.uri;
      this.lastProcessedMode = currentModeKey;
      this.lyricsSource(this.state, mode);
    }
    const hasTranslation = false;

    // Always render the Conversions button on synced/unsynced pages.
    // Previously it was gated by detected language/loading state, causing it to
    // be hidden on initial load or for non-target languages (e.g., English).
    const potentialMode =
      this.state.explicitMode !== -1
        ? this.state.explicitMode
        : this.state.lockMode !== -1
          ? this.state.lockMode
          : this.state.isLoading
            ? this.lastModeBeforeLoading || SYNCED
            : mode;

    showTranslationButton =
      potentialMode === KARAOKE ||
      potentialMode === SYNCED ||
      potentialMode === UNSYNCED ||
      mode === -1;

    // 번역 재생성 버튼 활성화 조건 확인
    const translationProvider =
      CONFIG.visual["translate:translated-lyrics-source"];
    const hasTranslationEnabled =
      translationProvider && translationProvider !== "none";
    const hasGeminiTranslation =
      hasTranslationEnabled &&
      (displayMode1?.startsWith("gemini") ||
        displayMode2?.startsWith("gemini"));

    // Gemini 번역이 실제로 로드되었는지 확인 (_dmResults 확인)
    const currentUri = this.state.uri;
    const hasLoadedGeminiTranslation = !!(
      hasGeminiTranslation &&
      this._dmResults &&
      this._dmResults[currentUri] &&
      ((displayMode1?.startsWith("gemini") &&
        this._dmResults[currentUri].mode1) ||
        (displayMode2?.startsWith("gemini") &&
          this._dmResults[currentUri].mode2))
    );

    const canRegenerateTranslation = hasLoadedGeminiTranslation;

    if (mode !== -1) {
      if (mode === KARAOKE && this.state.karaoke) {
        activeItem = react.createElement(SyncedLyricsPage, {
          trackUri: this.state.uri,
          lyrics: Array.isArray(this.state.currentLyrics)
            ? this.state.currentLyrics
            : this.state.karaoke,
          provider: this.state.provider,
          copyright: this.state.copyright,
          isKara: true,
          reRenderLyricsPage: this.reRenderLyricsPage,
        });
      } else if (mode === SYNCED && this.state.synced) {
        activeItem = react.createElement(
          CONFIG.visual["synced-compact"]
            ? SyncedLyricsPage
            : SyncedExpandedLyricsPage,
          {
            trackUri: this.state.uri,
            lyrics: Array.isArray(this.state.currentLyrics)
              ? this.state.currentLyrics
              : [],
            provider: this.state.provider,
            copyright: this.state.copyright,
            reRenderLyricsPage: this.reRenderLyricsPage,
          }
        );
      } else if (mode === UNSYNCED && this.state.unsynced) {
        activeItem = react.createElement(UnsyncedLyricsPage, {
          trackUri: this.state.uri,
          lyrics: Array.isArray(this.state.currentLyrics)
            ? this.state.currentLyrics
            : [],
          provider: this.state.provider,
          copyright: this.state.copyright,
          reRenderLyricsPage: this.reRenderLyricsPage,
        });
      }
    }

    if (!activeItem) {
      activeItem = react.createElement(
        "div",
        {
          className: "lyrics-lyricsContainer-LyricsUnavailablePage",
        },
        react.createElement(
          "span",
          {
            className: "lyrics-lyricsContainer-LyricsUnavailableMessage",
          },
          this.state.isLoading ? LoadingIcon : "(• _ • )"
        )
      );
    }

    this.state.mode = mode;

    const topBarProps = {
      links: CONFIG.modes,
      activeLink: CONFIG.modes[mode] || CONFIG.modes[0],
      lockLink: CONFIG.locked !== -1 ? CONFIG.modes[CONFIG.locked] : null,
      switchCallback: (selectedMode) => {
        const modeIndex = CONFIG.modes.indexOf(selectedMode);
        if (modeIndex !== -1) {
          this.switchTo(modeIndex);
        }
      },
      lockCallback: (selectedMode) => {
        const modeIndex = CONFIG.modes.indexOf(selectedMode);
        if (modeIndex !== -1) {
          this.lockIn(modeIndex);
        }
      },
    };

    const topBarContent =
      typeof TopBarContent === "function"
        ? react.createElement(TopBarContent, topBarProps)
        : null;

    // Update banner component
    const updateBanner = window.lyricsPlus_updateInfo?.available
      ? react.createElement(UpdateBanner, {
        updateInfo: window.lyricsPlus_updateInfo,
        onDismiss: () =>
          Utils.dismissUpdate(window.lyricsPlus_updateInfo.latestVersion),
      })
      : null;

    const hasLyrics = !!(this.state.karaoke || this.state.synced || this.state.unsynced);
    const isTwoColumn = CONFIG.visual["fullscreen-two-column"] !== false;
    const isLayoutReversed = CONFIG.visual["fullscreen-layout-reverse"] === true;
    const centerWhenNoLyrics = CONFIG.visual["fullscreen-center-when-no-lyrics"] !== false;

    // Build fullscreen class names
    let fullscreenClasses = "";
    if (this.state.isFullscreen) {
      fullscreenClasses = " fullscreen-active";
      if (!isTwoColumn) {
        fullscreenClasses += " fullscreen-single-column";
      }
      if (isLayoutReversed && isTwoColumn) {
        fullscreenClasses += " layout-reversed";
      }
      if (!hasLyrics && centerWhenNoLyrics) {
        fullscreenClasses += " fullscreen-no-lyrics";
      }
    }

    const out = react.createElement(
      "div",
      {
        className: `lyrics-lyricsContainer-LyricsContainer${CONFIG.visual["fade-blur"] ? " blur-enabled" : ""
          }${CONFIG.visual["highlight-mode"] ? " highlight-mode-enabled" : ""}${fadLyricsContainer ? " fad-enabled" : ""}${fullscreenClasses}`,
        style: this.styleVariables,
        ref: (el) => {
          if (!el) return;
          this.containerRef.current = el;
          el.onmousewheel = this.onFontSizeChange;

          // Attach mouse event listeners for auto-hide controls
          if (!el._mouseEventsAttached) {
            el._mouseEventsAttached = true;
            el.addEventListener('mousemove', this._handleMouseMove);
            el.addEventListener('mouseleave', this._handleMouseLeave);
            // Start the idle timer
            this._handleMouseMove();
          }
        },
      },
      // Left panel for fullscreen mode
      this.state.isFullscreen && window.FullscreenOverlay && react.createElement(window.FullscreenOverlay, {
        coverUrl: this.state.coverUrl,
        title: this.state.title,
        artist: this.state.artist,
        isFullscreen: this.state.isFullscreen,
        currentLyricIndex: this.state.currentLyricIndex || 0,
        totalLyrics: Array.isArray(this.state.currentLyrics) ? this.state.currentLyrics.length : 0,
        translatedMetadata: this.state.translatedMetadata
      }),
      // Tab bar for mode switching
      topBarContent,
      // Update notification banner
      updateBanner,
      (!CONFIG.visual["video-background"] || this.state.isFADMode) && react.createElement("div", {
        id: "lyrics-plus-gradient-background",
        style: backgroundStyle,
      }),
      !this.state.isFADMode && CONFIG.visual["video-background"] && window.VideoBackground && react.createElement(window.VideoBackground, {
        trackUri: this.state.uri,
        firstLyricTime: this.state.currentLyrics && this.state.currentLyrics.length > 0 ? this.state.currentLyrics[0].startTime : 0,
        brightness: CONFIG.visual["background-brightness"],
        blurAmount: CONFIG.visual["video-blur"],
        coverMode: CONFIG.visual["video-cover"],
        externalVideoInfo: this.state.videoInfo
      }),
      (!CONFIG.visual["video-background"] || this.state.isFADMode) && react.createElement("div", {
        className: "lyrics-lyricsContainer-LyricsBackground",
      }),
      // Phonetic loading indicator
      this.state.isPhoneticLoading &&
      react.createElement(
        "div",
        {
          className: "lyrics-translation-loading-indicator",
        },
        react.createElement(
          "div",
          {
            className: "lyrics-translation-loading-content",
          },
          react.createElement("div", {
            className: "lyrics-translation-loading-spinner",
          }),
          react.createElement(
            "span",
            null,
            I18n.t("notifications.requestingPronunciation")
          )
        )
      ),
      // Translation loading indicator
      this.state.isTranslationLoading &&
      react.createElement(
        "div",
        {
          className: "lyrics-translation-loading-indicator",
          style: { top: this.state.isPhoneticLoading ? "100px" : "20px" },
        },
        react.createElement(
          "div",
          {
            className: "lyrics-translation-loading-content",
          },
          react.createElement("div", {
            className: "lyrics-translation-loading-spinner",
          }),
          react.createElement(
            "span",
            null,
            I18n.t("notifications.requestingTranslation")
          )
        )
      ),
      react.createElement(
        "div",
        {
          className: "lyrics-config-button-container",
        },
        showTranslationButton &&
        react.createElement(TranslationMenu, {
          friendlyLanguage,
          hasTranslation: {},
        }),
        react.createElement(RegenerateTranslationButton, {
          onRegenerate: this.regenerateTranslation,
          isEnabled: canRegenerateTranslation,
          isLoading: this.state.isTranslationLoading,
        }),
        react.createElement(SyncAdjustButton, {
          trackUri: this.currentTrackUri,
          onOffsetChange: (offset) => {
            this.forceUpdate();
          },
        }),
        react.createElement(CommunityVideoButton, {
          trackUri: this.currentTrackUri,
          videoInfo: this.state.videoInfo,
          onVideoSelect: async (newVideoInfo) => {
            this.setState({ videoInfo: newVideoInfo });
            // 선택한 영상을 IndexedDB에 저장
            if (newVideoInfo && this.currentTrackUri) {
              await Utils.saveSelectedVideo(this.currentTrackUri, newVideoInfo);
            }
          },
        }),
        react.createElement(SettingsMenu),
        // Fullscreen toggle button
        (() => !document.getElementById("fad-lyrics-plus-container"))() && react.createElement(
          Spicetify.ReactComponent.TooltipWrapper,
          {
            label: I18n.t("menu.fullscreen"),
          },
          react.createElement(
            "button",
            {
              className: "lyrics-config-button",
              onClick: () => {
                this.toggleFullscreen();
              },
            },
            react.createElement("svg", {
              width: 16,
              height: 16,
              viewBox: "0 0 16 16",
              fill: "currentColor",
              dangerouslySetInnerHTML: {
                __html:
                  Spicetify.SVGIcons["fullscreen"] ||
                  // Fullscreen icon fallback
                  '<path d="M6.064 10.229l-2.418 2.418L2 11v4h4l-1.647-1.646 2.418-2.418-.707-.707zM11 2l1.647 1.647-2.418 2.418.707.707 2.418-2.418L15 6V2h-4z"/>',
              },
            })
          )
        )
      ),
      activeItem
    );

    const dom = ensureReactDOM();
    if (
      this.state.isFullscreen &&
      dom?.createPortal &&
      this.fullscreenContainer
    ) {
      return dom.createPortal(out, this.fullscreenContainer);
    }
    if (fadLyricsContainer && dom?.createPortal) {
      return dom.createPortal(out, fadLyricsContainer);
    }
    return out;
  }

  switchTo(mode) {
    this.setState({ explicitMode: mode });
    this.fetchLyrics();
  }

  lockIn(mode) {
    // 토글: 이미 같은 모드로 고정되어 있으면 해제
    if (this.state.lockMode === mode) {
      CONFIG.locked = -1;
      StorageManager.setItem("lyrics-plus:lock-mode");
      this.setState({ lockMode: -1 });
    } else {
      // 새로운 모드로 고정
      CONFIG.locked = mode;
      StorageManager.setItem("lyrics-plus:lock-mode", mode.toString());
      this.setState({ lockMode: mode });
    }
    this.fetchLyrics();
  }
}

// 초기화 시 저장된 Google Fonts 로드
(function loadGoogleFonts() {
  const GOOGLE_FONTS = [
    "Noto Sans KR",
    "Nanum Gothic",
    "Nanum Myeongjo",
    "Black Han Sans",
    "Do Hyeon",
    "Jua",
    "Nanum Gothic Coding",
    "Gowun Batang",
    "Gowun Dodum",
    "IBM Plex Sans KR",
    "Roboto",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Poppins",
    "Inter",
    "Raleway",
    "Oswald",
    "Merriweather",
    "Playfair Display",
  ];

  const fontsToLoad = new Set();

  // Helper to add fonts from comma-separated string
  const addFonts = (fontString) => {
    if (!fontString) return;
    const fonts = fontString.split(",").map((f) => f.trim().replace(/['"]/g, ""));
    fonts.forEach((font) => {
      if (font && GOOGLE_FONTS.includes(font)) {
        fontsToLoad.add(font);
      }
    });
  };

  // 전체 폰트 (레거시)
  addFonts(CONFIG.visual["font-family"]);

  // 개별 폰트
  addFonts(CONFIG.visual["original-font-family"]);
  addFonts(CONFIG.visual["phonetic-font-family"]);
  addFonts(CONFIG.visual["translation-font-family"]);

  // Google Fonts 로드
  fontsToLoad.forEach((font) => {
    const linkId = `lyrics-plus-google-font-${font.replace(/ /g, "-")}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      // Pretendard는 CDN에서 로드
      if (font === "Pretendard Variable") {
        link.href =
          "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css";
      } else {
        link.href = `https://fonts.googleapis.com/css2?family=${font.replace(
          / /g,
          "+"
        )}:wght@100;200;300;400;500;600;700;800;900&display=swap`;
      }
      document.head.appendChild(link);
    }
  });
})();

// URL Scheme 파라미터 처리
(function handleURLScheme() {
  // 현재 URL의 파라미터를 확인
  const checkURLParams = () => {
    try {
      const currentPath = Spicetify.Platform.History.location.pathname;
      const searchParams = new URLSearchParams(Spicetify.Platform.History.location.search);

      // spotify://lyrics-plus/ 경로인지 확인
      if (currentPath.includes('/lyrics-plus')) {
        // alert 파라미터가 있으면 알림 표시
        const alertMessage = searchParams.get('alert');
        if (alertMessage) {
          Spicetify.showNotification(decodeURIComponent(alertMessage), false, 3000);
          console.log('[Lyrics Plus] URL Scheme alert:', alertMessage);
        }

        // 다른 파라미터들도 처리 가능
        // 예: action, data 등
        const action = searchParams.get('action');
        if (action) {
          console.log('[Lyrics Plus] URL Scheme action:', action);
          // 향후 action 처리 로직 추가 가능
        }
      }
    } catch (error) {
      console.error('[Lyrics Plus] URL Scheme error:', error);
    }
  };

  // 초기 체크
  if (Spicetify.Platform?.History) {
    checkURLParams();

    // History 변경 감지
    Spicetify.Platform.History.listen(() => {
      checkURLParams();
    });
  }
})();
