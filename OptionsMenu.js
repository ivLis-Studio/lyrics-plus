const OptionsMenuItemIcon = react.createElement(
  "svg",
  {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "currentColor",
  },
  react.createElement("path", {
    d: "M13.985 2.383L5.127 12.754 1.388 8.375l-.658.77 4.397 5.149 9.618-11.262z",
  })
);

// Optimized OptionsMenuItem with better performance
const OptionsMenuItem = react.memo(({ onSelect, value, isSelected }) => {
  // React 130 방지: Hook 순서 일관성 유지
  const menuItemProps = useMemo(
    () => ({
      onClick: onSelect,
      icon: isSelected ? OptionsMenuItemIcon : null,
      trailingIcon: isSelected ? OptionsMenuItemIcon : null,
    }),
    [onSelect, isSelected]
  );

  // React 31 방지: value가 유효한지 확인
  const safeValue = value || "";

  return react.createElement(
    Spicetify.ReactComponent.MenuItem,
    menuItemProps,
    safeValue
  );
});

const OptionsMenu = react.memo(
  ({ options, onSelect, selected, defaultValue, bold = false }) => {
    /**
     * <Spicetify.ReactComponent.ContextMenu
     *      menu = { options.map(a => <OptionsMenuItem>) }
     * >
     *      <button>
     *          <span> {select.value} </span>
     *          <svg> arrow icon </svg>
     *      </button>
     * </Spicetify.ReactComponent.ContextMenu>
     */
    // React 130 방지: Hook은 항상 같은 순서로 호출
    const menuRef = react.useRef(null);

    // React 31 방지: options 배열 유효성 검사
    const safeOptions = Array.isArray(options) ? options : [];

    return react.createElement(
      Spicetify.ReactComponent.ContextMenu,
      {
        menu: react.createElement(
          Spicetify.ReactComponent.Menu,
          {},
          safeOptions.map(({ key, value }) =>
            react.createElement(OptionsMenuItem, {
              key: key, // React warning 방지를 위한 key prop 추가
              value,
              onSelect: () => {
                onSelect(key);
                // Close menu on item click
                menuRef.current?.click();
              },
              isSelected: selected?.key === key,
            })
          )
        ),
        trigger: "click",
        action: "toggle",
        renderInline: false,
      },
      react.createElement(
        "button",
        {
          className: "optionsMenu-dropBox",
          ref: menuRef,
        },
        react.createElement(
          "span",
          {
            className: bold ? "main-type-mestoBold" : "main-type-mesto",
          },
          selected?.value || defaultValue
        ),
        react.createElement(
          "svg",
          {
            height: "16",
            width: "16",
            fill: "currentColor",
            viewBox: "0 0 16 16",
          },
          react.createElement("path", {
            d: "M3 6l5 5.794L13 6z",
          })
        )
      )
    );
  }
);

const ICONS = {
  provider: `<path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zM8 10.93a2.93 2.93 0 1 1 0-5.86 2.93 2.93 0 0 1 0 5.86z"/>`,
  display: `<path d="M1 1h5v5H1V1zm6 0h8v5H7V1zm-6 6h5v8H1V7zm6 0h8v8H7V7z"/>`,
  mode: `<path d="M10.5 1a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-1 0v-12a.5.5 0 0 1 .5-.5zm-4 0a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-1 0v-12a.5.5 0 0 1 .5-.5zm-4 0a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-1 0v-12a.5.5 0 0 1 .5-.5z"/>`,
  language: `<path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1.026 7.5h1.332c.05.586.13 1.15.24 1.696-1.012-.34-1.782-.93-2.13-1.696zM14.974 7.5h-1.332a10.034 10.034 0 0 1-.24 1.696c1.012-.34 1.782-.93 2.13-1.696zM8 15c-1.07 0-2.096-.21-3.034-.604a.5.5 0 0 0-.416.924C5.59 15.8 6.758 16 8 16s2.41-.2 3.45-.68a.5.5 0 0 0-.416-.924C10.096 14.79 9.07 15 8 15zm0-1.5c.983 0 1.912-.18 2.76-.502.848-.323 1.543-.8 2.062-1.405.519-.604.85-1.353.972-2.155H2.206c.122.802.453 1.551.972 2.155.519.605 1.214 1.082 2.062 1.405C6.088 13.32 7.017 13.5 8 13.5z"/>`,
};

// 최적화 #5 - 공통 버튼 스타일 추출
const BUTTON_STYLES = {
  adjustBase: {
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "8px",
    color: "#ffffff",
    cursor: "pointer",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "600",
    minWidth: "52px",
    letterSpacing: "-0.01em",
    transition: "all 0.2s ease",
  },
  adjustHover: {
    background: "rgba(255, 255, 255, 0.12)",
    transform: "translateY(-1px)",
  },
  adjustNormal: {
    background: "rgba(255, 255, 255, 0.08)",
    transform: "translateY(0)",
  }
};

// 최적화 #5 - 재사용 가능한 Adjust 버튼 컴포넌트
const AdjustButton = ({ value, onClick }) => {
  return react.createElement("button", {
    onClick,
    style: BUTTON_STYLES.adjustBase,
    onMouseEnter: (e) => {
      Object.assign(e.target.style, BUTTON_STYLES.adjustHover);
    },
    onMouseLeave: (e) => {
      Object.assign(e.target.style, BUTTON_STYLES.adjustNormal);
    },
  }, value);
};

const SettingRowDescription = ({ icon, text }) => {
  return react.createElement(
    "div",
    { className: "setting-row-with-icon" },
    // React 310 방지: icon이 문자열이고 비어있지 않을 때만 렌더링
    icon &&
      typeof icon === "string" &&
      icon &&
      react.createElement("svg", {
        width: 16,
        height: 16,
        viewBox: "0 0 16 16",
        fill: "currentColor",
        dangerouslySetInnerHTML: { __html: icon },
      }),
    react.createElement("span", null, text || "")
  );
};

// Helper: open a compact options modal using existing settings styles
function openOptionsModal(title, items, onChange, eventType = null) {
  const container = react.createElement(
    "div",
    { id: `${APP_NAME}-config-container` },
    react.createElement("style", {
      dangerouslySetInnerHTML: {
        __html: `
/* iOS 18 Design - 변환 설정 모달 */
#${APP_NAME}-config-container {
	padding: 0;
	background: transparent;
	color: #ffffff;
	font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
	width: 100%;
}

/* 섹션 타이틀 - 카드 헤더 스타일 */
#${APP_NAME}-config-container .section-title {
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-top-left-radius: 12px;
	border-top-right-radius: 12px;
	border-bottom: none;
	backdrop-filter: blur(30px) saturate(150%);
	-webkit-backdrop-filter: blur(30px) saturate(150%);
	padding: 16px 16px 12px 16px;
	margin-top: 24px;
	margin-bottom: 0;
}

#${APP_NAME}-config-container .section-title:first-child {
	margin-top: 0;
}

#${APP_NAME}-config-container .section-title h3 {
	margin: 0 0 4px;
	font-size: 17px;
	font-weight: 600;
	color: #ffffff;
	letter-spacing: -0.02em;
}

#${APP_NAME}-config-container .section-title p {
	margin: 0;
	font-size: 13px;
	color: #8e8e93;
	line-height: 1.4;
	letter-spacing: -0.01em;
}

/* Setting Row */
#${APP_NAME}-config-container .setting-row {
	padding: 0;
	margin: 0;
	background: rgba(28, 28, 30, 0.5);
	backdrop-filter: blur(30px) saturate(150%);
	-webkit-backdrop-filter: blur(30px) saturate(150%);
	border-left: 1px solid rgba(255, 255, 255, 0.08);
	border-right: 1px solid rgba(255, 255, 255, 0.08);
	border-top: none;
	border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
	transition: background 0.15s ease;
}

#${APP_NAME}-config-container .section-title + .setting-row:first-of-type {
	border-top: none;
}

#${APP_NAME}-config-container .setting-row:last-of-type {
	border-bottom-left-radius: 12px;
	border-bottom-right-radius: 12px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

#${APP_NAME}-config-container .setting-row:hover {
	background: rgba(44, 44, 46, 0.6);
}

#${APP_NAME}-config-container .setting-row:active {
	background: rgba(58, 58, 60, 0.7);
}

#${APP_NAME}-config-container .setting-row-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 24px;
	padding: 12px 16px;
	min-height: 44px;
}

#${APP_NAME}-config-container .setting-row-left {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 6px;
}

#${APP_NAME}-config-container .setting-row-right {
	flex-shrink: 0;
	display: flex;
	align-items: center;
}

#${APP_NAME}-config-container .setting-name {
	font-weight: 400;
	font-size: 15px;
	color: #ffffff;
	line-height: 1.3;
	letter-spacing: -0.01em;
}

#${APP_NAME}-config-container .setting-description {
	font-size: 13px;
	color: #8e8e93;
	line-height: 1.35;
	letter-spacing: -0.01em;
}

#${APP_NAME}-config-container .setting-row-with-icon {
	display: flex;
	align-items: center;
	gap: 10px;
	color: #ffffff;
	font-weight: 400;
	font-size: 15px;
	letter-spacing: -0.01em;
}

#${APP_NAME}-config-container .setting-row-with-icon svg {
	flex-shrink: 0;
	opacity: 0.8;
	color: #8e8e93;
}

/* Button - iOS 스타일 */
#${APP_NAME}-config-container .btn {
	background: #007aff;
	border: none;
	border-radius: 10px;
	color: #ffffff;
	font-weight: 600;
	padding: 0 16px;
	min-height: 36px;
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 15px;
	letter-spacing: -0.01em;
}

#${APP_NAME}-config-container .btn:hover:not(:disabled) {
	background: #0066cc;
	transform: scale(1.02);
}

#${APP_NAME}-config-container .btn:active:not(:disabled) {
	background: #0055b3;
	transform: scale(0.98);
}

#${APP_NAME}-config-container .btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
	transform: none;
}

/* iOS 토글 스위치 - 완전히 새로 작성 */
#${APP_NAME}-config-container .switch-checkbox {
	width: 51px;
	height: 31px;
	border-radius: 15.5px;
	background-color: #3a3a3c;
	border: none;
	cursor: pointer;
	position: relative;
	flex-shrink: 0;
	transition: background-color 0.2s ease;
	-webkit-tap-highlight-color: transparent;
}

#${APP_NAME}-config-container .switch-checkbox::after {
	content: "";
	position: absolute;
	top: 2px;
	left: 2px;
	width: 27px;
	height: 27px;
	border-radius: 50%;
	background-color: #ffffff;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	transition: transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
}

#${APP_NAME}-config-container .switch-checkbox.active {
	background-color: #34c759;
}

#${APP_NAME}-config-container .switch-checkbox.active::after {
	transform: translateX(20px);
}

#${APP_NAME}-config-container .switch-checkbox svg {
	display: none;
	visibility: hidden;
}

/* Custom Modal Overlay - 일반 설정과 동일한 스타일 */
#lyrics-plus-translation-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.4);
	backdrop-filter: blur(60px) saturate(200%) brightness(1.1);
	-webkit-backdrop-filter: blur(60px) saturate(200%) brightness(1.1);
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
	animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

#lyrics-plus-translation-modal {
	background: rgba(28, 28, 30, 0.95);
	backdrop-filter: blur(60px) saturate(200%);
	-webkit-backdrop-filter: blur(60px) saturate(200%);
	border-radius: 16px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
	max-width: 520px;
	width: 90%;
	max-height: 80vh;
	overflow-y: auto;
	animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: scale(0.95) translateY(20px);
	}
	to {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

/* 모달 헤더 */
#lyrics-plus-translation-modal .modal-header {
	padding: 24px 24px 16px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	display: flex;
	align-items: center;
	justify-content: space-between;
}

#lyrics-plus-translation-modal .modal-header h2 {
	margin: 0;
	font-size: 22px;
	font-weight: 700;
	color: #ffffff;
	letter-spacing: -0.02em;
}

#lyrics-plus-translation-modal .modal-close {
	background: rgba(255, 255, 255, 0.1);
	border: none;
	border-radius: 50%;
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
	color: #ffffff;
}

#lyrics-plus-translation-modal .modal-close:hover {
	background: rgba(255, 255, 255, 0.15);
	transform: scale(1.05);
}

#lyrics-plus-translation-modal .modal-close:active {
	transform: scale(0.95);
}

#lyrics-plus-translation-modal .modal-close svg {
	width: 20px;
	height: 20px;
}

/* 모달 바디 */
#lyrics-plus-translation-modal .modal-body {
	padding: 24px;
}

/* 스크롤바 스타일 */
#lyrics-plus-translation-modal::-webkit-scrollbar {
	width: 8px;
}

#lyrics-plus-translation-modal::-webkit-scrollbar-track {
	background: transparent;
}

#lyrics-plus-translation-modal::-webkit-scrollbar-thumb {
	background: rgba(255, 255, 255, 0.2);
	border-radius: 4px;
}

#lyrics-plus-translation-modal::-webkit-scrollbar-thumb:hover {
	background: rgba(255, 255, 255, 0.3);
}
`,
      },
    }),
    // Render sections
    items.map((section, sectionIndex) =>
      react.createElement(
        react.Fragment,
        { key: sectionIndex },
        // Section Title
        section.section &&
          react.createElement(
            "div",
            { className: "section-title" },
            react.createElement("h3", null, section.section),
            section.subtitle && react.createElement("p", null, section.subtitle)
          ),
        // Section Items
        react.createElement(
          OptionList,
          Object.assign(
            {
              items: section.items || [section],
              onChange,
            },
            eventType ? { type: eventType } : {}
          )
        )
      )
    )
  );

  // Create custom modal instead of using Spicetify.PopupModal
  const overlay = document.createElement("div");
  overlay.id = "lyrics-plus-translation-overlay";

  const modal = document.createElement("div");
  modal.id = "lyrics-plus-translation-modal";

  // Modal header
  const header = document.createElement("div");
  header.className = "modal-header";

  const headerTitle = document.createElement("h2");
  headerTitle.textContent = title;

  const closeBtn = document.createElement("button");
  closeBtn.className = "modal-close";
  closeBtn.innerHTML =
    '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/></svg>';
  closeBtn.onclick = () => overlay.remove();

  header.appendChild(headerTitle);
  header.appendChild(closeBtn);

  // Modal body
  const body = document.createElement("div");
  body.className = "modal-body";

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  // Render React content in body
  Spicetify.ReactDOM.render(container, body);

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  };

  // Close on ESC key
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", handleEsc);
    }
  };
  document.addEventListener("keydown", handleEsc);

  // Add to DOM
  document.body.appendChild(overlay);
}

// Debounce handle for adjustments modal
let adjustmentsDebounceTimeout = null;

// Define static options as a function to support i18n (called at render time)
const getStaticOptions = () => ({
  modeBase: {
    none: I18n.t("translationMenu.none"),
  },
  geminiModes: {
    gemini_romaji: I18n.t("translationMenu.geminiRomaji"),
    gemini_ko: I18n.t("translationMenu.geminiKo"),
  },
  languageModes: {
    japanese: {
      furigana: I18n.t("translationMenu.furigana"),
      romaji: I18n.t("translationMenu.romaji"),
      hiragana: I18n.t("translationMenu.hiragana"),
      katakana: I18n.t("translationMenu.katakana"),
    },
    korean: {
      romaja: I18n.t("translationMenu.romaji"),
    },
    chinese: {
      cn: I18n.t("translationMenu.simplifiedChinese"),
      hk: I18n.t("translationMenu.traditionalChineseHK"),
      tw: I18n.t("translationMenu.traditionalChineseTW"),
      pinyin: I18n.t("translationMenu.pinyin"),
    },
    // Gemini-powered languages
    russian: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    vietnamese: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    german: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    spanish: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    french: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    italian: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    portuguese: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    dutch: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    polish: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    turkish: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    arabic: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    hindi: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    thai: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
    indonesian: {
      gemini_romaji: I18n.t("translationMenu.romajiGemini"),
      gemini_ko: I18n.t("translationMenu.koGemini"),
    },
  },
});

const TranslationMenu = react.memo(({ friendlyLanguage, hasTranslation }) => {
  // Open modal on click instead of ContextMenu to avoid xpui hook errors
  const open = () => {
    // Force geminiKo provider
    CONFIG.visual["translate:translated-lyrics-source"] = "geminiKo";
    StorageManager.setItem(
      `${APP_NAME}:visual:translate:translated-lyrics-source`,
      "geminiKo"
    );

    // Force "below" display mode
    CONFIG.visual["translate:display-mode"] = "below";
    StorageManager.setItem(
      `${APP_NAME}:visual:translate:display-mode`,
      "below"
    );

    // Determine the correct mode key based on language
    const provider = CONFIG.visual["translate:translated-lyrics-source"];
    const modeKey =
      provider === "geminiKo" && !friendlyLanguage
        ? "gemini"
        : friendlyLanguage;

    console.log(
      "[TranslationMenu] Language:",
      friendlyLanguage,
      "ModeKey:",
      modeKey
    );
    console.log("[TranslationMenu] Current values:");
    console.log(
      `translation-mode:${modeKey} =`,
      CONFIG.visual[`translation-mode:${modeKey}`]
    );
    console.log(
      `translation-mode-2:${modeKey} =`,
      CONFIG.visual[`translation-mode-2:${modeKey}`]
    );

    const STATIC_OPTIONS = getStaticOptions();
    let modeOptions = STATIC_OPTIONS.geminiModes;

    // 감지된 언어를 사용자 친화적인 이름으로 변환
    const getDisplayLanguageName = (lang) => {
      if (!lang) return I18n.t("menu.unknownLanguage");
      try {
        // 현재 UI 언어로 언어 이름 표시
        const uiLang = I18n.getCurrentLanguage();
        const displayName = new Intl.DisplayNames([uiLang], { type: "language" }).of(lang);
        return displayName || lang;
      } catch {
        return lang;
      }
    };

    const displayLanguageName = getDisplayLanguageName(friendlyLanguage);

    const items = [
      {
        section: I18n.t("menu.detectedLanguage"),
        subtitle: I18n.t("menu.detectedLanguageInfo"),
        items: [
          {
            desc: react.createElement(SettingRowDescription, {
              icon: ICONS.language,
              text: displayLanguageName,
            }),
            key: "detected-language-display",
            type: "info",
          },
        ],
      },
      {
        section: I18n.t("menu.translationOptions"),
        subtitle: I18n.t("menu.translationOptionsSubtitle"),
        items: [
          {
            desc: react.createElement(SettingRowDescription, {
              icon: ICONS.mode,
              text: I18n.t("menu.pronunciation"),
            }),
            key: `translation-mode:${modeKey}`,
            type: ConfigSlider,
            defaultValue:
              CONFIG.visual[`translation-mode:${modeKey}`] !== "none",
            renderInline: true,
            info: I18n.t("menu.pronunciationInfo"),
          },
          {
            desc: react.createElement(SettingRowDescription, {
              icon: ICONS.mode,
              text: I18n.t("menu.translationLabel"),
            }),
            key: `translation-mode-2:${modeKey}`,
            type: ConfigSlider,
            defaultValue:
              CONFIG.visual[`translation-mode-2:${modeKey}`] !== "none",
            renderInline: true,
            info: I18n.t("menu.translationInfo"),
          },
        ],
      },
      {
        section: I18n.t("menu.apiSettings"),
        subtitle: I18n.t("menu.apiSettingsSubtitle"),
        items: [
          {
            desc: react.createElement(SettingRowDescription, {
              icon: ICONS.provider,
              text: I18n.t("menu.apiKeySettings"),
            }),
            key: "open-api-settings",
            type: ConfigButton,
            text: I18n.t("menu.openSettings"),
            onChange: () => {
              // Close the current modal and open settings at API tab
              const overlay = document.getElementById(
                "lyrics-plus-settings-overlay"
              );
              if (overlay) {
                overlay.remove();
              }
              // Open main settings and switch to advanced tab
              setTimeout(() => {
                openConfig();
                // Wait for modal to render, then switch to advanced tab
                setTimeout(() => {
                  const advancedTab = document.querySelector(
                    '[data-tab-id="advanced"]'
                  );
                  if (advancedTab) {
                    advancedTab.click();
                  }
                }, 100);
              }, 100);
            },
            info: I18n.t("menu.apiKeySettingsInfo"),
          },
        ],
      },
    ];

    openOptionsModal(I18n.t("menu.translationSettings"), items, (name, value) => {
      // Skip processing for button items
      if (name === "open-api-settings") {
        return;
      }

      // Handle toggle values - convert boolean to appropriate mode string
      if (name.startsWith("translation-mode")) {
        // For first line (발음), set to romaji or none
        if (name.startsWith(`translation-mode:`) && !name.includes("mode-2")) {
          value = value ? "gemini_romaji" : "none";
        }
        // For second line (번역), set to korean or none
        else if (name.startsWith(`translation-mode-2:`)) {
          value = value ? "gemini_ko" : "none";
        }
      }

      CONFIG.visual[name] = value;
      StorageManager.setItem(`${APP_NAME}:visual:${name}`, value);

      if (name.startsWith("translation-mode")) {
        if (window.lyricContainer) {
          // Clear translation cache to force reload with new settings
          window.lyricContainer._dmResults = {};
          window.lyricContainer.lastProcessedUri = null;
          window.lyricContainer.lastProcessedMode = null;
          window.lyricContainer.forceUpdate();
        }
      }

      lyricContainerUpdate?.();
    });
  };

  return react.createElement(
    Spicetify.ReactComponent.TooltipWrapper,
    { label: I18n.t("menu.translation") },
    react.createElement(
      "button",
      { className: "lyrics-config-button", onClick: open },
      react.createElement(
        "svg",
        { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
        react.createElement("path", {
          d: "M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM5.78 8.5a.5.5 0 0 1-.5.5H3.5a.5.5 0 0 1 0-1h1.78a.5.5 0 0 1 .5.5zm6.72 0a.5.5 0 0 1-.5.5h-1.78a.5.5 0 0 1 0-1H12a.5.5 0 0 1 .5.5zM8 12a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 1 0v7a.5.5 0 0 1-.5.5z",
        }),
        react.createElement("path", {
          d: "M6.854 5.854a.5.5 0 1 0-.708-.708l-2 2a.5.5 0 0 0 0 .708l2 2a.5.5 0 0 0 .708-.708L5.207 7.5l1.647-1.646zm2.292 0a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.793 7.5 9.146 5.854z",
        })
      )
    )
  );
});

const RegenerateTranslationButton = react.memo(
  ({ onRegenerate, isEnabled, isLoading }) => {
    return react.createElement(
      Spicetify.ReactComponent.TooltipWrapper,
      { label: I18n.t("menu.regenerateTranslation") },
      react.createElement(
        "button",
        {
          className: "lyrics-config-button",
          onClick: onRegenerate,
          disabled: !isEnabled || isLoading,
          style: {
            opacity: !isEnabled || isLoading ? 0.4 : 1,
            cursor: !isEnabled || isLoading ? "not-allowed" : "pointer",
          },
        },
        react.createElement(
          "svg",
          { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
          react.createElement("path", {
            d: "M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z",
          }),
          react.createElement("path", {
            d: "M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z",
          })
        )
      )
    );
  }
);

const SyncAdjustButton = react.memo(
  ({ trackUri, onOffsetChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [offset, setOffset] = useState(0);
    const [communityData, setCommunityData] = useState(null);
    const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState(null); // 'positive', 'negative', null
    const [isSubmitting, setIsSubmitting] = useState(false);
    const buttonRef = useRef(null);
    const submitTimeoutRef = useRef(null);

    // Load offset when trackUri changes
    useEffect(() => {
      const loadOffset = async () => {
        const savedOffset = (await Utils.getTrackSyncOffset(trackUri)) || 0;
        setOffset(savedOffset);
      };
      loadOffset();
    }, [trackUri]);

    // Load community data when modal opens
    useEffect(() => {
      if (isOpen && CONFIG.visual["community-sync-enabled"]) {
        loadCommunityData();
      }
    }, [isOpen, trackUri]);

    const loadCommunityData = async () => {
      setIsLoadingCommunity(true);
      try {
        const data = await Utils.getCommunityOffset(trackUri);
        setCommunityData(data);
        // 사용자의 기존 피드백 상태 복원
        if (data?.user?.userFeedback !== null && data?.user?.userFeedback !== undefined) {
          setFeedbackStatus(data.user.userFeedback ? 'positive' : 'negative');
        }
      } catch (error) {
        console.error("[Lyrics Plus] Failed to load community data:", error);
      } finally {
        setIsLoadingCommunity(false);
      }
    };

    // Listen for community offset changes
    useEffect(() => {
      const handleCommunityOffsetChange = (event) => {
        if (event.detail?.trackUri === trackUri) {
          setOffset(event.detail.offset);
        }
      };
      window.addEventListener('lyrics-plus:offset-changed', handleCommunityOffsetChange);
      return () => {
        window.removeEventListener('lyrics-plus:offset-changed', handleCommunityOffsetChange);
      };
    }, [trackUri]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current);
        }
      };
    }, []);

    const handleOffsetChange = async (newOffset) => {
      setOffset(newOffset);
      await Utils.setTrackSyncOffset(trackUri, newOffset);
      if (onOffsetChange) {
        onOffsetChange(newOffset);
      }

      // 커뮤니티 싱크 자동 제출 (디바운스 적용)
      if (CONFIG.visual["community-sync-enabled"] && CONFIG.visual["community-sync-auto-submit"]) {
        // 이전 타이머 취소
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current);
        }
        
        // 1초 후에 제출 (사용자가 조정을 멈추면)
        submitTimeoutRef.current = setTimeout(async () => {
          try {
            await Utils.submitCommunityOffset(trackUri, newOffset);
            loadCommunityData(); // 제출 후 커뮤니티 데이터 새로고침
          } catch (error) {
            console.error("[Lyrics Plus] Failed to auto-submit offset:", error);
          }
        }, 1000);
      }
    };

    const adjustOffset = (delta) => {
      const newOffset = Math.max(-10000, Math.min(10000, offset + delta));
      handleOffsetChange(newOffset);
    };

    const handleSliderChange = (event) => {
      const newOffset = Number(event.target.value);
      handleOffsetChange(newOffset);
    };

    const resetOffset = () => {
      handleOffsetChange(0);
    };

    const toggleModal = () => {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setFeedbackStatus(null);
      }
    };

    // 커뮤니티 오프셋 적용
    const applyCommunityOffset = async () => {
      if (!communityData) return;
      const communityOffset = communityData.medianOffsetMs ?? communityData.offsetMs ?? 0;
      handleOffsetChange(communityOffset);
    };

    // 수동 제출
    const submitOffset = async () => {
      if (!CONFIG.visual["community-sync-enabled"]) return;
      setIsSubmitting(true);
      try {
        await Utils.submitCommunityOffset(trackUri, offset);
        // 로컬 캐시 삭제하여 새 데이터 반영
        const trackId = Utils.extractTrackId(trackUri);
        if (trackId) {
          await LyricsCache.deleteSync(trackId);
        }
        Spicetify.showNotification(I18n.t("syncAdjust.submitSuccess"), false, 2000);
        loadCommunityData();
      } catch (error) {
        Spicetify.showNotification(I18n.t("syncAdjust.submitFailed"), true, 2000);
      } finally {
        setIsSubmitting(false);
      }
    };

    // 피드백 제출
    const submitFeedback = async (isPositive) => {
      if (!CONFIG.visual["community-sync-enabled"]) return;
      // 자신이 제출한 오프셋에는 피드백 불가
      if (communityData?.user?.hasSubmitted) {
        Spicetify.showNotification(I18n.t("syncAdjust.cannotFeedbackOwnSubmission"), true, 2000);
        return;
      }
      try {
        await Utils.submitCommunityFeedback(trackUri, isPositive);
        setFeedbackStatus(isPositive ? 'positive' : 'negative');
        Spicetify.showNotification(
          isPositive ? I18n.t("syncAdjust.feedbackPositiveSuccess") : I18n.t("syncAdjust.feedbackNegativeSuccess"),
          false,
          2000
        );
      } catch (error) {
        console.error("[Lyrics Plus] Failed to submit feedback:", error);
        Spicetify.showNotification(I18n.t("syncAdjust.feedbackFailed"), true, 2000);
      }
    };

    // 신뢰도 표시 색상
    const getConfidenceColor = (confidence) => {
      if (confidence >= 0.8) return "#34c759"; // 녹색
      if (confidence >= 0.5) return "#ff9500"; // 주황
      return "#ff3b30"; // 빨강
    };

    // 신뢰도 레벨 텍스트
    const getConfidenceLevel = (confidence) => {
      if (confidence >= 0.8) return I18n.t("syncAdjust.confidenceHigh");
      if (confidence >= 0.5) return I18n.t("syncAdjust.confidenceMedium");
      return I18n.t("syncAdjust.confidenceLow");
    };
    
    // 버튼 위치 기반으로 모달 위치 계산
    const getModalStyle = () => {
      // 전체화면 모드인지 확인
      const isFullscreen = document.querySelector('.lyrics-lyricsContainer-LyricsContainer.fullscreen-active');
      
      if (isFullscreen && buttonRef.current) {
        // 전체화면: 버튼 기준으로 위치 계산
        const rect = buttonRef.current.getBoundingClientRect();
        return {
          bottom: `${window.innerHeight - rect.top + 8}px`,
          right: `${window.innerWidth - rect.right}px`
        };
      } else {
        // 일반 모드: 버튼 컨테이너가 우측 하단에 고정되어 있으므로 고정 위치 사용
        return {
          bottom: "80px",
          right: "32px"
        };
      }
    };

    const isCommunityEnabled = CONFIG.visual["community-sync-enabled"];

    return react.createElement(
      react.Fragment,
      null,
      react.createElement(
        Spicetify.ReactComponent.TooltipWrapper,
        { label: I18n.t("menu.syncAdjust") },
        react.createElement(
          "button",
          {
            ref: buttonRef,
            className: "lyrics-config-button",
            onClick: toggleModal,
          },
          react.createElement(
            "svg",
            {
              width: 16,
              height: 16,
              viewBox: "0 0 16 16",
              fill: "currentColor",
            },
            react.createElement("path", {
              d: "M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z",
            }),
            react.createElement("path", {
              d: "M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z",
            })
          )
        )
      ),
      isOpen &&
        (() => {
          const modalStyle = getModalStyle();
          return react.createElement(
            "div",
            {
              className: "lyrics-sync-adjust-modal",
              style: {
                position: "fixed",
                bottom: modalStyle.bottom,
                right: modalStyle.right,
                background: "rgba(28, 28, 30, 0.95)",
                backdropFilter: "blur(60px) saturate(200%)",
                WebkitBackdropFilter: "blur(60px) saturate(200%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
                padding: "20px 24px",
                zIndex: 99999,
                minWidth: "520px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                fontFamily:
                  "Pretendard Variable, -apple-system, BlinkMacSystemFont, sans-serif",
              },
            },
            react.createElement("style", {
              dangerouslySetInnerHTML: {
                __html: `
.lyrics-sync-adjust-modal .slider-container {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10px;
	padding: 8px 0;
}
.lyrics-sync-adjust-modal .sync-slider {
	width: 100%;
	height: 28px;
	background: transparent;
	outline: none;
	-webkit-appearance: none;
	appearance: none;
	cursor: pointer;
}

.lyrics-sync-adjust-modal .sync-slider::-webkit-slider-runnable-track {
	width: 100%;
	height: 6px;
	background: linear-gradient(to right, #007aff var(--progress-percent, 50%), #3a3a3c var(--progress-percent, 50%));
	border-radius: 3px;
	transition: background 0.1s ease;
}

.lyrics-sync-adjust-modal .sync-slider::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	width: 28px;
	height: 28px;
	background: #ffffff;
	border-radius: 50%;
	cursor: pointer;
	box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1);
	margin-top: -11px;
	transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.lyrics-sync-adjust-modal .sync-slider:hover::-webkit-slider-thumb {
	transform: scale(1.05);
}

.lyrics-sync-adjust-modal .sync-slider:active::-webkit-slider-thumb {
	transform: scale(0.98);
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* Firefox Styles */
.lyrics-sync-adjust-modal .sync-slider::-moz-range-track {
	width: 100%;
	height: 6px;
	background: #3a3a3c;
	border-radius: 3px;
	border: none;
}

.lyrics-sync-adjust-modal .sync-slider::-moz-range-progress {
	height: 6px;
	background: #007aff;
	border-radius: 3px;
}

.lyrics-sync-adjust-modal .sync-slider::-moz-range-thumb {
	width: 28px;
	height: 28px;
	background: #ffffff;
	border: none;
	border-radius: 50%;
	cursor: pointer;
	box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1);
}

.lyrics-sync-adjust-modal .community-section {
	margin-top: 16px;
	padding-top: 16px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.lyrics-sync-adjust-modal .community-info-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12px;
}

.lyrics-sync-adjust-modal .community-stats {
	display: flex;
	align-items: center;
	gap: 16px;
}

.lyrics-sync-adjust-modal .stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2px;
}

.lyrics-sync-adjust-modal .stat-value {
	font-size: 16px;
	font-weight: 600;
	color: #ffffff;
}

.lyrics-sync-adjust-modal .stat-label {
	font-size: 10px;
	color: #8e8e93;
	text-transform: uppercase;
	letter-spacing: 0.5px;
}

.lyrics-sync-adjust-modal .community-actions {
	display: flex;
	gap: 8px;
}

.lyrics-sync-adjust-modal .feedback-btn {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	border: 1px solid rgba(255, 255, 255, 0.15);
	background: rgba(255, 255, 255, 0.05);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
	font-size: 16px;
}

.lyrics-sync-adjust-modal .feedback-btn:hover {
	background: rgba(255, 255, 255, 0.1);
	transform: scale(1.05);
}

.lyrics-sync-adjust-modal .feedback-btn.active-positive {
	background: rgba(52, 199, 89, 0.2);
	border-color: rgba(52, 199, 89, 0.5);
}

.lyrics-sync-adjust-modal .feedback-btn.active-negative {
	background: rgba(255, 59, 48, 0.2);
	border-color: rgba(255, 59, 48, 0.5);
}

.lyrics-sync-adjust-modal .feedback-btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
	pointer-events: none;
}

.lyrics-sync-adjust-modal .action-btn {
	padding: 8px 14px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.15);
	background: rgba(255, 255, 255, 0.05);
	color: #ffffff;
	font-size: 12px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;
}

.lyrics-sync-adjust-modal .action-btn:hover:not(:disabled) {
	background: rgba(255, 255, 255, 0.1);
	transform: translateY(-1px);
}

.lyrics-sync-adjust-modal .action-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.lyrics-sync-adjust-modal .action-btn.primary {
	background: rgba(0, 122, 255, 0.2);
	border-color: rgba(0, 122, 255, 0.4);
	color: #007aff;
}

.lyrics-sync-adjust-modal .action-btn.primary:hover:not(:disabled) {
	background: rgba(0, 122, 255, 0.3);
}
`,
              },
            }),
            // Header
            react.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                },
              },
              react.createElement(
                "div",
                {
                  style: {
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#ffffff",
                    letterSpacing: "-0.01em",
                  },
                },
                I18n.t("menu.syncAdjustTitle")
              ),
              react.createElement(
                "button",
                {
                  onClick: toggleModal,
                  style: {
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: "50%",
                    color: "#ffffff",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "0",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                  },
                  onMouseEnter: (e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.15)";
                    e.target.style.transform = "scale(1.05)";
                  },
                  onMouseLeave: (e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    e.target.style.transform = "scale(1)";
                  },
                },
                "×"
              )
            ),
            // Info text
            react.createElement(
              "div",
              {
                style: {
                  fontSize: "13px",
                  color: "#8e8e93",
                  marginBottom: "16px",
                  letterSpacing: "-0.01em",
                },
              },
              I18n.t("syncAdjust.info")
            ),
            // Slider section
            react.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                },
              },
              // Slider
              react.createElement(
                "div",
                {
                  className: "slider-container",
                },
                react.createElement("input", {
                  type: "range",
                  className: "sync-slider",
                  min: -10000,
                  max: 10000,
                  step: 10,
                  value: offset,
                  onInput: handleSliderChange,
                  style: {
                    "--progress-percent": `${((offset + 10000) / 20000) * 100}%`,
                  },
                }),
                react.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      color: "#8e8e93",
                      fontWeight: "500",
                      padding: "0 4px",
                    },
                  },
                  react.createElement("span", null, "-10s"),
                  react.createElement(
                    "span",
                    {
                      style: {
                        color: "#ffffff",
                        fontWeight: "600",
                        fontSize: "14px",
                        letterSpacing: "-0.01em",
                      },
                    },
                    `${offset}ms`
                  ),
                  react.createElement("span", null, "+10s")
                )
              ),
              // Fine adjustment buttons
              react.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  },
                },
                react.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: "6px",
                    },
                  },
                  react.createElement(AdjustButton, { value: "-1000", onClick: () => adjustOffset(-1000) }),
                  react.createElement(AdjustButton, { value: "-100", onClick: () => adjustOffset(-100) }),
                  react.createElement(AdjustButton, { value: "-10", onClick: () => adjustOffset(-10) })
                ),
                react.createElement(
                  "div",
                  {
                    style: {
                      display: "flex",
                      gap: "6px",
                    },
                  },
                  react.createElement(AdjustButton, { value: "+1000", onClick: () => adjustOffset(1000) }),
                  react.createElement(AdjustButton, { value: "+100", onClick: () => adjustOffset(100) }),
                  react.createElement(AdjustButton, { value: "+10", onClick: () => adjustOffset(10) })
                )
              ),
              // Reset button
              react.createElement(
                "button",
                {
                  onClick: resetOffset,
                  style: {
                    background: "rgba(255, 59, 48, 0.15)",
                    border: "1px solid rgba(255, 59, 48, 0.3)",
                    borderRadius: "10px",
                    color: "#ff3b30",
                    cursor: "pointer",
                    padding: "10px 16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "-0.01em",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  },
                  onMouseEnter: (e) => {
                    e.target.style.background = "rgba(255, 59, 48, 0.2)";
                    e.target.style.borderColor = "rgba(255, 59, 48, 0.4)";
                    e.target.style.transform = "translateY(-1px)";
                  },
                  onMouseLeave: (e) => {
                    e.target.style.background = "rgba(255, 59, 48, 0.15)";
                    e.target.style.borderColor = "rgba(255, 59, 48, 0.3)";
                    e.target.style.transform = "translateY(0)";
                  },
                },
                I18n.t("syncAdjust.reset")
              )
            ),
            // Community Sync Section
            isCommunityEnabled && react.createElement(
              "div",
              { className: "community-section" },
              react.createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                  },
                },
                react.createElement(
                  "svg",
                  { width: 14, height: 14, viewBox: "0 0 16 16", fill: "#8e8e93" },
                  react.createElement("path", {
                    d: "M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
                  })
                ),
                react.createElement(
                  "span",
                  {
                    style: {
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#ffffff",
                    },
                  },
                  I18n.t("syncAdjust.communityTitle")
                )
              ),
              isLoadingCommunity
                ? react.createElement(
                    "div",
                    {
                      style: {
                        color: "#8e8e93",
                        fontSize: "12px",
                        textAlign: "center",
                        padding: "12px 0",
                      },
                    },
                    I18n.t("syncAdjust.loading")
                  )
                : communityData
                ? react.createElement(
                    "div",
                    { className: "community-info-row" },
                    // Stats
                    react.createElement(
                      "div",
                      { className: "community-stats" },
                      // Offset
                      react.createElement(
                        "div",
                        { className: "stat-item" },
                        react.createElement(
                          "span",
                          { className: "stat-value" },
                          `${communityData.medianOffsetMs ?? communityData.offsetMs ?? 0}ms`
                        ),
                        react.createElement(
                          "span",
                          { className: "stat-label" },
                          I18n.t("syncAdjust.communityOffset")
                        )
                      ),
                      // Submissions
                      react.createElement(
                        "div",
                        { className: "stat-item" },
                        react.createElement(
                          "span",
                          { className: "stat-value" },
                          communityData.submissionCount ?? 0
                        ),
                        react.createElement(
                          "span",
                          { className: "stat-label" },
                          I18n.t("syncAdjust.submissions")
                        )
                      ),
                      // Confidence
                      react.createElement(
                        "div",
                        { className: "stat-item" },
                        react.createElement(
                          "span",
                          {
                            className: "stat-value",
                            style: { color: getConfidenceColor(communityData.confidence ?? 0) },
                          },
                          `${Math.round((communityData.confidence ?? 0) * 100)}%`
                        ),
                        react.createElement(
                          "span",
                          { className: "stat-label" },
                          getConfidenceLevel(communityData.confidence ?? 0)
                        )
                      )
                    ),
                    // Actions
                    react.createElement(
                      "div",
                      { className: "community-actions" },
                      // Feedback buttons
                      react.createElement(
                        "button",
                        {
                          className: `feedback-btn ${feedbackStatus === 'positive' ? 'active-positive' : ''}`,
                          onClick: () => submitFeedback(true),
                          title: communityData?.user?.hasSubmitted 
                            ? I18n.t("syncAdjust.cannotFeedbackOwnSubmission") 
                            : I18n.t("syncAdjust.feedbackGood"),
                          disabled: communityData?.user?.hasSubmitted,
                        },
                        "👍"
                      ),
                      react.createElement(
                        "button",
                        {
                          className: `feedback-btn ${feedbackStatus === 'negative' ? 'active-negative' : ''}`,
                          onClick: () => submitFeedback(false),
                          title: communityData?.user?.hasSubmitted 
                            ? I18n.t("syncAdjust.cannotFeedbackOwnSubmission") 
                            : I18n.t("syncAdjust.feedbackBad"),
                          disabled: communityData?.user?.hasSubmitted,
                        },
                        "👎"
                      ),
                      // Apply button
                      react.createElement(
                        "button",
                        {
                          className: "action-btn primary",
                          onClick: applyCommunityOffset,
                        },
                        I18n.t("syncAdjust.applyCommunity")
                      )
                    )
                  )
                : react.createElement(
                    "div",
                    {
                      style: {
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    },
                    react.createElement(
                      "span",
                      {
                        style: {
                          color: "#8e8e93",
                          fontSize: "12px",
                        },
                      },
                      I18n.t("syncAdjust.noData")
                    ),
                    react.createElement(
                      "button",
                      {
                        className: "action-btn primary",
                        onClick: submitOffset,
                        disabled: isSubmitting || offset === 0,
                      },
                      isSubmitting ? I18n.t("syncAdjust.submitting") : I18n.t("syncAdjust.submitMine")
                    )
                  ),
              // Auto-submit status indicator
              CONFIG.visual["community-sync-auto-submit"] && react.createElement(
                "div",
                {
                  style: {
                    marginTop: "12px",
                    padding: "8px 12px",
                    background: "rgba(52, 199, 89, 0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#34c759",
                    textAlign: "center",
                  },
                },
                I18n.t("syncAdjust.autoSubmitEnabled")
              ),
              // Submit button (always show when community data exists)
              communityData && react.createElement(
                "div",
                {
                  style: {
                    marginTop: "12px",
                    display: "flex",
                    justifyContent: "flex-end",
                  },
                },
                react.createElement(
                  "button",
                  {
                    className: "action-btn",
                    onClick: submitOffset,
                    disabled: isSubmitting,
                  },
                  isSubmitting ? I18n.t("syncAdjust.submitting") : I18n.t("syncAdjust.submitMine")
                )
              )
            )
          );
        })()
    );
  }
);

// Community Video Selector를 document.body에 직접 렌더링
function openCommunityVideoSelector(trackUri, currentVideoId, onVideoSelect) {
  // 이미 열려있으면 무시
  if (document.getElementById("lyrics-plus-community-video-overlay")) {
    return;
  }

  const overlay = document.createElement("div");
  overlay.id = "lyrics-plus-community-video-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  `;

  const modalContainer = document.createElement("div");
  modalContainer.style.cssText = `
    background: rgba(24, 24, 24, 0.95);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border-radius: 16px;
    max-width: 90vw;
    max-height: 70vh;
    width: 560px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
  `;

  const closeModal = () => {
    if (overlay.parentNode) {
      document.body.removeChild(overlay);
    }
    document.removeEventListener("keydown", handleEscape);
  };

  // Close on outside click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Close on escape key
  const handleEscape = (e) => {
    if (e.key === "Escape") {
      closeModal();
    }
  };
  document.addEventListener("keydown", handleEscape);

  overlay.appendChild(modalContainer);
  document.body.appendChild(overlay);

  // Render React component
  const dom = window.Spicetify?.ReactDOM ?? window.ReactDOM ?? null;
  if (!dom?.render) {
    return;
  }

  const selectorComponent = react.createElement(CommunityVideoSelector, {
    trackUri: trackUri,
    currentVideoId: currentVideoId,
    onVideoSelect: (newVideoInfo) => {
      if (onVideoSelect) {
        onVideoSelect(newVideoInfo);
      }
      closeModal();
    },
    onClose: closeModal
  });

  dom.render(selectorComponent, modalContainer);
}

// Community Video Selector Button
const CommunityVideoButton = react.memo(({ trackUri, videoInfo, onVideoSelect }) => {
  // 비디오 배경이 비활성화되어 있으면 버튼 숨김
  if (!CONFIG.visual["video-background"]) {
    return null;
  }

  const handleClick = () => {
    openCommunityVideoSelector(
      trackUri,
      videoInfo?.youtubeVideoId,
      onVideoSelect
    );
  };

  return react.createElement(
    Spicetify.ReactComponent.TooltipWrapper,
    { label: I18n.t("communityVideo.selectVideo") },
    react.createElement(
      "button",
      { 
        className: "lyrics-config-button", 
        onClick: handleClick
      },
      react.createElement(
        "svg",
        { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
        react.createElement("path", {
          d: "M2 3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2zm0-1h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
        }),
        react.createElement("path", {
          d: "M6 5.5a.5.5 0 0 1 .79-.407l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5z"
        })
      )
    )
  );
});

const SettingsMenu = react.memo(() => {
  const openSettings = () => {
    openConfig();
  };

  return react.createElement(
    Spicetify.ReactComponent.TooltipWrapper,
    { label: I18n.t("menu.settings") },
    react.createElement(
      "button",
      { className: "lyrics-config-button", onClick: openSettings },
      react.createElement(
        "svg",
        { width: 16, height: 16, viewBox: "0 0 16 16", fill: "currentColor" },
        react.createElement("path", {
          d: "M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zM8 10.93a2.93 2.93 0 1 1 0-5.86 2.93 2.93 0 0 1 0 5.86z",
        })
      )
    )
  );
});
