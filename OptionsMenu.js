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
	const menuItemProps = useMemo(() => ({
		onClick: onSelect,
		icon: isSelected ? OptionsMenuItemIcon : null,
		trailingIcon: isSelected ? OptionsMenuItemIcon : null,
	}), [onSelect, isSelected]);

	return react.createElement(
		Spicetify.ReactComponent.MenuItem,
		menuItemProps,
		value
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
	const menuRef = react.useRef(null);
	return react.createElement(
		Spicetify.ReactComponent.ContextMenu,
		{
			menu: react.createElement(
				Spicetify.ReactComponent.Menu,
				{},
				options.map(({ key, value }) =>
					react.createElement(OptionsMenuItem, {
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
		react.createElement("svg", {
			width: 16,
			height: 16,
			viewBox: "0 0 16 16",
			fill: "currentColor",
			dangerouslySetInnerHTML: { __html: icon },
		}),
		react.createElement("span", null, text)
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
#${APP_NAME}-config-container { padding: 12px 16px; }
#${APP_NAME}-config-container .setting-row {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 12px;
	align-items: center;
	padding: 8px 0;
	border-bottom: 1px solid rgba(255,255,255,.06);
}
#${APP_NAME}-config-container .setting-row-with-icon {
	display: flex;
	align-items: center;
	gap: 12px;
}
#${APP_NAME}-config-container .setting-row:last-child { border-bottom: none; }
#${APP_NAME}-config-container .col.description { font-weight: 600; opacity: .9; }
#${APP_NAME}-config-container .col.action { display: inline-flex; gap: 8px; align-items: center; justify-content: flex-end; }
#${APP_NAME}-config-container input, #${APP_NAME}-config-container select {
	background: rgba(255,255,255,.04);
	border: 1px solid rgba(255,255,255,.08);
	border-radius: 4px;
	padding: 8px 12px;
	width: min(320px, 100%);
	outline: none;
	transition: background .2s ease;
	color: rgba(255,255,255,.95);
}
#${APP_NAME}-config-container select:hover {
	background: rgba(255,255,255,.1);
}
#${APP_NAME}-config-container select option {
	background-color: #121212;
	color: #f2f2f2;
}
#${APP_NAME}-config-container select option:hover {
	background-color: #2a2a2a;
	color: #fff;
}
#${APP_NAME}-config-container select option:checked {
	background-color: #2a2a2a;
	color: #fff;
}
#${APP_NAME}-config-container .adjust-value { min-width: 48px; text-align: center; }
#${APP_NAME}-config-container .switch, #${APP_NAME}-config-container .btn { height: 28px; }
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
		}
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
			// For detected CJKE languages, show specific language modes
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
		} else if (provider === "geminiVi") {
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

const AdjustmentsMenu = react.memo(({ mode }) => {
	const items = [
		{ desc: "글꼴 크기", key: "font-size", type: ConfigAdjust, min: fontSizeLimit.min, max: fontSizeLimit.max, step: fontSizeLimit.step },
		{ desc: "트랙 지연", key: "delay", type: ConfigAdjust, min: Number.NEGATIVE_INFINITY, max: Number.POSITIVE_INFINITY, step: 250, when: () => mode === SYNCED },
		{ desc: "듀얼 패널", key: "dual-genius", type: ConfigSlider, when: () => mode === GENIUS },
	];

	const onChange = (name, value) => {
		clearTimeout(adjustmentsDebounceTimeout);
		adjustmentsDebounceTimeout = setTimeout(() => {
			CONFIG.visual[name] = value;
			try {
				Spicetify.Config.visual = Spicetify.Config.visual || {};
				Spicetify.Config.visual[name] = value;
			} catch {}
			localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
			// Persist per-track delay as used by resetDelay()
			if (name === "delay") {
				const uri = Spicetify?.Player?.data?.item?.uri;
				if (uri) {
					try { localStorage.setItem(`lyrics-delay:${uri}`, String(value)); } catch {}
				}
			}
			if (name.startsWith("translation-mode:") && window.lyricContainer) {
				window.lyricContainer.lastProcessedUri = null;
				window.lyricContainer.lastProcessedMode = null;
				window.lyricContainer.forceUpdate();
			}
			// Ensure live UI update for font-size/compact/etc.
			lyricContainerUpdate?.();
		}, 200);
	};

	const open = () => openOptionsModal("조정", items, onChange);

	return react.createElement(
		Spicetify.ReactComponent.TooltipWrapper,
		{ label: "조정" },
		react.createElement(
			"button",
			{ className: "lyrics-config-button", onClick: open },
			react.createElement(
				"svg",
				{ width: 16, height: 16, viewBox: "0 0 16 10.3", fill: "currentColor" },
				react.createElement("path", { d: "M 10.8125,0 C 9.7756347,0 8.8094481,0.30798341 8,0.836792 7.1905519,0.30798341 6.2243653,0 5.1875,0 2.3439941,0 0,2.3081055 0,5.15625 0,8.0001222 2.3393555,10.3125 5.1875,10.3125 6.2243653,10.3125 7.1905519,10.004517 8,9.4757081 8.8094481,10.004517 9.7756347,10.3125 10.8125,10.3125 13.656006,10.3125 16,8.0043944 16,5.15625 16,2.3123779 13.660644,0 10.8125,0 Z M 8,2.0146484 C 8.2629394,2.2503662 8.4963378,2.5183106 8.6936034,2.8125 H 7.3063966 C 7.5036622,2.5183106 7.7370606,2.2503662 8,2.0146484 Z M 6.619995,4.6875 C 6.6560059,4.3625487 6.7292481,4.0485841 6.8350831,3.75 h 2.3298338 c 0.1059572,0.2985841 0.1790772,0.6125487 0.21521,0.9375 z M 9.380005,5.625 C 9.3439941,5.9499512 9.2707519,6.2639159 9.1649169,6.5625 H 6.8350831 C 6.7291259,6.2639159 6.6560059,5.9499512 6.6198731,5.625 Z M 5.1875,9.375 c -2.3435059,0 -4.25,-1.8925781 -4.25,-4.21875 0,-2.3261719 1.9064941,-4.21875 4.25,-4.21875 0.7366944,0 1.4296875,0.1899414 2.0330809,0.5233154 C 6.2563478,2.3981934 5.65625,3.7083741 5.65625,5.15625 c 0,1.4478759 0.6000978,2.7580566 1.5643309,3.6954347 C 6.6171875,9.1850584 5.9241944,9.375 5.1875,9.375 Z M 8,8.2978516 C 7.7370606,8.0621337 7.5036622,7.7938231 7.3063966,7.4996337 H 8.6936034 C 8.4963378,7.7938231 8.2629394,8.0621338 8,8.2978516 Z M 10.8125,9.375 C 10.075806,9.375 9.3828125,9.1850584 8.7794191,8.8516847 9.7436522,7.9143066 10.34375,6.6041259 10.34375,5.15625 10.34375,3.7083741 9.7436522,2.3981934 8.7794191,1.4608154 9.3828125,1.1274414 10.075806,0.9375 10.8125,0.9375 c 2.343506,0 4.25,1.8925781 4.25,4.21875 0,2.3261719 -1.906494,4.21875 -4.25,4.21875 z m 0,0" })
			)
		)
	);
});
