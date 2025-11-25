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

// Define static options outside component to avoid recreation
const STATIC_OPTIONS = {
  modeBase: {
    none: "없음",
  },
  geminiModes: {
    gemini_romaji: "발음",
    gemini_ko: "번역",
  },
  languageModes: {
    japanese: {
      furigana: "후리가나",
      romaji: "로마지",
      hiragana: "히라가나",
      katakana: "가타카나",
    },
    korean: {
      romaja: "로마자",
    },
    chinese: {
      cn: "간체 중국어",
      hk: "번체 중국어 (홍콩)",
      tw: "번체 중국어 (대만)",
      pinyin: "병음",
    },
    // Gemini-powered languages
    russian: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    vietnamese: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    german: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    spanish: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    french: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    italian: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    portuguese: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    dutch: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    polish: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    turkish: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    arabic: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    hindi: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    thai: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
    indonesian: {
      gemini_romaji: "로마자 (제미니)",
      gemini_ko: "한국어 (제미니)",
    },
  },
};

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

    let modeOptions = STATIC_OPTIONS.geminiModes;

    const items = [
      {
        section: "변환 옵션",
        subtitle: "가사의 발음과 번역 표시를 설정하세요",
        items: [
          {
            desc: react.createElement(SettingRowDescription, {
              icon: ICONS.mode,
              text: "발음",
            }),
            key: `translation-mode:${modeKey}`,
            type: ConfigSlider,
            defaultValue:
              CONFIG.visual[`translation-mode:${modeKey}`] !== "none",
            renderInline: true,
            info: "원문 가사의 발음(로마자)을 표시합니다",
          },
          {
            desc: react.createElement(SettingRowDescription, {
              icon: ICONS.mode,
              text: "번역",
            }),
            key: `translation-mode-2:${modeKey}`,
            type: ConfigSlider,
            defaultValue:
              CONFIG.visual[`translation-mode-2:${modeKey}`] !== "none",
            renderInline: true,
            info: "원문 가사를 한국어로 번역하여 표시합니다",
          },
        ],
      },
      {
        section: "API 설정",
        subtitle: "Gemini API를 구성하세요",
        items: [
          {
            desc: react.createElement(SettingRowDescription, {
              icon: ICONS.provider,
              text: "API 키 설정",
            }),
            key: "open-api-settings",
            type: ConfigButton,
            text: "설정 열기",
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
            info: "Gemini API 키를 설정하려면 여기를 클릭하세요",
          },
        ],
      },
    ];

    openOptionsModal("변환 설정", items, (name, value) => {
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
    { label: "변환" },
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
      { label: "번역 재생성" },
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
    const buttonRef = useRef(null);

    // Load offset when trackUri changes
    useEffect(() => {
      const loadOffset = async () => {
        const savedOffset = (await Utils.getTrackSyncOffset(trackUri)) || 0;
        setOffset(savedOffset);
      };
      loadOffset();
    }, [trackUri]);

    const handleOffsetChange = async (newOffset) => {
      setOffset(newOffset);
      await Utils.setTrackSyncOffset(trackUri, newOffset);
      if (onOffsetChange) {
        onOffsetChange(newOffset);
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

    return react.createElement(
      react.Fragment,
      null,
      react.createElement(
        Spicetify.ReactComponent.TooltipWrapper,
        { label: "싱크 조절" },
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
	height: 28px; /* Increased height for easier interaction */
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
	margin-top: -11px; /* (track_height - thumb_height) / 2 */
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
`,
            },
          }),
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
              "가사 싱크 조절"
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
            "슬라이더를 우측으로 이동하면, 가사가 빠르게 지나갑니다."
          ),
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
              "초기화"
            )
          )
        );
        })()
    );
  }
);

const SettingsMenu = react.memo(() => {
  const openSettings = () => {
    openConfig();
  };

  return react.createElement(
    Spicetify.ReactComponent.TooltipWrapper,
    { label: "설정" },
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
