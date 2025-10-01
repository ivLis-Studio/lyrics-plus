const ButtonSVG = ({ icon, active = true, onClick }) => {
	return react.createElement(
		"button",
		{
			className: `switch-checkbox${active ? " active" : ""}`,
			onClick,
			"aria-checked": active,
			role: "checkbox"
		},
		active && react.createElement("svg", {
			width: 12,
			height: 12,
			viewBox: "0 0 16 16",
			fill: "currentColor",
			dangerouslySetInnerHTML: {
				__html: icon,
			},
		})
	);
};

const SwapButton = ({ icon, disabled, onClick }) => {
	return react.createElement(
		"button",
		{
			className: "swap-button",
			onClick,
			disabled,
		},
		react.createElement("svg", {
			width: 12,
			height: 12,
			viewBox: "0 0 16 16",
			fill: "currentColor",
			dangerouslySetInnerHTML: {
				__html: icon,
			},
		})
	);
};

const CacheButton = () => {
	let lyrics = {};

	try {
		const localLyrics = JSON.parse(localStorage.getItem("lyrics-plus:local-lyrics"));
		if (!localLyrics || typeof localLyrics !== "object") {
			throw "";
		}
		lyrics = localLyrics;
	} catch {
		lyrics = {};
	}

	const [count, setCount] = useState(Object.keys(lyrics).length);
	const text = count ? "캐시된 모든 가사 삭제" : "캐시된 가사 없음";

	return react.createElement(
		"button",
		{
			className: "btn",
			onClick: () => {
				localStorage.removeItem("lyrics-plus:local-lyrics");
				setCount(0);
			},
			disabled: !count,
		},
		text
	);
};


const ConfigButton = ({ name, text, onChange = () => {} }) => {
	return react.createElement(
		"div",
		{
			className: "setting-row",
		},
		react.createElement(
			"div",
			{ className: "setting-row-content" },
			react.createElement(
				"div",
				{ className: "setting-row-left" },
				react.createElement("div", { className: "setting-name" }, name)
			),
			react.createElement(
				"div",
				{ className: "setting-row-right" },
				react.createElement(
					"button",
					{
						className: "btn",
						onClick: onChange,
					},
					text
				)
			)
		)
	);
};

const ConfigSlider = ({ name, defaultValue, onChange = () => {} }) => {
	const [active, setActive] = useState(defaultValue);

	useEffect(() => {
		setActive(defaultValue);
	}, [defaultValue]);

	const toggleState = useCallback(() => {
		const state = !active;
		setActive(state);
		onChange(state);
	}, [active]);

	return react.createElement(ButtonSVG, {
		icon: Spicetify.SVGIcons.check,
		active,
		onClick: toggleState,
	});
};

const ConfigSliderRange = ({ name, defaultValue, min = 0, max = 100, step = 1, unit = "", onChange = () => {} }) => {
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		setValue(defaultValue);
	}, [defaultValue]);

	const handleChange = useCallback(
		(event) => {
			const newValue = Number(event.target.value);
			setValue(newValue);
			onChange(newValue);
		},
		[onChange]
	);

	return react.createElement(
		"div",
		{ className: "slider-container" },
		react.createElement("input", {
			type: "range",
			min,
			max,
			step,
			value,
			onChange: handleChange,
			className: "config-slider",
		}),
		react.createElement(
			"span",
			{ className: "slider-value" },
			`${value}${unit}`
		)
	);
};

const ConfigColorPicker = ({ name, defaultValue, onChange = () => {} }) => {
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		setValue(defaultValue);
	}, [defaultValue]);

	const handleChange = useCallback(
		(event) => {
			const newValue = event.target.value;
			setValue(newValue);
			onChange(newValue);
		},
		[onChange]
	);

	return react.createElement(
		"div",
		{ className: "color-picker-container" },
		react.createElement("input", {
			type: "color",
			value,
			onChange: handleChange,
			className: "config-color-picker",
		}),
		react.createElement("input", {
			type: "text",
			value,
			onChange: handleChange,
			className: "config-color-input",
			pattern: "^#[0-9A-Fa-f]{6}$",
			placeholder: "#000000",
		})
	);
};

const ConfigSelection = ({ name, defaultValue, options, onChange = () => {} }) => {
	const [value, setValue] = useState(defaultValue);

	const setValueCallback = useCallback(
		(event) => {
			let value = event.target.value;
			if (!Number.isNaN(Number(value))) {
				value = Number.parseInt(value);
			}
			setValue(value);
			onChange(value);
		},
		[value, options]
	);

	useEffect(() => {
		setValue(defaultValue);
	}, [defaultValue]);

	if (!Object.keys(options).length) return null;

	return react.createElement(
		"select",
		{
			value,
			onChange: setValueCallback,
		},
		...Object.keys(options).map((item) =>
			react.createElement(
				"option",
				{
					key: item,
					value: item,
				},
				options[item]
			)
		)
	);
};

const ConfigInput = ({ name, defaultValue, onChange = () => {} }) => {
	const [value, setValue] = useState(defaultValue);

	const setValueCallback = useCallback(
		(event) => {
			const value = event.target.value;
			setValue(value);
			onChange(value);
		},
		[value]
	);

	return react.createElement(
		"div",
		{
			className: "setting-row",
		},
		react.createElement(
			"div",
			{ className: "setting-row-content" },
			react.createElement(
				"div",
				{ className: "setting-row-left" },
				react.createElement("div", { className: "setting-name" }, name)
			),
			react.createElement(
				"div",
				{ className: "setting-row-right" },
				react.createElement("input", {
					type: "text",
					value,
					onChange: setValueCallback,
				})
			)
		)
	);
};

const ConfigAdjust = ({ name, defaultValue, step, min, max, onChange = () => {} }) => {
	const [value, setValue] = useState(defaultValue);

	useEffect(() => {
		setValue(defaultValue);
	}, [defaultValue]);

	function adjust(dir) {
		let temp = value + dir * step;
		if (temp < min) {
			temp = min;
		} else if (temp > max) {
			temp = max;
		}
		setValue(temp);
		onChange(temp);
	}
	return react.createElement(
		"div",
		{ className: "adjust-container" },
		react.createElement("button", {
			className: "adjust-button",
			onClick: () => adjust(-1),
			disabled: value === min,
			"aria-label": "Decrease"
		}, "-"),
		react.createElement(
			"span",
			{ className: "adjust-value" },
			value
		),
		react.createElement("button", {
			className: "adjust-button",
			onClick: () => adjust(1),
			disabled: value === max,
			"aria-label": "Increase"
		}, "+")
	);
};

const ConfigHotkey = ({ name, defaultValue, onChange = () => {} }) => {
	const [value, setValue] = useState(defaultValue);
	const [trap] = useState(new Spicetify.Mousetrap());

	function record() {
		trap.handleKey = (character, modifiers, e) => {
			if (e.type === "keydown") {
				const sequence = [...new Set([...modifiers, character])];
				if (sequence.length === 1 && sequence[0] === "esc") {
					onChange("");
					setValue("");
					return;
				}
				setValue(sequence.join("+"));
			}
		};
	}

	function finishRecord() {
		trap.handleKey = () => {};
		onChange(value);
	}

	return react.createElement(
		"div",
		{
			className: "setting-row",
		},
		react.createElement(
			"div",
			{ className: "setting-row-content" },
			react.createElement(
				"div",
				{ className: "setting-row-left" },
				react.createElement("div", { className: "setting-name" }, name)
			),
			react.createElement(
				"div",
				{ className: "setting-row-right" },
				react.createElement("input", {
					type: "text",
					value,
					onFocus: record,
					onBlur: finishRecord,
				})
			)
		)
	);
};

const ServiceAction = ({ item, setTokenCallback }) => {
	switch (item.name) {
		case "local":
			return react.createElement(CacheButton);
		default:
			return null;
	}
};

const ServiceOption = ({ item, onToggle, onSwap, isFirst = false, isLast = false, onTokenChange = null }) => {
	const [token, setToken] = useState(item.token);
	const [active, setActive] = useState(item.on);

	const setTokenCallback = useCallback(
		(token) => {
			setToken(token);
			onTokenChange(item.name, token);
		},
		[item.token]
	);

	const toggleActive = useCallback(() => {
		const state = !active;
		setActive(state);
		onToggle(item.name, state);
	}, [active]);

	return react.createElement(
		"div",
		{
			className: "setting-row",
			style: { marginBottom: "16px" }
		},
		react.createElement(
			"div",
			{ className: "setting-row-content" },
			react.createElement(
				"div",
				{ className: "setting-row-left" },
				react.createElement("div", { className: "setting-name" }, item.name),
				react.createElement("div", {
					className: "setting-description",
					dangerouslySetInnerHTML: {
						__html: item.desc,
					},
				})
			),
			react.createElement(
				"div",
				{
					className: "setting-row-right",
					style: { display: "flex", gap: "8px", alignItems: "center" }
				},
				react.createElement(ServiceAction, {
					item,
					setTokenCallback,
				}),
				react.createElement(SwapButton, {
					icon: Spicetify.SVGIcons["chart-up"],
					onClick: () => onSwap(item.name, -1),
					disabled: isFirst,
				}),
				react.createElement(SwapButton, {
					icon: Spicetify.SVGIcons["chart-down"],
					onClick: () => onSwap(item.name, 1),
					disabled: isLast,
				}),
				react.createElement(ButtonSVG, {
					icon: Spicetify.SVGIcons.check,
					active,
					onClick: toggleActive,
				})
			)
		),
		item.token !== undefined &&
			react.createElement("input", {
				type: "text",
				placeholder: `Place your ${item.name} token here`,
				value: token,
				onChange: (event) => setTokenCallback(event.target.value),
				style: {
					backgroundColor: "#1a1a1a",
					border: "2px solid #404040",
					borderRadius: "8px",
					padding: "2px 2.8px",
					color: "#ffffff",
					fontSize: "14px",
					minHeight: "20px",
					boxSizing: "border-box",
					width: "100%",
					marginTop: "8px"
				}
			})
	);
};

const ServiceList = ({ itemsList, onListChange = () => {}, onToggle = () => {}, onTokenChange = () => {} }) => {
	const [items, setItems] = useState(itemsList);
	const maxIndex = items.length - 1;

	const onSwap = useCallback(
		(name, direction) => {
			const curPos = items.findIndex((val) => val === name);
			const newPos = curPos + direction;
			[items[curPos], items[newPos]] = [items[newPos], items[curPos]];
			onListChange(items);
			setItems([...items]);
		},
		[items]
	);

	return items.map((key, index) => {
		const item = CONFIG.providers[key];
		item.name = key;
		return react.createElement(ServiceOption, {
			item,
			key,
			isFirst: index === 0,
			isLast: index === maxIndex,
			onSwap,
			onTokenChange,
			onToggle,
		});
	});
};


const OptionList = ({ type, items, onChange }) => {
	const [itemList, setItemList] = useState(items);
	const [, forceUpdate] = useState();

	useEffect(() => {
		if (!type) return;

		const eventListener = (event) => {
			if (event.detail?.type !== type) return;
			setItemList(event.detail.items);
		};
		document.addEventListener("lyrics-plus", eventListener);

		return () => document.removeEventListener("lyrics-plus", eventListener);
	}, []);

	return itemList.map((item, index) => {
		if (!item || (item.when && !item.when())) {
			return;
		}

		const onChangeItem = item.onChange || onChange;

		return react.createElement(
			"div",
			{ 
				key: index,
				className: "setting-row"
			},
			react.createElement(
				"div",
				{ className: "setting-row-content" },
				react.createElement(
					"div",
					{ className: "setting-row-left" },
					react.createElement("div", { className: "setting-name" }, item.desc),
					item.info && react.createElement("div", {
						className: "setting-description",
						dangerouslySetInnerHTML: {
							__html: item.info,
						},
					})
				),
				react.createElement(
					"div",
					{ className: "setting-row-right" },
					react.createElement(item.type, {
						...item,
						name: item.desc,
						defaultValue: CONFIG.visual[item.key],
						onChange: (value) => {
							onChangeItem(item.key, value);
							forceUpdate({});
						},
					})
				)
			)
		);
	});
};

const languageCodes =
	"none,en,af,ar,bg,bn,ca,zh,cs,da,de,el,es,et,fa,fi,fr,gu,he,hi,hr,hu,id,is,it,ja,jv,kn,ko,lt,lv,ml,mr,ms,nl,no,pl,pt,ro,ru,sk,sl,sr,su,sv,ta,te,th,tr,uk,ur,vi,zu".split(
		","
	);

const displayNames = new Intl.DisplayNames(["en"], { type: "language" });
const languageOptions = languageCodes.reduce((acc, code) => {
	acc[code] = code === "none" ? "None" : displayNames.of(code);
	return acc;
}, {});

// Pre-defined styles to avoid recreation on each render
const MODAL_STYLES = {
	header: { margin: 0, fontSize: "18px", fontWeight: "600" },
	previewTitle: { marginTop: 0, marginBottom: "10px" }
};

const ConfigModal = () => {
	const [activeTab, setActiveTab] = react.useState("display");

	// Initialize line-spacing if not set
	if (CONFIG.visual["line-spacing"] === undefined) {
		CONFIG.visual["line-spacing"] = 8;
	}

	const HeaderSection = () => {
		return react.createElement(
			"div",
			{ className: "settings-header" },
			react.createElement(
				"div",
				{ className: "settings-header-content" },
				react.createElement(
					"div",
					{ className: "settings-title-section" },
					react.createElement("h1", null, "Lyrics Plus"),
					react.createElement("span", { className: "settings-version" }, `v${Utils.currentVersion}`)
				),
				react.createElement(
					"button",
					{
						className: "settings-github-btn",
						onClick: () => window.open("https://github.com/ivLis-Studio/lyrics-plus", "_blank"),
						title: "GitHub 저장소 방문"
					},
					react.createElement("svg", {
						width: 16,
						height: 16,
						viewBox: "0 0 16 16",
						fill: "currentColor",
						dangerouslySetInnerHTML: {
							__html: '<path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>'
						}
					}),
					react.createElement("span", null, "GitHub")
				)
			)
		);
	};

	const TabButton = ({ id, label, icon, isActive, onClick }) => {
		return react.createElement(
			"button",
			{
				className: `settings-tab-btn ${isActive ? "active" : ""}`,
				onClick: (e) => {
					e.preventDefault();
					e.stopPropagation();
					onClick(id);
				}
			},
			label
		);
	};

	const TabContainer = ({ children }) => {
		return react.createElement(
			"div",
			{
				className: "settings-content"
			},
			children
		);
	};

	const SectionTitle = ({ title, subtitle }) => {
		return react.createElement(
			"div",
			{ className: "section-title" },
			react.createElement("div", { className: "section-title-content" },
				react.createElement("div", { className: "section-text" },
					react.createElement("h3", null, title),
					subtitle && react.createElement("p", null, subtitle)
				)
			)
		);
	};

	return react.createElement(
		"div",
		{
			id: `${APP_NAME}-config-container`,
		},
		react.createElement("style", {
			dangerouslySetInnerHTML: {
				__html: `
/* 전체 컨테이너 - Microsoft Fluent 스타일 */
#${APP_NAME}-config-container {
    padding: 0;
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #1a1a1a;
}

/* 헤더 영역 */
#${APP_NAME}-config-container .settings-header {
    background: #202020;
    border-bottom: 1px solid #2b2b2b;
    padding: 20px 32px;
    flex-shrink: 0;
}

#${APP_NAME}-config-container .settings-header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#${APP_NAME}-config-container .settings-title-section {
    display: flex;
    align-items: center;
    gap: 12px;
}

#${APP_NAME}-config-container .settings-title-section h1 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    color: #ffffff;
    letter-spacing: -0.01em;
}

#${APP_NAME}-config-container .settings-version {
    font-size: 12px;
    color: #8a8a8a;
    font-weight: 400;
    padding: 2px 8px;
    background: #2b2b2b;
    border-radius: 2px;
}

#${APP_NAME}-config-container .settings-github-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #3d3d3d;
    border-radius: 2px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.1s ease;
    font-size: 14px;
    font-weight: 400;
}

#${APP_NAME}-config-container .settings-github-btn:hover {
    background: #2b2b2b;
    border-color: #505050;
}

#${APP_NAME}-config-container .settings-github-btn:active {
    background: #1f1f1f;
}

/* 탭 영역 */
#${APP_NAME}-config-container .settings-tabs {
    display: flex;
    gap: 0;
    padding: 0 32px;
    background: #202020;
    border-bottom: 1px solid #2b2b2b;
    flex-shrink: 0;
    overflow-x: auto;
}

#${APP_NAME}-config-container .settings-tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: #8a8a8a;
    cursor: pointer;
    transition: all 0.1s ease;
    font-weight: 400;
    font-size: 14px;
    white-space: nowrap;
}

#${APP_NAME}-config-container .settings-tab-btn:hover {
    background: rgba(255, 255, 255, 0.03);
    color: #ffffff;
}

#${APP_NAME}-config-container .settings-tab-btn.active {
    background: transparent;
    border-bottom-color: #0078d4;
    color: #ffffff;
}

#${APP_NAME}-config-container .tab-icon {
    font-size: 16px;
}

/* 콘텐츠 영역 */
#${APP_NAME}-config-container .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px 32px;
    background: #1a1a1a;
}

#${APP_NAME}-config-container .settings-content::-webkit-scrollbar {
    width: 14px;
}

#${APP_NAME}-config-container .settings-content::-webkit-scrollbar-track {
    background: transparent;
}

#${APP_NAME}-config-container .settings-content::-webkit-scrollbar-thumb {
    background: #3d3d3d;
    border: 3px solid #1a1a1a;
    border-radius: 7px;
}

#${APP_NAME}-config-container .settings-content::-webkit-scrollbar-thumb:hover {
    background: #505050;
}

#${APP_NAME}-config-container .tab-content {
    display: none;
}

#${APP_NAME}-config-container .tab-content.active {
    display: block;
}

/* 섹션 타이틀 */
#${APP_NAME}-config-container .section-title {
    margin: 32px 0 16px;
    padding: 0;
    border: none;
}

#${APP_NAME}-config-container .section-title:first-child {
    margin-top: 0;
}

#${APP_NAME}-config-container .section-title-content {
    display: flex;
    align-items: center;
    gap: 0;
}

#${APP_NAME}-config-container .section-icon {
    display: none;
}

#${APP_NAME}-config-container .section-text h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: -0.01em;
}

#${APP_NAME}-config-container .section-text p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #8a8a8a;
}

/* 설정 행 */
#${APP_NAME}-config-container .setting-row {
    padding: 0;
    margin: 0;
    background: transparent;
    border: none;
    border-radius: 0;
    transition: background 0.1s ease;
}

#${APP_NAME}-config-container .setting-row:hover {
    background: rgba(255,255,255,0.02);
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

#${APP_NAME}-config-container .setting-row-right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
}

/* 슬라이더 컨트롤 */
#${APP_NAME}-config-container .slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 280px;
}

#${APP_NAME}-config-container .config-slider {
    flex: 1;
    height: 4px;
    background: #2b2b2b;
    border-radius: 2px;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: background 0.1s ease;
}

#${APP_NAME}-config-container .config-slider::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: #0078d4;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.1s ease;
}

#${APP_NAME}-config-container .config-slider::-webkit-slider-thumb:hover {
    background: #106ebe;
    transform: scale(1.1);
}

#${APP_NAME}-config-container .config-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #0078d4;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.1s ease;
}

#${APP_NAME}-config-container .config-slider::-moz-range-thumb:hover {
    background: #106ebe;
    transform: scale(1.1);
}

#${APP_NAME}-config-container .slider-value {
    min-width: 56px;
    text-align: right;
    font-size: 13px;
    color: #ffffff;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
}

/* 조정 버튼 (+ -) */
#${APP_NAME}-config-container .adjust-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

#${APP_NAME}-config-container .adjust-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
    border-radius: 2px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.1s ease;
    user-select: none;
}

#${APP_NAME}-config-container .adjust-button:hover {
    background: #323232;
    border-color: #0078d4;
}

#${APP_NAME}-config-container .adjust-button:active {
    background: #1f1f1f;
    transform: scale(0.95);
}

#${APP_NAME}-config-container .adjust-value {
    min-width: 48px;
    text-align: center;
    font-size: 13px;
    color: #ffffff;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
}

/* 스왑 버튼 (위 아래 화살표) */
#${APP_NAME}-config-container .swap-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.1s ease;
}

#${APP_NAME}-config-container .swap-button:hover {
    background: #323232;
    border-color: #0078d4;
}

#${APP_NAME}-config-container .swap-button:active {
    background: #1f1f1f;
    transform: scale(0.95);
}

#${APP_NAME}-config-container .swap-button svg {
    width: 12px;
    height: 12px;
    fill: #ffffff;
}

/* 컬러피커 */
#${APP_NAME}-config-container .color-picker-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

#${APP_NAME}-config-container .config-color-picker {
    width: 48px;
    height: 36px;
    padding: 2px;
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
    border-radius: 2px;
    cursor: pointer;
    transition: border-color 0.1s ease;
}

#${APP_NAME}-config-container .config-color-picker:hover {
    border-color: #505050;
}

#${APP_NAME}-config-container .config-color-picker:focus {
    border-color: #0078d4;
    outline: none;
}

#${APP_NAME}-config-container .config-color-input {
    width: 120px !important;
    background: #2b2b2b !important;
    border: 1px solid #3d3d3d !important;
    border-radius: 2px !important;
    padding: 8px 12px !important;
    font-size: 13px !important;
    color: #ffffff !important;
    font-family: 'Courier New', monospace !important;
    text-transform: uppercase !important;
}

/* 입력 필드 */
#${APP_NAME}-config-container input[type="text"],
#${APP_NAME}-config-container input[type="password"],
#${APP_NAME}-config-container input[type="number"],
#${APP_NAME}-config-container input[type="url"],
#${APP_NAME}-config-container input,
#${APP_NAME}-config-container textarea {
	background: #2b2b2b !important;
	border: 1px solid #3d3d3d !important;
	border-radius: 2px !important;
	padding: 8px 12px !important;
    width: min(320px, 100%) !important;
    outline: none !important;
    color: #ffffff !important;
    transition: border-color 0.1s ease !important;
    font-size: 13px !important;
    font-family: var(--font-family, -apple-system, BlinkMacSystemFont, sans-serif) !important;
    min-height: 36px !important;
    box-sizing: border-box !important;
}

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

#${APP_NAME}-config-container input[type="text"]:hover,
#${APP_NAME}-config-container input[type="password"]:hover,
#${APP_NAME}-config-container input[type="number"]:hover,
#${APP_NAME}-config-container input[type="url"]:hover,
#${APP_NAME}-config-container input:hover,
#${APP_NAME}-config-container select:hover,
#${APP_NAME}-config-container textarea:hover {
    border-color: #505050 !important;
    background: #2b2b2b !important;
}

#${APP_NAME}-config-container input[type="text"]:focus,
#${APP_NAME}-config-container input[type="password"]:focus,
#${APP_NAME}-config-container input[type="number"]:focus,
#${APP_NAME}-config-container input[type="url"]:focus,
#${APP_NAME}-config-container input:focus,
#${APP_NAME}-config-container select:focus,
#${APP_NAME}-config-container textarea:focus {
    border-color: #0078d4 !important;
    background: #2b2b2b !important;
    box-shadow: none !important;
}

#${APP_NAME}-config-container input::placeholder,
#${APP_NAME}-config-container textarea::placeholder {
    color: #6d6d6d !important;
    opacity: 1 !important;
}

#${APP_NAME}-config-container select option {
    background-color: #2b2b2b;
    color: #ffffff;
    padding: 8px 12px;
}

/* 버튼 스타일 */
#${APP_NAME}-config-container .adjust-value {
    min-width: 48px;
    text-align: center;
    font-weight: 400;
    font-size: 14px;
    color: #ffffff;
}

#${APP_NAME}-config-container .switch,
#${APP_NAME}-config-container .btn {
    height: 32px;
    min-width: 32px;
    border-radius: 2px;
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.1s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

/* 체크박스 스타일 */
#${APP_NAME}-config-container .switch-checkbox {
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    border-radius: 2px;
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
    cursor: pointer;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    position: relative;
}

#${APP_NAME}-config-container .switch-checkbox:hover {
    background: #333333;
    border-color: #505050;
}

#${APP_NAME}-config-container .switch-checkbox.active {
    background: #0078d4;
    border-color: #0078d4;
}

#${APP_NAME}-config-container .switch-checkbox.active:hover {
    background: #106ebe;
    border-color: #106ebe;
}

#${APP_NAME}-config-container .switch-checkbox svg {
    color: #ffffff;
    opacity: 1;
}
    transition: background 0.1s ease, border-color 0.1s ease;
}

#${APP_NAME}-config-container .switch {
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
}

#${APP_NAME}-config-container .switch:hover {
    background: #323232;
    border-color: #505050;
}

#${APP_NAME}-config-container .switch.disabled {
    background: #2b2b2b;
    border-color: #3d3d3d;
    opacity: 0.4;
}

#${APP_NAME}-config-container .btn {
    background: #2b2b2b;
    border: 1px solid #3d3d3d;
    color: #ffffff;
    font-weight: 400;
    padding: 0 16px;
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

/* 글꼴 미리보기 */
#${APP_NAME}-config-container .font-preview-container {
    background: #202020;
    border: 1px solid #2b2b2b;
    border-radius: 2px;
    padding: 20px;
    margin-bottom: 24px;
}

#${APP_NAME}-config-container .font-preview-title {
    margin: 0 0 16px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 8px;
}

#${APP_NAME}-config-container .font-preview {
    background: #1a1a1a;
    border: 1px solid #2b2b2b;
    border-radius: 2px;
    padding: 16px;
}

#${APP_NAME}-config-container #lyrics-preview,
#${APP_NAME}-config-container #translation-preview {
    transition: all 0.1s ease;
}

/* 정보 박스 */
#${APP_NAME}-config-container .info-box {
    padding: 20px;
    background: #202020;
    border: 1px solid #2b2b2b;
    border-radius: 2px;
    margin-bottom: 24px;
}

#${APP_NAME}-config-container .info-box h3 {
    margin: 0 0 12px;
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
}

#${APP_NAME}-config-container .info-box p {
    margin: 0 0 8px;
    color: #8a8a8a;
    line-height: 1.6;
    font-size: 13px;
}

#${APP_NAME}-config-container .info-box p:last-child {
    margin-bottom: 0;
}
`
			},
		}),
		react.createElement(HeaderSection),
		react.createElement(
			"div",
			{ className: "settings-tabs" },
			react.createElement(TabButton, {
				id: "display",
				label: "디스플레이",
				icon: "",
				isActive: activeTab === "display",
				onClick: setActiveTab
			}),
			react.createElement(TabButton, {
				id: "typography",
				label: "타이포그래피",
				icon: "",
				isActive: activeTab === "typography",
				onClick: setActiveTab
			}),
			react.createElement(TabButton, {
				id: "behavior",
				label: "동작",
				icon: "",
				isActive: activeTab === "behavior",
				onClick: setActiveTab
			}),
			react.createElement(TabButton, {
				id: "providers",
				label: "가사 제공자",
				icon: "",
				isActive: activeTab === "providers",
				onClick: setActiveTab
			}),
			react.createElement(TabButton, {
				id: "advanced",
				label: "고급",
				icon: "",
				isActive: activeTab === "advanced",
				onClick: setActiveTab
			}),
			react.createElement(TabButton, {
				id: "about",
				label: "정보",
				icon: "",
				isActive: activeTab === "about",
				onClick: setActiveTab
			})
		),
		react.createElement(TabContainer, null,
			// 디스플레이 탭
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "display" ? "active" : ""}`
				},
				react.createElement(SectionTitle, { title: "시각 효과", subtitle: "가사 화면의 시각적 요소를 커스터마이징하세요" }),
				react.createElement(OptionList, {
				items: [
				{
					desc: "정렬 방식",
					key: "alignment",
					info: "가사 텍스트의 정렬 위치를 선택하세요",
					type: ConfigSelection,
				options: {
					left: "왼쪽",
					center: "가운데",
					right: "오른쪽",
				},
				},
				{
					desc: "노이즈 오버레이",
					key: "noise",
					info: "배경에 필름 그레인 효과를 추가합니다",
					type: ConfigSlider,
				},
				{
					desc: "컬러풀 배경",
					key: "colorful",
					info: "앨범 색상 기반의 동적 배경을 활성화합니다",
					type: ConfigSlider,
				},
				{
					desc: "앨범 커버 배경",
					info: "현재 재생 중인 앨범 커버를 배경으로 사용합니다 (풀스크린 모드에서는 제대로 동작하지 않을 수 있습니다)",
					key: "gradient-background",
					type: ConfigSlider,
				},
				{
					desc: "배경 밝기",
					key: "background-brightness",
					info: "배경의 밝기 수준을 조절합니다 (0-100%)",
					type: ConfigAdjust,
					min: 0,
					max: 100,
					step: 10,
				},
			],
			onChange: (name, value) => {
				CONFIG.visual[name] = value;
				StorageManager.saveConfig(name, value);
				lyricContainerUpdate?.();
				const configChange = new CustomEvent("lyrics-plus", {
					detail: {
						type: "config",
						name: name,
						value: value,
					},
				});
				window.dispatchEvent(configChange);
			},
		}),
				react.createElement(SectionTitle, { title: "동기화 모드", subtitle: "컴팩트 동기화 모드의 표시 옵션" }),
				react.createElement(OptionList, {
				items: [
				{
					desc: "표시 줄 수 (이전)",
					key: "lines-before",
					info: "현재 재생 중인 가사 이전에 표시할 줄 수",
					type: ConfigSelection,
					options: [0, 1, 2, 3, 4],
				},
				{
					desc: "표시 줄 수 (이후)",
					key: "lines-after",
					info: "현재 재생 중인 가사 이후에 표시할 줄 수",
					type: ConfigSelection,
					options: [0, 1, 2, 3, 4],
				},
				{
					desc: "페이드아웃 블러 효과",
					key: "fade-blur",
					info: "비활성 가사에 블러 효과를 적용합니다",
					type: ConfigSlider,
				},
			],
			onChange: (name, value) => {
				CONFIG.visual[name] = value;
				StorageManager.saveConfig(name, value);
				lyricContainerUpdate?.();
				const configChange = new CustomEvent("lyrics-plus", {
					detail: {
						type: "config",
						name: name,
						value: value,
					},
				});
				window.dispatchEvent(configChange);
			},
		})
			),
			// 타이포그래피 탭
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "typography" ? "active" : ""}`
				},
				react.createElement(SectionTitle, { title: "실시간 미리보기", subtitle: "설정한 스타일을 즉시 확인하세요" }),
				react.createElement("div", {
					className: "font-preview-container",
				},
					react.createElement("h3", { className: "font-preview-title" }, 
						"스타일 미리보기"
					),
					react.createElement("div", {
						className: "font-preview"
					},
						react.createElement("div", {
							id: "lyrics-preview",
							style: {
								fontSize: `${CONFIG.visual["original-font-size"] || 20}px`,
								fontWeight: CONFIG.visual["original-font-weight"] || "400",
								textAlign: CONFIG.visual["alignment"] || "left",
								lineHeight: "1.5",
								marginBottom: "10px",
								opacity: (CONFIG.visual["original-opacity"] || 100) / 100,
								textShadow: CONFIG.visual["text-shadow-enabled"] ?
									`0 0 ${CONFIG.visual["text-shadow-blur"] || 2}px ${CONFIG.visual["text-shadow-color"] || "#000000"}${Math.round((CONFIG.visual["text-shadow-opacity"] || 50) * 2.55).toString(16).padStart(2, '0')}` :
									"none"
							}
						}, "샘플 가사 텍스트입니다"),
						react.createElement("div", {
							id: "translation-preview",
							style: {
								fontSize: `${CONFIG.visual["translation-font-size"] || 16}px`,
								fontWeight: CONFIG.visual["translation-font-weight"] || "400",
								textAlign: CONFIG.visual["alignment"] || "left",
								lineHeight: "1.4",
								opacity: (CONFIG.visual["translation-opacity"] || 100) / 100,
								color: "rgba(255,255,255,0.7)",
								marginTop: `${parseInt(CONFIG.visual["line-spacing"]) || 8}px`,
								textShadow: CONFIG.visual["text-shadow-enabled"] ?
									`0 0 ${CONFIG.visual["text-shadow-blur"] || 2}px ${CONFIG.visual["text-shadow-color"] || "#000000"}${Math.round((CONFIG.visual["text-shadow-opacity"] || 50) * 2.55).toString(16).padStart(2, '0')}` :
									"none"
							}
						}, "Sample lyrics translation text")
					)
				),
				react.createElement(SectionTitle, { title: "원문 스타일", subtitle: "가사 원문의 글꼴 설정" }),
				react.createElement(OptionList, {
					items: [
						{
							desc: "글꼴 크기",
							info: "원문 가사의 글꼴 크기 (픽셀)",
							key: "original-font-size",
							type: ConfigSliderRange,
							min: 12,
							max: 128,
							step: 2,
							unit: "px",
						},
						{
							desc: "글꼴 두께",
							info: "원문 가사의 글꼴 굵기",
							key: "original-font-weight",
							type: ConfigSelection,
							options: {
								"100": "Thin (100)",
								"200": "Extra Light (200)",
								"300": "Light (300)",
								"400": "Regular (400)",
								"500": "Medium (500)",
								"600": "Semi Bold (600)",
								"700": "Bold (700)",
								"800": "Extra Bold (800)",
								"900": "Black (900)",
							},
						},
						{
							desc: "투명도",
							info: "원문 가사의 불투명도 (0-100%)",
							key: "original-opacity",
							type: ConfigSliderRange,
							min: 0,
							max: 100,
							step: 5,
							unit: "%",
						},
					],
					onChange: (name, value) => {
						CONFIG.visual[name] = value;
						localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
						const lyricsPreview = document.getElementById("lyrics-preview");
						if (lyricsPreview) {
							if (name === "original-font-size") lyricsPreview.style.fontSize = `${value}px`;
							if (name === "original-font-weight") lyricsPreview.style.fontWeight = value;
							if (name === "original-opacity") lyricsPreview.style.opacity = value / 100;
						}
						lyricContainerUpdate?.();
						window.dispatchEvent(new CustomEvent("lyrics-plus", {
							detail: { type: "config", name, value },
						}));
					},
				}),
				react.createElement(SectionTitle, { title: "번역문 스타일", subtitle: "번역된 가사의 글꼴 설정" }),
				react.createElement(OptionList, {
					items: [
						{
							desc: "글꼴 크기",
							info: "번역 가사의 글꼴 크기 (픽셀)",
							key: "translation-font-size",
							type: ConfigSliderRange,
							min: 12,
							max: 128,
							step: 2,
							unit: "px",
						},
						{
							desc: "글꼴 두께",
							info: "번역 가사의 글꼴 굵기",
							key: "translation-font-weight",
							type: ConfigSelection,
							options: {
								"100": "Thin (100)",
								"200": "Extra Light (200)",
								"300": "Light (300)",
								"400": "Regular (400)",
								"500": "Medium (500)",
								"600": "Semi Bold (600)",
								"700": "Bold (700)",
								"800": "Extra Bold (800)",
								"900": "Black (900)",
							},
						},
						{
							desc: "투명도",
							info: "번역 가사의 불투명도 (0-100%)",
							key: "translation-opacity",
							type: ConfigSliderRange,
							min: 0,
							max: 100,
							step: 5,
							unit: "%",
						},
						{
							desc: "원문과의 간격",
							info: "원문과 번역문 사이의 여백 (픽셀)",
							key: "line-spacing",
							type: ConfigSliderRange,
							min: 0,
							max: 30,
							step: 2,
							unit: "px",
						},
					],
					onChange: (name, value) => {
						CONFIG.visual[name] = value;
						localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
						const translationPreview = document.getElementById("translation-preview");
						const lyricsPreview = document.getElementById("lyrics-preview");
						if (translationPreview) {
							if (name === "translation-font-size") translationPreview.style.fontSize = `${value}px`;
							if (name === "translation-font-weight") translationPreview.style.fontWeight = value;
							if (name === "translation-opacity") translationPreview.style.opacity = value / 100;
							if (name === "line-spacing") translationPreview.style.marginTop = `${parseInt(value) || 0}px`;
						}
						lyricContainerUpdate?.();
						window.dispatchEvent(new CustomEvent("lyrics-plus", {
							detail: { type: "config", name, value },
						}));
					},
				}),
				react.createElement(SectionTitle, { title: "텍스트 그림자", subtitle: "가독성을 높이는 그림자 효과" }),
				react.createElement(OptionList, {
					items: [
						{
							desc: "그림자 효과",
							info: "가사 텍스트에 그림자 효과를 적용합니다",
							key: "text-shadow-enabled",
							type: ConfigSlider,
						},
						{
							desc: "그림자 색상",
							info: "그림자의 색상 (HEX 코드)",
							key: "text-shadow-color",
							type: ConfigColorPicker,
						},
						{
							desc: "그림자 투명도",
							info: "그림자의 불투명도 (0-100%)",
							key: "text-shadow-opacity",
							type: ConfigSliderRange,
							min: 0,
							max: 100,
							step: 5,
							unit: "%",
						},
						{
							desc: "블러 강도",
							info: "그림자의 흐림 정도",
							key: "text-shadow-blur",
							type: ConfigSliderRange,
							min: 0,
							max: 10,
							step: 1,
							unit: "px",
						},
					],
					onChange: (name, value) => {
						CONFIG.visual[name] = value;
						localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
						const lyricsPreview = document.getElementById("lyrics-preview");
						const translationPreview = document.getElementById("translation-preview");
						
						if (lyricsPreview && translationPreview) {
							const shadowEnabled = CONFIG.visual["text-shadow-enabled"];
							const shadowColor = CONFIG.visual["text-shadow-color"] || "#000000";
							const shadowOpacity = CONFIG.visual["text-shadow-opacity"] || 50;
							const shadowBlur = CONFIG.visual["text-shadow-blur"] || 2;
							const shadowAlpha = Math.round(shadowOpacity * 2.55).toString(16).padStart(2, '0');
							const shadow = shadowEnabled ? `0 0 ${shadowBlur}px ${shadowColor}${shadowAlpha}` : "none";
							lyricsPreview.style.textShadow = shadow;
							translationPreview.style.textShadow = shadow;
						}
						lyricContainerUpdate?.();
						window.dispatchEvent(new CustomEvent("lyrics-plus", {
							detail: { type: "config", name, value },
						}));
					},
				})
			),
			// 동작 탭
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "behavior" ? "active" : ""}`
				},
				react.createElement(SectionTitle, { title: "재생 동작", subtitle: "재생 관련 기능 설정" }),
				react.createElement(OptionList, {
					items: [
						{
							desc: "재생바 버튼 대체",
							key: "playbar-button",
							info: "Spotify의 기본 가사 버튼을 Lyrics Plus로 교체합니다",
							type: ConfigSlider,
						},
						{
							desc: "전역 지연 시간",
							info: "모든 곡에 적용되는 가사 동기화 오프셋 (밀리초)",
							key: "global-delay",
							type: ConfigAdjust,
							min: -10000,
							max: 10000,
							step: 250,
						},
						{
							desc: "전체화면 단축키",
							key: "fullscreen-key",
							info: "가사 전체화면 모드를 위한 키보드 단축키",
							type: ConfigHotkey,
						},
					],
					onChange: (name, value) => {
						CONFIG.visual[name] = value;
						StorageManager.saveConfig(name, value);
						lyricContainerUpdate?.();
						window.dispatchEvent(new CustomEvent("lyrics-plus", {
							detail: { type: "config", name, value },
						}));
					},
				}),
				react.createElement(SectionTitle, { title: "가라오케 모드", subtitle: "노래방 스타일 가사 표시" }),
				react.createElement(OptionList, {
					items: [
						{
							desc: "글자 바운스 효과",
							info: "가라오케 모드에서 현재 부르는 글자에 통통 튀는 애니메이션을 적용합니다",
							key: "karaoke-bounce",
							type: ConfigSlider,
						},
					],
					onChange: (name, value) => {
						CONFIG.visual[name] = value;
						StorageManager.saveConfig(name, value);
						lyricContainerUpdate?.();
						window.dispatchEvent(new CustomEvent("lyrics-plus", {
							detail: { type: "config", name, value },
						}));
					},
				}),
				react.createElement(SectionTitle, { title: "캐시 관리", subtitle: "저장된 데이터 관리" }),
				react.createElement(OptionList, {
					items: [
						{
							desc: "메모리 캐시 초기화",
							info: "로드된 가사는 빠른 재로드를 위해 메모리에 임시 저장됩니다. Spotify를 재시작하지 않고 메모리 캐시를 비웁니다",
							key: "clear-memory-cache",
							text: "캐시 비우기",
							type: ConfigButton,
							onChange: () => {
								reloadLyrics?.();
								Spicetify.showNotification("✓ 메모리 캐시가 초기화되었습니다", false, 2000);
							},
						},
					],
					onChange: () => {},
				})
			),
			// 가사 제공자 탭
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "providers" ? "active" : ""}`
				},
				react.createElement(SectionTitle, { title: "가사 제공자", subtitle: "가사 소스의 우선순위와 설정을 관리하세요" }),
				react.createElement(ServiceList, {
					itemsList: CONFIG.providersOrder,
					onListChange: (list) => {
						CONFIG.providersOrder = list;
						localStorage.setItem(`${APP_NAME}:services-order`, JSON.stringify(list));
						reloadLyrics?.();
					},
					onToggle: (name, value) => {
						CONFIG.providers[name].on = value;
						localStorage.setItem(`${APP_NAME}:provider:${name}:on`, value);
						reloadLyrics?.();
					},
					onTokenChange: (name, value) => {
						CONFIG.providers[name].token = value;
						localStorage.setItem(`${APP_NAME}:provider:${name}:token`, value);
						reloadLyrics?.();
					},
				})
			),
			// 고급 탭
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "advanced" ? "active" : ""}`
				},
				react.createElement(SectionTitle, { title: "언어 감지", subtitle: "텍스트 변환을 위한 언어 감지 설정" }),
				react.createElement(OptionList, {
					items: [
						{
							desc: "일본어 감지 임계값",
							info: "가사에서 가나 문자의 비율로 일본어를 감지합니다. 값이 높을수록 더 엄격하게 감지합니다 (백분율)",
							key: "ja-detect-threshold",
							type: ConfigSliderRange,
							min: thresholdSizeLimit.min,
							max: thresholdSizeLimit.max,
							step: thresholdSizeLimit.step,
							unit: "%",
						},
						{
							desc: "중국어 감지 임계값",
							info: "번체자와 간체자의 비율로 중국어 종류를 감지합니다. 값이 높을수록 더 엄격하게 감지합니다 (백분율)",
							key: "hans-detect-threshold",
							type: ConfigSliderRange,
							min: thresholdSizeLimit.min,
							max: thresholdSizeLimit.max,
							step: thresholdSizeLimit.step,
							unit: "%",
						},
					],
					onChange: (name, value) => {
						CONFIG.visual[name] = value;
						StorageManager.saveConfig(name, value);
						lyricContainerUpdate?.();
						window.dispatchEvent(new CustomEvent("lyrics-plus", {
							detail: { type: "config", name, value },
						}));
					},
				}),
				react.createElement(SectionTitle, { title: "API 설정", subtitle: "외부 서비스 연동을 위한 API 키" }),
				react.createElement(OptionList, {
					items: [
						{
							desc: "Gemini API 키",
							info: "Google Gemini AI를 활용한 가사 번역 기능을 사용하려면 API 키가 필요합니다",
							key: "gemini-api-key",
							type: ConfigInput,
						},
					],
					onChange: (name, value) => {
						CONFIG.visual[name] = value;
						StorageManager.saveConfig(name, value);
						lyricContainerUpdate?.();
						window.dispatchEvent(new CustomEvent("lyrics-plus", {
							detail: { type: "config", name, value },
						}));
					},
				})
			),
			// 정보 탭
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "about" ? "active" : ""}`
				},
				react.createElement(SectionTitle, { title: "앱 정보", subtitle: "Lyrics Plus에 대해" }),
				react.createElement("div", {
					style: {
						padding: "20px",
						background: "#202020",
						border: "1px solid #2b2b2b",
						borderRadius: "2px",
						marginBottom: "24px"
					}
				},
					react.createElement("h3", { 
						style: { 
							margin: "0 0 12px", 
							fontSize: "18px", 
							color: "#ffffff",
							display: "flex",
							alignItems: "center",
							gap: "8px"
						} 
					}, 
						react.createElement("span", null, "🎵"),
						"Lyrics Plus"
					),
					react.createElement("p", { 
						style: { 
							margin: "0 0 8px", 
							color: "rgba(255,255,255,0.7)", 
							lineHeight: "1.6" 
						} 
					}, 
						"Spicetify를 위한 한국어 대응 가사 확장 프로그램."
					),
					react.createElement("p", { 
						style: { 
							margin: "0", 
							color: "rgba(255,255,255,0.5)", 
							fontSize: "14px" 
						} 
					}, 
						`버전: ${Utils.currentVersion}`
					)
				),
				react.createElement(SectionTitle, { title: "업데이트", subtitle: "최신 버전 확인" }),
				react.createElement("div", {
					id: "update-result-container",
					style: { marginBottom: "16px" }
				}),
				react.createElement(OptionList, {
					items: [
						{
							desc: "최신 버전 확인",
							info: `현재 버전: v${Utils.currentVersion}. GitHub에서 새로운 업데이트가 있는지 확인합니다`,
							key: "check-update",
							text: "업데이트 확인",
							type: ConfigButton,
							onChange: async (_, event) => {
								const button = event?.target;
								if (!button) return;
								const originalText = button.textContent;
								button.textContent = "확인 중...";
								button.disabled = true;

								const resultContainer = document.getElementById('update-result-container');
								if (resultContainer) resultContainer.innerHTML = '';

								try {
									const updateInfo = await Utils.checkForUpdates();
									
									if (resultContainer) {
										let bgColor, borderColor, textColor, message, showLink = false;
										
										if (updateInfo.error) {
											bgColor = '#3d1a1a';
											borderColor = '#8b2e2e';
											textColor = '#ff6b6b';
											message = `❌ 업데이트 확인 실패: ${updateInfo.error}`;
										} else if (updateInfo.hasUpdate) {
											bgColor = '#1a3d2e';
											borderColor = '#2e8b57';
											textColor = '#4ade80';
											message = `✨ 업데이트 가능: v${updateInfo.latestVersion} (현재: v${updateInfo.currentVersion})`;
											showLink = true;
										} else {
											bgColor = '#1a2d3d';
											borderColor = '#2e5a8b';
											textColor = '#60a5fa';
											message = `✓ 최신 버전입니다: v${updateInfo.currentVersion}`;
										}
										
										resultContainer.innerHTML = `
											<div style="
												padding: 16px;
												background: ${bgColor};
												border: 1px solid ${borderColor};
												border-radius: 2px;
												color: ${textColor};
												font-size: 13px;
												line-height: 1.6;
												margin-bottom: 16px;
											">
												<div style="font-weight: 600; margin-bottom: 8px;">${message}</div>
												${showLink ? `
													<a href="https://github.com/ivLis-Studio/lyrics-plus/releases/latest" 
													   target="_blank" 
													   style="
														   color: #4ade80;
														   text-decoration: underline;
														   cursor: pointer;
													   ">
														→ GitHub에서 다운로드하기
													</a>
												` : ''}
											</div>
										`;
									}
								} catch (error) {
									console.error("Update check failed:", error);
									if (resultContainer) {
										resultContainer.innerHTML = `
											<div style="
												padding: 16px;
												background: #3d1a1a;
												border: 1px solid #8b2e2e;
												border-radius: 2px;
												color: #ff6b6b;
												font-size: 13px;
												margin-bottom: 16px;
											">
												<div style="font-weight: 600;">❌ 업데이트 확인 실패</div>
												<div style="margin-top: 4px; opacity: 0.9;">네트워크 연결을 확인하세요.</div>
											</div>
										`;
									}
								} finally {
									button.textContent = originalText;
									button.disabled = false;
								}
							},
						},
					],
					onChange: () => {},
				}),
				react.createElement(SectionTitle, { title: "크레딧", subtitle: "개발자 및 기여자" }),
				react.createElement("div", {
					style: {
						padding: "20px",
						background: "rgba(255, 255, 255, 0.03)",
						border: "1px solid rgba(255, 255, 255, 0.08)",
						borderRadius: "12px",
					}
				},
					react.createElement("p", { 
						style: { 
							margin: "0 0 12px", 
							color: "rgba(255,255,255,0.9)", 
							lineHeight: "1.6" 
						} 
					}, 
						react.createElement("strong", null, "개발:"),
						" ivLis Studio"
					),
					react.createElement("p", { 
						style: { 
							margin: "0 0 12px", 
							color: "rgba(255,255,255,0.9)", 
							lineHeight: "1.6" 
						} 
					}, 
						react.createElement("strong", null, "원본 프로젝트:"),
						" lyrics-plus by khanhas"
					),
					react.createElement("p", { 
						style: { 
							margin: "0", 
							color: "rgba(255,255,255,0.7)", 
							fontSize: "14px",
							lineHeight: "1.6"
						} 
					}, 
						"오픈소스 프로젝트에 기여해주신 모든 분들께 감사드립니다."
					)
				)
			)
		)
	);
};

function openConfig() {
	const configContainer = react.createElement(ConfigModal);

	// Create a full-screen overlay instead of nested modal
	const overlay = document.createElement('div');
	overlay.id = 'lyrics-plus-settings-overlay';
	overlay.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10px);
	`;

	const modalContainer = document.createElement('div');
	modalContainer.style.cssText = `
		background: var(--spice-main);
		border-radius: 12px;
		max-width: 90vw;
		max-height: 90vh;
		width: 800px;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		border: 1px solid var(--spice-card-border);
	`;

	// Close on outside click
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			document.body.removeChild(overlay);
		}
	});

	// Close on escape key
	const handleEscape = (e) => {
		if (e.key === 'Escape') {
			document.body.removeChild(overlay);
			document.removeEventListener('keydown', handleEscape);
		}
	};
	document.addEventListener('keydown', handleEscape);

	overlay.appendChild(modalContainer);
	document.body.appendChild(overlay);

	// Render React component
	reactDOM.render(configContainer, modalContainer);
}
