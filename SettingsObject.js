// SettingsKeys의 순서는 절대 바꾸면 안 됨.
// 새로운 항목은 무조건 맨 뒤에 추가해야 함.
// 또한 기존 항목을 삭제하면 안 됨.
// 최대 길이는 65535이어야 함.
const SettingKeys = [
  "lyrics-plus:visual:playbar-button",
  "lyrics-plus:visual:colorful",
  "lyrics-plus:visual:gradient-background",
  "lyrics-plus:visual:background-brightness",
  "lyrics-plus:visual:solid-background",
  "lyrics-plus:visual:solid-background-color",
  "lyrics-plus:visual:noise",
  "lyrics-plus:visual:background-color",
  "lyrics-plus:visual:active-color",
  "lyrics-plus:visual:inactive-color",
  "lyrics-plus:visual:highlight-color",
  "lyrics-plus:visual:alignment",
  "lyrics-plus:visual:lines-before",
  "lyrics-plus:visual:lines-after",
  "lyrics-plus:visual:font-size",
  "lyrics-plus:visual:font-family",
  "lyrics-plus:visual:original-font-family",
  "lyrics-plus:visual:phonetic-font-family",
  "lyrics-plus:visual:translation-font-family",
  "lyrics-plus:visual:original-font-weight",
  "lyrics-plus:visual:original-font-size",
  "lyrics-plus:visual:translation-font-weight",
  "lyrics-plus:visual:translation-font-size",
  "lyrics-plus:visual:translation-spacing",
  "lyrics-plus:visual:phonetic-font-weight",
  "lyrics-plus:visual:phonetic-font-size",
  "lyrics-plus:visual:phonetic-opacity",
  "lyrics-plus:visual:phonetic-spacing",
  "lyrics-plus:visual:furigana-font-weight",
  "lyrics-plus:visual:furigana-font-size",
  "lyrics-plus:visual:furigana-opacity",
  "lyrics-plus:visual:furigana-spacing",
  "lyrics-plus:visual:text-shadow-enabled",
  "lyrics-plus:visual:text-shadow-color",
  "lyrics-plus:visual:text-shadow-opacity",
  "lyrics-plus:visual:text-shadow-blur",
  "lyrics-plus:visual:original-opacity",
  "lyrics-plus:visual:translation-opacity",
  "lyrics-plus:visual:translate:translated-lyrics-source",
  "lyrics-plus:visual:translate:display-mode",
  "lyrics-plus:visual:translate:detect-language-override",
  "lyrics-plus:visual:translation-mode:english",
  "lyrics-plus:visual:translation-mode:japanese",
  "lyrics-plus:visual:translation-mode:korean",
  "lyrics-plus:visual:translation-mode:chinese",
  "lyrics-plus:visual:translation-mode:russian",
  "lyrics-plus:visual:translation-mode:vietnamese",
  "lyrics-plus:visual:translation-mode:german",
  "lyrics-plus:visual:translation-mode:spanish",
  "lyrics-plus:visual:translation-mode:french",
  "lyrics-plus:visual:translation-mode:italian",
  "lyrics-plus:visual:translation-mode:portuguese",
  "lyrics-plus:visual:translation-mode:dutch",
  "lyrics-plus:visual:translation-mode:polish",
  "lyrics-plus:visual:translation-mode:turkish",
  "lyrics-plus:visual:translation-mode:arabic",
  "lyrics-plus:visual:translation-mode:hindi",
  "lyrics-plus:visual:translation-mode:thai",
  "lyrics-plus:visual:translation-mode:indonesian",
  "lyrics-plus:visual:translation-mode:gemini",
  "lyrics-plus:visual:translation-mode-2:english",
  "lyrics-plus:visual:translation-mode-2:japanese",
  "lyrics-plus:visual:translation-mode-2:korean",
  "lyrics-plus:visual:translation-mode-2:chinese",
  "lyrics-plus:visual:translation-mode-2:russian",
  "lyrics-plus:visual:translation-mode-2:vietnamese",
  "lyrics-plus:visual:translation-mode-2:german",
  "lyrics-plus:visual:translation-mode-2:spanish",
  "lyrics-plus:visual:translation-mode-2:french",
  "lyrics-plus:visual:translation-mode-2:italian",
  "lyrics-plus:visual:translation-mode-2:portuguese",
  "lyrics-plus:visual:translation-mode-2:dutch",
  "lyrics-plus:visual:translation-mode-2:polish",
  "lyrics-plus:visual:translation-mode-2:turkish",
  "lyrics-plus:visual:translation-mode-2:arabic",
  "lyrics-plus:visual:translation-mode-2:hindi",
  "lyrics-plus:visual:translation-mode-2:thai",
  "lyrics-plus:visual:translation-mode-2:indonesian",
  "lyrics-plus:visual:translation-mode-2:gemini",
  "lyrics-plus:visual:gemini-api-key",
  "lyrics-plus:visual:gemini-api-key-romaji",
  "lyrics-plus:visual:translate",
  "lyrics-plus:visual:furigana-enabled",
  "lyrics-plus:visual:ja-detect-threshold",
  "lyrics-plus:visual:hans-detect-threshold",
  "lyrics-plus:visual:fade-blur",
  "lyrics-plus:visual:karaoke-bounce",
  "lyrics-plus:visual:karaoke-mode-enabled",
  "lyrics-plus:visual:fullscreen-key",
  "lyrics-plus:visual:synced-compact",
  "lyrics-plus:visual:global-delay",
  "lyrics-plus:provider:lrclib:on",
  "lyrics-plus:provider:ivlyrics:on",
  "lyrics-plus:provider:spotify:on",
  "lyrics-plus:provider:local:on",
  "lyrics-plus:services-order",
  "lyrics-plus:lock-mode",
  "lyrics-plus:local-lyrics",
  "lyrics-plus:track-sync-offsets",
  "lyrics-plus:visual:video-background",
  "lyrics-plus:visual:video-blur",
  "lyrics-plus:visual:fullscreen-two-column",
  "lyrics-plus:visual:fullscreen-show-album",
  "lyrics-plus:visual:fullscreen-show-info",
  "lyrics-plus:visual:fullscreen-center-when-no-lyrics",
  "lyrics-plus:visual:fullscreen-album-size",
  "lyrics-plus:visual:fullscreen-album-radius",
  "lyrics-plus:visual:fullscreen-title-size",
  "lyrics-plus:visual:fullscreen-artist-size",
  "lyrics-plus:visual:fullscreen-lyrics-right-padding",
  "lyrics-plus:visual:fullscreen-show-clock",
  "lyrics-plus:visual:fullscreen-clock-size",
  "lyrics-plus:visual:fullscreen-show-context",
  "lyrics-plus:visual:fullscreen-show-next-track",
  "lyrics-plus:visual:fullscreen-next-track-seconds",
  "lyrics-plus:visual:fullscreen-show-controls",
  "lyrics-plus:visual:fullscreen-show-volume",
  "lyrics-plus:visual:fullscreen-show-progress",
  "lyrics-plus:visual:fullscreen-show-lyrics-progress",
  "lyrics-plus:visual:fullscreen-control-button-size",
  "lyrics-plus:visual:fullscreen-controls-background",
  "lyrics-plus:visual:fullscreen-auto-hide-ui",
  "lyrics-plus:visual:fullscreen-auto-hide-delay",
  "lyrics-plus:visual:video-cover",
  "lyrics-plus:visual:prefetch-enabled",
  "lyrics-plus:visual:prefetch-video-enabled",
  "lyrics-plus:visual:fullscreen-layout-reverse",
  "lyrics-plus:visual:language",
];

const BYTES_FOR_INDEX = Math.ceil(SettingKeys.length / 255);
const CUSTOM_INDEX_PREFIX = new Array(BYTES_FOR_INDEX).fill(0xff);

// PRE_DEFINED_VALUES의 길이는 255 미만이어야 함.
// 나머지 사항은 SettingKeys와 동일함.
const PRE_DEFINED_VALUES = [
  // boolean values
  "true",
  "false",

  // translation sources
  "geminiKo",
  "gemini_ko",
  "geminiJa",
  "gemini_ja",
  "geminiZh",
  "gemini_zh",
  "geminiEn",
  "gemini_en",
  "geminiRomaji",
  "gemini_romaji",

  // alignment options
  "below",
  "above",
  "auto",
  "center",
  "left",
  "right",

  // font weights
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",

  // font names
  "Pretendard Variable",
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

if (PRE_DEFINED_VALUES.length >= 255) {
  throw new Error("PRE_DEFINED_VALUES length exceeds 255");
}

const toIgnore = new Set([
  "lyrics-plus:local-lyrics",
]);

class SettingsObject {
  // 다음과 같은 양식으로 문자화함.
  // [커스텀 키 개수:2바이트]
  // - [커스텀 키 1 길이:2바이트][커스텀 키 1 문자들...]
  // - [커스텀 키 2 길이:2바이트][커스텀 키 2 문자들...]
  // ...
  // [설정 키 개수:2바이트]
  // - [키 인덱스:BYTES_FOR_INDEX 바이트] 또는 [0xff... 커스텀 키 접두사][커스텀 키 길이:2바이트][커스텀 키 문자들...]
  // - [값 인덱스:1바이트] 또는 [0xff 커스텀 값 표시][커스텀 값 길이:2바이트][커스텀 값 문자들...]
  serialize(config) {
    console.groupCollapsed("Serializing config");
    console.log("Config:", config);

    const cbytes = [];
    const CONFIG_KEYS = Object.keys(config).filter((x) => !toIgnore.has(x));
    const customKeys = [];
    for (let i = 0; i < CONFIG_KEYS.length; i++) {
      const key = CONFIG_KEYS[i];
      if (!SettingKeys.includes(key)) {
        customKeys.push(key);
        continue;
      }
    }

    const append2BNumber = (length) => {
      if (length < 0 || length >= 256 ** BYTES_FOR_INDEX) {
        throw new Error("Length out of bounds " + length);
      }
      cbytes.push((length >> 8) & 0xff);
      cbytes.push(length & 0xff);
    };

    const append2BNumberForString = (length) => {
      // 문자열 길이는 항상 2바이트(최대 65535)로 저장
      if (length < 0 || length >= 65536) {
        throw new Error("String length out of bounds " + length);
      }
      cbytes.push((length >> 8) & 0xff);
      cbytes.push(length & 0xff);
    };

    const appendString = (str) => {
      append2BNumberForString(str.length);
      for (let j = 0; j < str.length; j++) {
        cbytes.push(str.charCodeAt(j));
      }
    };

    const customKeyCount = customKeys.length;
    append2BNumber(customKeyCount);

    if (customKeyCount > 65535) {
      throw new Error("Custom key count exceeds 65535");
    }

    console.log("Custom Keys:", customKeys);
    for (let i = 0; i < customKeys.length; i++) {
      const key = customKeys[i];
      appendString(key);
    }

    append2BNumber(CONFIG_KEYS.length);
    for (let i = 0; i < CONFIG_KEYS.length; i++) {
      const key = CONFIG_KEYS[i];
      console.log("Key:", key);
      if (customKeys.includes(key)) {
        console.log("CKey:", key);
        // 커스텀 키인 경우
        cbytes.push(...CUSTOM_INDEX_PREFIX);
        const keyIndex = customKeys.indexOf(key);
        append2BNumber(keyIndex);
      } else {
        const keyIndex = SettingKeys.indexOf(key);
        if (keyIndex === -1) throw new Error("Key not found in SettingKeys");

        // 인덱스 추가
        append2BNumber(keyIndex);
      }

      // 값 추가
      const value = config[key];
      if (typeof value !== "string") {
        throw new Error("Only string values are supported");
      }

      const predefinedIndex = PRE_DEFINED_VALUES.indexOf(value);
      if (predefinedIndex !== -1) {
        // 사전 정의된 값인 경우
        cbytes.push(predefinedIndex);
      } else {
        cbytes.push(0xff); // 커스텀 값임을 나타내는 표시
        appendString(value);
      }
    }

    console.log("Serialized bytes:", cbytes);
    console.log(
      "Serialized string:",
      new TextDecoder().decode(new Uint8Array(cbytes))
    );
    console.log("Total bytes:", cbytes.length);
    console.groupEnd();
    return new Uint8Array(cbytes);
  }

  deserialize(byteArray) {
    console.groupCollapsed("Deserializing byte array");
    console.log("Byte array:", byteArray);

    let offset = 0;

    const read2BNumber = () => {
      if (offset + 2 > byteArray.length) {
        throw new Error("Unexpected end of byte array");
      }
      const value = (byteArray[offset] << 8) | byteArray[offset + 1];
      offset += 2;
      return value;
    };

    const readString = () => {
      const length = read2BNumber();
      if (offset + length > byteArray.length) {
        throw new Error("Unexpected end of byte array");
      }
      let str = "";
      for (let j = 0; j < length; j++) {
        str += String.fromCharCode(byteArray[offset + j]);
      }
      offset += length;
      return str;
    };

    const customKeyCount = read2BNumber();
    const customKeys = [];
    for (let i = 0; i < customKeyCount; i++) {
      const key = readString();
      customKeys.push(key);
    }
    console.log("Custom Keys:", customKeys);

    const configCount = read2BNumber();
    const config = {};
    for (let i = 0; i < configCount; i++) {
      let key;
      // 키 읽기
      let isCustomKey = true;
      for (let j = 0; j < BYTES_FOR_INDEX; j++) {
        if (byteArray[offset + j] !== 0xff) {
          isCustomKey = false;
          break;
        }
      }

      if (isCustomKey) {
        offset += BYTES_FOR_INDEX;
        key = customKeys[read2BNumber()];
      } else {
        const keyIndex = read2BNumber();
        if (keyIndex < 0 || keyIndex >= SettingKeys.length) {
          throw new Error("Invalid key index: " + keyIndex);
        }
        key = SettingKeys[keyIndex];
      }

      // 값 읽기
      const valueIndicator = byteArray[offset++];
      let value;
      if (valueIndicator === 0xff) {
        value = readString();
      } else {
        if (valueIndicator < 0 || valueIndicator >= PRE_DEFINED_VALUES.length) {
          throw new Error("Invalid predefined value index: " + valueIndicator);
        }
        value = PRE_DEFINED_VALUES[valueIndicator];
      }

      config[key] = value;
    }

    console.log("Deserialized config:", config);

    console.groupEnd();
    return config;
  }
}

const settingsObject = new SettingsObject();
