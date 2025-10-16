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
	const menuItemProps = useMemo(() => ({
		onClick: onSelect,
		icon: isSelected ? OptionsMenuItemIcon : null,
		trailingIcon: isSelected ? OptionsMenuItemIcon : null,
	}), [onSelect, isSelected]);

	// React 31 방지: value가 유효한지 확인
	const safeValue = value || '';

	return react.createElement(
		Spicetify.ReactComponent.MenuItem,
		menuItemProps,
		safeValue
	);
});

const OptionsMenu = react.memo(({ options, onSelect, selected, defaultValue, bold = false }) => {
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
});

const ICONS = {
	provider: `<path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zM8 10.93a2.93 2.93 0 1 1 0-5.86 2.93 2.93 0 0 1 0 5.86z"/>`,
	display: `<path d="M1 1h5v5H1V1zm6 0h8v5H7V1zm-6 6h5v8H1V7zm6 0h8v8H7V7z"/>`,
	mode: `<path d="M10.5 1a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-1 0v-12a.5.5 0 0 1 .5-.5zm-4 0a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-1 0v-12a.5.5 0 0 1 .5-.5zm-4 0a.5.5 0 0 1 .5.5v12a.5.5 0 0 1-1 0v-12a.5.5 0 0 1 .5-.5z"/>`,
	language: `<path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1.026 7.5h1.332c.05.586.13 1.15.24 1.696-1.012-.34-1.782-.93-2.13-1.696zM14.974 7.5h-1.332a10.034 10.034 0 0 1-.24 1.696c1.012-.34 1.782-.93 2.13-1.696zM8 15c-1.07 0-2.096-.21-3.034-.604a.5.5 0 0 0-.416.924C5.59 15.8 6.758 16 8 16s2.41-.2 3.45-.68a.5.5 0 0 0-.416-.924C10.096 14.79 9.07 15 8 15zm0-1.5c.983 0 1.912-.18 2.76-.502.848-.323 1.543-.8 2.062-1.405.519-.604.85-1.353.972-2.155H2.206c.122.802.453 1.551.972 2.155.519.605 1.214 1.082 2.062 1.405C6.088 13.32 7.017 13.5 8 13.5z"/>`,
};

const SettingRowDescription = ({ icon, text }) => {
	return react.createElement(
		"div",
		{ className: "setting-row-with-icon" },
		// React 310 방지: icon이 문자열이고 비어있지 않을 때만 렌더링
		icon && typeof icon === "string" && icon && react.createElement("svg", {
			width: 16,
			height: 16,
			viewBox: "0 0 16 16",
			fill: "currentColor",
			dangerouslySetInnerHTML: { __html: icon },
		}),
		react.createElement("span", null, text || '')
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
/* Microsoft Fluent Design - 변환 설정 모달 */
#${APP_NAME}-config-container {
	padding: 24px;
	background: #1a1a1a;
	color: #ffffff;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

#${APP_NAME}-config-container .setting-row {
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	border-bottom: 1px solid #2b2b2b;
	border-radius: 0;
	transition: background 0.1s ease;
}

#${APP_NAME}-config-container .setting-row:hover {
	background: rgba(255,255,255,0.02);
}

#${APP_NAME}-config-container .setting-row:last-child {
	border-bottom: none;
}

#${APP_NAME}-config-container .setting-row-content {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 32px;
	padding: 16px 0;
	min-height: 64px;
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
	font-weight: 500;
	font-size: 14px;
	color: #ffffff;
	line-height: 1.4;
}

#${APP_NAME}-config-container .setting-description {
	font-size: 12px;
	color: #8a8a8a;
	line-height: 1.5;
}

#${APP_NAME}-config-container .setting-row-with-icon {
	display: flex;
	align-items: center;
	gap: 12px;
	color: #ffffff;
	font-weight: 500;
	font-size: 14px;
}

#${APP_NAME}-config-container .setting-row-with-icon svg {
	flex-shrink: 0;
	opacity: 0.9;
}

/* Select dropdown */
#${APP_NAME}-config-container select {
	background: #2b2b2b !important;
	border: 1px solid #3d3d3d !important;
	border-radius: 2px !important;
	padding: 10px 32px 10px 12px !important;
	width: 200px !important;
	outline: none !important;
	color: #ffffff !important;
	transition: border-color 0.1s ease !important;
	font-size: 13px !important;
	font-family: var(--font-family, -apple-system, BlinkMacSystemFont, sans-serif) !important;
	min-height: 36px !important;
	height: auto !important;
	box-sizing: border-box !important;
	appearance: none !important;
	background-image: url('data:image/svg+xml;utf8,<svg fill="white" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M3 6l5 5.794L13 6z"/></svg>') !important;
	background-repeat: no-repeat !important;
	background-position: right 10px center !important;
	cursor: pointer !important;
}

#${APP_NAME}-config-container select:hover {
	border-color: #505050 !important;
	background: #2b2b2b !important;
}

#${APP_NAME}-config-container select:focus {
	border-color: #0078d4 !important;
	background: #2b2b2b !important;
	box-shadow: none !important;
}

#${APP_NAME}-config-container select option {
	background-color: #2b2b2b;
	color: #ffffff;
	padding: 8px;
}

/* Button */
#${APP_NAME}-config-container .btn {
	background: #2b2b2b;
	border: 1px solid #3d3d3d;
	border-radius: 2px;
	color: #ffffff;
	font-weight: 400;
	padding: 0 16px;
	min-height: 36px;
	cursor: pointer;
	transition: all 0.1s ease;
}

#${APP_NAME}-config-container .btn:hover:not(:disabled) {
	background: #323232;
	border-color: #505050;
}

#${APP_NAME}-config-container .btn:active:not(:disabled) {
	background: #1f1f1f;
}

#${APP_NAME}-config-container .btn:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}
`
			}
		}),
		react.createElement(OptionList, Object.assign({ items, onChange }, eventType ? { type: eventType } : {}))
	);

	Spicetify.PopupModal.display({ title, content: container, isLarge: true });
}

// Debounce handle for adjustments modal
let adjustmentsDebounceTimeout = null;

// Define static options outside component to avoid recreation
const STATIC_OPTIONS = {
	source: {
		traditional: "전통적 변환",
		geminiKo: "제미니 AI",
	},
	translationDisplay: {
		replace: "원문 대체",
		below: "원문 아래 표시",
	},
	language: {
		off: "끄기",
		"zh-hans": "중국어 (간체)",
		"zh-hant": "중국어 (번체)",
		ja: "일본어",
		ko: "한국어",
	},
	modeBase: {
		none: "없음",
	},
	geminiModes: {
		gemini_romaji: "로마지, 로마자, 병음 (제미니)",
		gemini_ko: "한국어 (제미니)",
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
	}
};

const TranslationMenu = react.memo(({ friendlyLanguage, hasTranslation }) => {
	const items = useMemo(() => {
		const sourceOptions = STATIC_OPTIONS.source;
		const translationDisplayOptions = STATIC_OPTIONS.translationDisplay;
		const languageOptions = STATIC_OPTIONS.language;
		
		let modeOptions = { ...STATIC_OPTIONS.modeBase };

		const provider = CONFIG.visual["translate:translated-lyrics-source"];
		if (provider === "geminiKo") {
			modeOptions = STATIC_OPTIONS.geminiModes;
		} else if (friendlyLanguage) {
			// Local conversions via kuromoji/OpenCC
			modeOptions = STATIC_OPTIONS.languageModes[friendlyLanguage] || STATIC_OPTIONS.modeBase;
		}

		// Always show basic options, even when friendlyLanguage is not available
		const baseItems = [
			{
				desc: react.createElement(SettingRowDescription, { icon: ICONS.provider, text: "번역 제공자" }),
				key: "translate:translated-lyrics-source",
				type: ConfigSelection,
				options: sourceOptions,
				renderInline: true,
			},
			{
				desc: react.createElement(SettingRowDescription, { icon: ICONS.display, text: "번역 표시" }),
				key: "translate:display-mode",
				type: ConfigSelection,
				options: translationDisplayOptions,
				renderInline: true,
			},
		];

		// Show Language Override option only for Kuromoji mode
		if (provider !== "geminiKo") {
			baseItems.push({
				desc: react.createElement(SettingRowDescription, { icon: ICONS.language, text: "언어 강제 설정" }),
				key: "translate:detect-language-override",
				type: ConfigSelection,
				options: languageOptions,
				renderInline: true,
			});
		}

		// Add language-specific display modes
		if (friendlyLanguage) {
			// For detected languages (CJKE + new languages), show specific language modes
			baseItems.push(
				{
					desc: react.createElement(SettingRowDescription, { icon: ICONS.mode, text: "표시 모드" }),
					key: `translation-mode:${friendlyLanguage}`,
					type: ConfigSelection,
					options: { none: "없음", ...modeOptions },
					renderInline: true,
				},
				{
					desc: react.createElement(SettingRowDescription, { icon: ICONS.mode, text: "표시 모드 2" }),
					key: `translation-mode-2:${friendlyLanguage}`,
					type: ConfigSelection,
					options: { none: "없음", ...modeOptions },
					renderInline: true,
				}
			);
		} else if (provider === "geminiKo") {
			// For Gemini mode, show generic display modes even without detected language
			baseItems.push(
				{
					desc: react.createElement(SettingRowDescription, { icon: ICONS.mode, text: "표시 모드" }),
					key: "translation-mode:gemini",
					type: ConfigSelection,
					options: { none: "없음", ...modeOptions },
					renderInline: true,
				},
				{
					desc: react.createElement(SettingRowDescription, { icon: ICONS.mode, text: "표시 모드 2" }),
					key: "translation-mode-2:gemini",
					type: ConfigSelection,
					options: { none: "없음", ...modeOptions },
					renderInline: true,
				}
			);
		} else {
			// For Kuromoji mode without detected language, show info message
			baseItems.push({
				desc: "언어별 옵션",
				key: "language-info",
				type: ConfigButton,
				text: "언어가 감지되지 않음",
				onChange: () => {}, // No-op button
				info: "CJKE 언어(영어, 일본어, 한국어, 중국어)가 가사에서 감지되면 표시 모드 옵션이 나타납니다. 위의 언어 강제 설정을 사용하여 특정 언어를 강제할 수 있습니다.",
			});
		}

		return baseItems;
	}, [friendlyLanguage, CONFIG.visual["translate:translated-lyrics-source"]]);

	// Re-dispatch dynamic items so an open modal can update its OptionList
	useEffect(() => {
		const event = new CustomEvent("lyrics-plus", {
			detail: { type: "translation-menu", items },
		});
		document.dispatchEvent(event);
	}, [items, friendlyLanguage, CONFIG.visual["translate:translated-lyrics-source"]]);

	// Open modal on click instead of ContextMenu to avoid xpui hook errors
	const open = () => {
		openOptionsModal("변환 설정", items, (name, value) => {
				// Skip processing for info-only items
				if (name === "language-info") {
					return;
				}

			if (name === "translate:translated-lyrics-source") {
				// Only reset display modes when actually changing provider (not when loading new songs)
				const currentProvider = CONFIG.visual["translate:translated-lyrics-source"];
				if (currentProvider !== value) {
					// Reset display modes appropriately on provider change
					if (friendlyLanguage) {
						const modeKey = `translation-mode:${friendlyLanguage}`;
						const modeKey2 = `translation-mode-2:${friendlyLanguage}`;
						CONFIG.visual[modeKey] = "none";
						localStorage.setItem(`${APP_NAME}:visual:${modeKey}`, "none");
						CONFIG.visual[modeKey2] = "none";
						localStorage.setItem(`${APP_NAME}:visual:${modeKey2}`, "none");
					}
					
					// Reset generic Gemini display modes
					const geminiModeKey = "translation-mode:gemini";
					const geminiModeKey2 = "translation-mode-2:gemini";
					CONFIG.visual[geminiModeKey] = "none";
					localStorage.setItem(`${APP_NAME}:visual:${geminiModeKey}`, "none");
					CONFIG.visual[geminiModeKey2] = "none";
					localStorage.setItem(`${APP_NAME}:visual:${geminiModeKey2}`, "none");
					
					// When switching to Gemini, reset language override to "off" since it's not needed
					if (value === "geminiKo" && CONFIG.visual["translate:detect-language-override"] !== "off") {
						CONFIG.visual["translate:detect-language-override"] = "off";
						localStorage.setItem(`${APP_NAME}:visual:translate:detect-language-override`, "off");
						Spicetify.showNotification("제미니 모드를 위해 언어 강제 설정이 '끄기'로 재설정되었습니다", false, 3000);
					}
				}
			}

			CONFIG.visual[name] = value;
			localStorage.setItem(`${APP_NAME}:visual:${name}`, value);

			// Force re-detection of language when language override changes
			if (name === "translate:detect-language-override" && window.lyricContainer) {
				// Clear cached language to force re-detection
				window.lyricContainer.setState({ language: null });
				// Force re-render of lyrics to update language detection
				window.lyricContainer.lastProcessedUri = null;
				window.lyricContainer.lastProcessedMode = null;
				window.lyricContainer.forceUpdate();
			}

			if (name.startsWith("translation-mode")) {
				if (window.lyricContainer) {
					window.lyricContainer.lastProcessedUri = null;
					window.lyricContainer.lastProcessedMode = null;
					window.lyricContainer.forceUpdate();
				}
			}

			lyricContainerUpdate?.();
		}, "translation-menu");
	};

	return react.createElement(
		Spicetify.ReactComponent.TooltipWrapper,
		{ label: "변환" },
		react.createElement(
			"button",
			{ className: "lyrics-config-button", onClick: open },
			"⇄"
		)
	);
});

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
				react.createElement("path", { d: "M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zM8 10.93a2.93 2.93 0 1 1 0-5.86 2.93 2.93 0 0 1 0 5.86z" })
			)
		)
	);
});
