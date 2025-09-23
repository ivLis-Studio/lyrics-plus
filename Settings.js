const ButtonSVG = ({ icon, active = true, onClick }) => {
	return react.createElement(
		"button",
		{
			className: `switch${active ? "" : " disabled"}`,
			onClick,
		},
		react.createElement("svg", {
			width: 16,
			height: 16,
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
			className: "switch small",
			onClick,
			disabled,
		},
		react.createElement("svg", {
			width: 10,
			height: 10,
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

const RefreshTokenButton = ({ setTokenCallback }) => {
	const [buttonText, setButtonText] = useState("토큰 새로고침");

	useEffect(() => {
		if (buttonText === "Refreshing token...") {
			Spicetify.CosmosAsync.get("https://apic-desktop.musixmatch.com/ws/1.1/token.get?app_id=web-desktop-app-v1.0", null, {
				authority: "apic-desktop.musixmatch.com",
			})
				.then(({ message: response }) => {
					if (response.header.status_code === 200 && response.body.user_token) {
						setTokenCallback(response.body.user_token);
						setButtonText("토큰 새로고침 완료");
					} else if (response.header.status_code === 401) {
						setButtonText("너무 많은 시도");
					} else {
						setButtonText("토큰 새로고침 실패");
						console.error("Failed to refresh token", response);
					}
				})
				.catch((error) => {
					setButtonText("토큰 새로고침 실패");
					console.error("Failed to refresh token", error);
				});
		}
	}, [buttonText]);

	return react.createElement(
		"button",
		{
			className: "btn",
			onClick: () => {
				setButtonText("토큰 새로고침 중...");
			},
			disabled: buttonText !== "토큰 새로고침",
		},
		buttonText
	);
};

const ConfigButton = ({ name, text, onChange = () => {} }) => {
	return react.createElement(
		"div",
		{
			className: "setting-row",
		},
		react.createElement(
			"label",
			{
				className: "col description",
			},
			name
		),
		react.createElement(
			"div",
			{
				className: "col action",
			},
			react.createElement(
				"button",
				{
					className: "btn",
					onClick: onChange,
				},
				text
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

	return react.createElement(
		"div",
		{
			className: "setting-row",
		},
		react.createElement(
			"label",
			{
				className: "col description",
			},
			name
		),
		react.createElement(
			"div",
			{
				className: "col action",
			},
			react.createElement(ButtonSVG, {
				icon: Spicetify.SVGIcons.check,
				active,
				onClick: toggleState,
			})
		)
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
		"div",
		{
			className: "setting-row",
		},
		react.createElement(
			"label",
			{
				className: "col description",
			},
			name
		),
		react.createElement(
			"div",
			{
				className: "col action",
			},
			react.createElement(
				"select",
				{
					className: "main-dropDown-dropDown",
					value,
					onChange: setValueCallback,
				},
				Object.keys(options).map((item) =>
					react.createElement(
						"option",
						{
							value: item,
						},
						options[item]
					)
				)
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
			"label",
			{
				className: "col description",
			},
			name
		),
		react.createElement(
			"div",
			{
				className: "col action",
			},
			react.createElement("input", {
				value,
				onChange: setValueCallback,
			})
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
		{
			className: "setting-row",
		},
		react.createElement(
			"label",
			{
				className: "col description",
			},
			name
		),
		react.createElement(
			"div",
			{
				className: "col action",
			},
			react.createElement(SwapButton, {
				icon: `<path d="M2 7h12v2H0z"/>`,
				onClick: () => adjust(-1),
				disabled: value === min,
			}),
			react.createElement(
				"p",
				{
					className: "adjust-value",
				},
				value
			),
			react.createElement(SwapButton, {
				icon: Spicetify.SVGIcons.plus2px,
				onClick: () => adjust(1),
				disabled: value === max,
			})
		)
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
			"label",
			{
				className: "col description",
			},
			name
		),
		react.createElement(
			"div",
			{
				className: "col action",
			},
			react.createElement("input", {
				value,
				onFocus: record,
				onBlur: finishRecord,
			})
		)
	);
};

const ServiceAction = ({ item, setTokenCallback }) => {
	switch (item.name) {
		case "local":
			return react.createElement(CacheButton);
		case "musixmatch":
			return react.createElement(RefreshTokenButton, { setTokenCallback });
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
		if (item.name === "genius" && spotifyVersion >= "1.2.31") return;
		const state = !active;
		setActive(state);
		onToggle(item.name, state);
	}, [active]);

	return react.createElement(
		"div",
		null,
		react.createElement(
			"div",
			{
				className: "setting-row",
			},
			react.createElement(
				"h3",
				{
					className: "col description",
				},
				item.name
			),
			react.createElement(
				"div",
				{
					className: "col action",
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
		react.createElement("span", {
			dangerouslySetInnerHTML: {
				__html: item.desc,
			},
		}),
		item.token !== undefined &&
			react.createElement("input", {
				placeholder: `Place your ${item.name} token here`,
				value: token,
				onChange: (event) => setTokenCallback(event.target.value),
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

const corsProxyTemplate = () => {
	const [proxyValue, setProxyValue] = react.useState(localStorage.getItem("spicetify:corsProxyTemplate") || "https://cors-proxy.spicetify.app/{url}");

	return react.createElement("input", {
		placeholder: "CORS Proxy Template",
		value: proxyValue,
		onChange: (event) => {
			const value = event.target.value;
			setProxyValue(value);

			if (value === "" || !value) return localStorage.removeItem("spicetify:corsProxyTemplate");
			localStorage.setItem("spicetify:corsProxyTemplate", value);
		},
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

	return itemList.map((item) => {
		if (!item || (item.when && !item.when())) {
			return;
		}

		const onChangeItem = item.onChange || onChange;

		return react.createElement(
			"div",
			null,
			react.createElement(item.type, {
				...item,
				name: item.desc,
				defaultValue: CONFIG.visual[item.key],
				onChange: (value) => {
					onChangeItem(item.key, value);
					forceUpdate({});
				},
			}),
			item.info &&
				react.createElement("span", {
					dangerouslySetInnerHTML: {
						__html: item.info,
					},
				})
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

const ConfigModal = () => {
	const [activeTab, setActiveTab] = react.useState("general");

	// Initialize line-spacing if not set
	if (CONFIG.visual["line-spacing"] === undefined) {
		CONFIG.visual["line-spacing"] = 8;
	}

	const GitHubButton = () => {
		return react.createElement(
			"button",
			{
				className: "github-btn",
				onClick: () => {
					window.open("https://github.com/ivLis-Studio/lyrics-plus", "_blank");
				},
				title: "GitHub에서 보기"
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
		);
	};

	const TabButton = ({ id, label, isActive, onClick }) => {
		return react.createElement(
			"button",
			{
				className: `tab-btn ${isActive ? "active" : ""}`,
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
				className: "tab-container"
			},
			children
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
#${APP_NAME}-config-container {
    padding: 0;
}
#${APP_NAME}-config-container .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid var(--spice-card-border);
    background-color: var(--spice-card);
}
#${APP_NAME}-config-container h1 {
    font-size: 24px;
}
#${APP_NAME}-config-container .github-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: var(--spice-button-elevated);
    border: 1px solid var(--spice-button-elevated-border);
    border-radius: 8px;
    color: var(--spice-button-elevated-text);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 600;
}
#${APP_NAME}-config-container .github-btn:hover {
    transform: scale(1.03);
    background-color: var(--spice-button-elevated-hover);
}
#${APP_NAME}-config-container .tabs {
    display: flex;
    padding: 0 24px;
    background-color: var(--spice-card);
    border-bottom: 1px solid var(--spice-card-border);
}
#${APP_NAME}-config-container .tab-btn {
    padding: 16px 4px;
    margin-right: 24px;
    background: none;
    border: none;
    color: var(--spice-subtext);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;
    font-weight: 600;
    font-size: 15px;
}
#${APP_NAME}-config-container .tab-btn:hover {
    color: var(--spice-text);
}
#${APP_NAME}-config-container .tab-btn.active {
    color: var(--spice-text);
    border-bottom-color: var(--spice-accent);
}
#${APP_NAME}-config-container .tab-container {
    padding: 24px;
    background-color: var(--spice-main-elevated);
}
#${APP_NAME}-config-container .tab-content {
    display: none;
}
#${APP_NAME}-config-container .tab-content.active {
    display: block;
}
#${APP_NAME}-config-container .tab-content > div {
    padding: 16px 0;
    border-bottom: 1px solid var(--spice-card-border);
}
#${APP_NAME}-config-container .tab-content > div:last-child {
    border-bottom: none;
}
#${APP_NAME}-config-container .setting-row {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) auto;
    gap: 16px;
    align-items: center;
}
#${APP_NAME}-config-container .col.description {
    font-weight: 600;
    font-size: 15px;
    color: var(--spice-text);
}
#${APP_NAME}-config-container .tab-content > div > span {
    display: block;
    font-size: 13px;
    color: var(--spice-subtext);
    margin-top: 8px;
    max-width: 450px;
}
#${APP_NAME}-config-container .col.action {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    justify-content: flex-end;
}
#${APP_NAME}-config-container input,
#${APP_NAME}-config-container select {
    background-color: var(--spice-main-elevated);
    border: 1px solid var(--spice-card-border);
    border-radius: 8px;
    padding: 8px 12px;
    width: min(360px, 100%);
    outline: none;
    color: var(--spice-text);
    transition: border-color 0.2s ease;
}
#${APP_NAME}-config-container input:hover,
#${APP_NAME}-config-container select:hover {
    border-color: var(--spice-subtext);
}
#${APP_NAME}-config-container select option {
    background-color: var(--spice-main-elevated);
    color: var(--spice-text);
}
#${APP_NAME}-config-container h2 {
    margin: 24px 0 16px;
    font-size: 20px;
    font-weight: 700;
    color: var(--spice-text);
    border-bottom: 1px solid var(--spice-card-border);
    padding-bottom: 8px;
}
#${APP_NAME}-config-container .tab-content > h2:first-child {
    margin-top: 0;
}
#${APP_NAME}-config-container .adjust-value {
    min-width: 48px;
    text-align: center;
    font-weight: 600;
}
#${APP_NAME}-config-container .switch,
#${APP_NAME}-config-container .btn {
    height: 32px;
    min-width: 32px;
}
#${APP_NAME}-config-container .font-preview {
    background-color: var(--spice-card) !important;
    border-color: var(--spice-card-border) !important;
    padding: 24px !important;
    margin-bottom: 24px !important;
}
`
			},
		}),
		react.createElement(
			"div",
			{ className: "header" },
			react.createElement("h1", { style: { margin: 0, fontSize: "18px", fontWeight: "600" } }, "가사 플러스"),
			react.createElement(GitHubButton)
		),
		react.createElement(
			"div",
			{ className: "tabs" },
			react.createElement(TabButton, {
				id: "general",
				label: "일반",
				isActive: activeTab === "general",
				onClick: setActiveTab
			}),
			react.createElement(TabButton, {
				id: "font",
				label: "글꼴",
				isActive: activeTab === "font",
				onClick: setActiveTab
			}),
			react.createElement(TabButton, {
				id: "providers",
				label: "제공자",
				isActive: activeTab === "providers",
				onClick: setActiveTab
			}),
			react.createElement(TabButton, {
				id: "advanced",
				label: "고급",
				isActive: activeTab === "advanced",
				onClick: setActiveTab
			})
		),
		react.createElement(TabContainer, null,
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "general" ? "active" : ""}`
				},
				react.createElement("h2", null, "일반 설정"),
				react.createElement(OptionList, {
				items: [
				{
					desc: "재생바 버튼",
					key: "playbar-button",
					info: "Spotify의 가사 버튼을 Lyrics Plus로 교체합니다.",
					type: ConfigSlider,
				},
				{
					desc: "전역 지연",
					info: "모든 트랙에 적용되는 오프셋(ms)입니다.",
					key: "global-delay",
					type: ConfigAdjust,
					min: -10000,
					max: 10000,
					step: 250,
				},
				{
					desc: "정렬",
					key: "alignment",
					type: ConfigSelection,
				options: {
					left: "왼쪽",
					center: "가운데",
					right: "오른쪽",
				},
				},
				{
					desc: "전체화면 핫키",
					key: "fullscreen-key",
					type: ConfigHotkey,
				},
				{
					desc: "컴팩트 동기화: 이전 줄 수",
					key: "lines-before",
					type: ConfigSelection,
					options: [0, 1, 2, 3, 4],
				},
				{
					desc: "컴팩트 동기화: 이후 줄 수",
					key: "lines-after",
					type: ConfigSelection,
					options: [0, 1, 2, 3, 4],
				},
				{
					desc: "컴팩트 동기화: 페이드아웃 블러",
					key: "fade-blur",
					type: ConfigSlider,
				},
				{
					desc: "노이즈 오버레이",
					key: "noise",
					type: ConfigSlider,
				},
				{
					desc: "컴러풀 배경",
					key: "colorful",
					type: ConfigSlider,
				},
				{
					desc: "앨범 커버 배경",
					info: "풀스크린 모드에서는 제대로 동작하지 않습니다.",
					key: "gradient-background",
					type: ConfigSlider,
				},
				{
					desc: "배경 밝기",
					key: "background-brightness",
					type: ConfigAdjust,
					min: 0,
					max: 100,
					step: 10,
				},
				{
					desc: "메모리 캐시 삭제",
					info: "로드된 가사는 빠른 재로드를 위해 메모리에 캐시됩니다. 이 버튼을 눌러 Spotify를 다시 시작하지 않고 메모리에서 캐시된 가사를 삭제합니다.",
					key: "clear-memore-cache",
					text: "메모리 캐시 삭제",
					type: ConfigButton,
					onChange: () => {
						reloadLyrics?.();
					},
				},
				{
					desc: "업데이트 확인",
					info: `현재 버전: v${Utils.currentVersion}. 새로운 버전이 있는지 확인합니다.`,
					key: "check-update",
					text: "업데이트 확인",
					type: ConfigButton,
					onChange: async () => {
						const updateInfo = await Utils.checkForUpdates();
						if (updateInfo.hasUpdate) {
							Spicetify.showNotification(
								`업데이트 가능: v${updateInfo.latestVersion} (현재: v${updateInfo.currentVersion})`,
								false,
								5000
							);
						} else {
							Spicetify.showNotification(
								`최신 버전입니다: v${updateInfo.currentVersion}`,
								false,
								3000
							);
						}
					},
				},
			],
			onChange: (name, value) => {
				CONFIG.visual[name] = value;
				if (name === "musixmatch-translation-language") {
					// handled below
				} else if (name === "gemini-api-key") {
					// Save GEMINI API key to both Spicetify LocalStorage and regular localStorage for persistence
					try {
						Spicetify?.LocalStorage?.set(`${APP_NAME}:visual:${name}`, value);
					} catch (error) {
						console.warn(`Failed to save to Spicetify LocalStorage '${name}':`, error);
					}
					try {
						localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
					} catch (error) {
						console.warn(`Failed to save to localStorage '${name}':`, error);
					}
				} else {
					localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
				}

				// Reload Lyrics if translation language is changed
				if (name === "musixmatch-translation-language") {
					if (value === "none") {
						CONFIG.visual["translate:translated-lyrics-source"] = "none";
						localStorage.setItem(`${APP_NAME}:visual:translate:translated-lyrics-source`, "none");
					}
					reloadLyrics?.();
				} else {
					lyricContainerUpdate?.();
				}

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
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "font" ? "active" : ""}`
				},
				react.createElement("h2", null, "글꼴 설정"),
				react.createElement("div", {
					className: "font-preview",
					style: {
						padding: "20px",
						marginBottom: "20px",
						border: "1px solid rgba(255,255,255,0.1)",
						borderRadius: "8px",
						backgroundColor: "rgba(255,255,255,0.02)"
					}
				},
					react.createElement("h3", { style: { marginTop: 0, marginBottom: "10px" } }, "미리보기"),
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
							color: "rgba(255,255,255,0.8)",
							marginTop: `${parseInt(CONFIG.visual["line-spacing"]) || 8}px`,
							textShadow: CONFIG.visual["text-shadow-enabled"] ?
								`0 0 ${CONFIG.visual["text-shadow-blur"] || 2}px ${CONFIG.visual["text-shadow-color"] || "#000000"}${Math.round((CONFIG.visual["text-shadow-opacity"] || 50) * 2.55).toString(16).padStart(2, '0')}` :
								"none"
						}
					}, "Sample lyrics translation text")
				),
				react.createElement(OptionList, {
					items: [
						{
							desc: "원문 글꼴 두께",
							info: "가사 원문의 글꼴 두께를 설정합니다.",
							key: "original-font-weight",
							type: ConfigSelection,
							options: {
								"100": "얇게 (100)",
								"200": "매우 가늘게 (200)",
								"300": "가늘게 (300)",
								"400": "보통 (400)",
								"500": "중간 (500)",
								"600": "두껍게 (600)",
								"700": "굵게 (700)",
								"800": "매우 굵게 (800)",
								"900": "가장 굵게 (900)",
							},
						},
						{
							desc: "원문 글꼴 크기",
							info: "가사 원문의 글꼴 크기를 설정합니다.",
							key: "original-font-size",
							type: ConfigAdjust,
							min: 12,
							max: 128,
							step: 2,
						},
						{
							desc: "번역문 글꼴 두께",
							info: "번역된 가사의 글꼴 두께를 설정합니다.",
							key: "translation-font-weight",
							type: ConfigSelection,
							options: {
								"100": "얇게 (100)",
								"200": "매우 가늘게 (200)",
								"300": "가늘게 (300)",
								"400": "보통 (400)",
								"500": "중간 (500)",
								"600": "두껍게 (600)",
								"700": "굵게 (700)",
								"800": "매우 굵게 (800)",
								"900": "가장 굵게 (900)",
							},
						},
						{
							desc: "번역문 글꼴 크기",
							info: "번역된 가사의 글꼴 크기를 설정합니다.",
							key: "translation-font-size",
							type: ConfigAdjust,
							min: 12,
							max: 128,
							step: 2,
						},
						{
							desc: "원문 투명도",
							info: "가사 원문의 투명도를 설정합니다 (0-100%).",
							key: "original-opacity",
							type: ConfigAdjust,
							min: 0,
							max: 100,
							step: 5,
						},
						{
							desc: "번역문 투명도",
							info: "번역된 가사의 투명도를 설정합니다 (0-100%).",
							key: "translation-opacity",
							type: ConfigAdjust,
							min: 0,
							max: 100,
							step: 5,
						},
						{
							desc: "원문과 번역문 간격",
							info: "원문과 번역문 사이의 여백을 설정합니다 (픽셀).",
							key: "line-spacing",
							type: ConfigAdjust,
							min: 0,
							max: 30,
							step: 2,
						},
						{
							desc: "텍스트 그림자 활성화",
							info: "가사에 그림자 효과를 적용합니다.",
							key: "text-shadow-enabled",
							type: ConfigSlider,
						},
						{
							desc: "그림자 색상",
							info: "텍스트 그림자의 색상을 설정합니다.",
							key: "text-shadow-color",
							type: ConfigInput,
						},
						{
							desc: "그림자 투명도",
							info: "텍스트 그림자의 투명도를 설정합니다 (0-100%).",
							key: "text-shadow-opacity",
							type: ConfigAdjust,
							min: 0,
							max: 100,
							step: 5,
						},
						{
							desc: "그림자 블러",
							info: "텍스트 그림자의 블러 정도를 설정합니다.",
							key: "text-shadow-blur",
							type: ConfigAdjust,
							min: 0,
							max: 10,
							step: 1,
						},
					],
					onChange: (name, value) => {
						CONFIG.visual[name] = value;
						localStorage.setItem(`${APP_NAME}:visual:${name}`, value);

						// Update preview in real-time
						const lyricsPreview = document.getElementById("lyrics-preview");
						const translationPreview = document.getElementById("translation-preview");

						if (lyricsPreview && translationPreview) {
							if (name === "original-font-size") {
								lyricsPreview.style.fontSize = `${value}px`;
							}
							if (name === "original-font-weight") {
								lyricsPreview.style.fontWeight = value;
							}
							if (name === "translation-font-size") {
								translationPreview.style.fontSize = `${value}px`;
							}
							if (name === "translation-font-weight") {
								translationPreview.style.fontWeight = value;
							}
							if (name === "alignment") {
								lyricsPreview.style.textAlign = value;
								translationPreview.style.textAlign = value;
							}
							if (name === "original-opacity") {
								lyricsPreview.style.opacity = value / 100;
							}
							if (name === "translation-opacity") {
								translationPreview.style.opacity = value / 100;
							}
							if (name === "line-spacing") {
								translationPreview.style.marginTop = `${parseInt(value) || 0}px`;
							}
							if (name === "text-shadow-enabled" || name === "text-shadow-color" || name === "text-shadow-opacity" || name === "text-shadow-blur") {
								const shadowEnabled = CONFIG.visual["text-shadow-enabled"];
								const shadowColor = CONFIG.visual["text-shadow-color"] || "#000000";
								const shadowOpacity = CONFIG.visual["text-shadow-opacity"] || 50;
								const shadowBlur = CONFIG.visual["text-shadow-blur"] || 2;
								const shadowAlpha = Math.round(shadowOpacity * 2.55).toString(16).padStart(2, '0');
								const shadow = shadowEnabled ? `0 0 ${shadowBlur}px ${shadowColor}${shadowAlpha}` : "none";
								lyricsPreview.style.textShadow = shadow;
								translationPreview.style.textShadow = shadow;
							}
						}

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
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "providers" ? "active" : ""}`
				},
				react.createElement("h2", null, "가사 제공자"),
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
			react.createElement(
				"div",
				{
					className: `tab-content ${activeTab === "advanced" ? "active" : ""}`
				},
				react.createElement("h2", null, "고급 설정"),
				react.createElement(OptionList, {
					items: [
						{
							desc: "텍스트 변환: 일본어 감지 임계값",
							info: "가사에서 가나가 지배적인지 확인합니다. 결과가 임계값을 통과하면 일본어일 가능성이 높습니다. 이 설정은 백분율로 나타냅니다.",
							key: "ja-detect-threshold",
							type: ConfigAdjust,
							min: thresholdSizeLimit.min,
							max: thresholdSizeLimit.max,
							step: thresholdSizeLimit.step,
						},
						{
							desc: "텍스트 변환: 번체-간체 감지 임계값",
							info: "가사에서 번체 또는 간체가 지배적인지 확인합니다. 결과가 임계값을 통과하면 간체일 가능성이 높습니다. 이 설정은 백분율로 나타냅니다.",
							key: "hans-detect-threshold",
							type: ConfigAdjust,
							min: thresholdSizeLimit.min,
							max: thresholdSizeLimit.max,
							step: thresholdSizeLimit.step,
						},
						{
							desc: "Musixmatch 번역 언어",
							info: "가사를 번역할 언어를 선택하세요. 언어가 변경되면 가사가 다시 로드됩니다.",
							key: "musixmatch-translation-language",
							type: ConfigSelection,
							options: languageOptions,
						},
						{
							desc: "GEMINI API 키",
							info: "Gemini API를 사용한 가사 번역을 위한 API 키를 입력하세요.",
							key: "gemini-api-key",
							type: ConfigInput,
						},
					],
					onChange: (name, value) => {
						CONFIG.visual[name] = value;
						if (name === "musixmatch-translation-language") {
							// handled below
						} else if (name === "gemini-api-key") {
							// Save GEMINI API key to both Spicetify LocalStorage and regular localStorage for persistence
							try {
								Spicetify?.LocalStorage?.set(`${APP_NAME}:visual:${name}`, value);
							} catch (error) {
								console.warn(`Failed to save to Spicetify LocalStorage '${name}':`, error);
							}
							try {
								localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
							} catch (error) {
								console.warn(`Failed to save to localStorage '${name}':`, error);
							}
						} else {
							localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
						}

						// Reload Lyrics if translation language is changed
						if (name === "musixmatch-translation-language") {
							if (value === "none") {
								CONFIG.visual["translate:translated-lyrics-source"] = "none";
								localStorage.setItem(`${APP_NAME}:visual:translate:translated-lyrics-source`, "none");
							}
							reloadLyrics?.();
						} else {
							lyricContainerUpdate?.();
						}

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
				react.createElement("h3", { style: { marginTop: "24px", marginBottom: "10px" } }, "CORS 프록시 템플릿"),
				react.createElement("span", {
					dangerouslySetInnerHTML: {
						__html:
							"CORS 제한을 우회하는 데 사용됩니다. URL을 원하는 CORS 프록시 서버로 교체하세요. <code>{url}</code>은 요청 URL로 교체됩니다.",
					},
				}),
				react.createElement(corsProxyTemplate),
				react.createElement("span", {
					dangerouslySetInnerHTML: {
						__html: "적용 후 Spotify가 웹뷰를 다시 로드합니다. 기본값으로 복원하려면 비워두세요: <code>https://cors-proxy.spicetify.app/{url}</code>",
					},
				})
			)
		)
	);
};

function openConfig() {
	const configContainer = react.createElement(ConfigModal);

	Spicetify.PopupModal.display({
		title: "가사 플러스",
		content: configContainer,
		isLarge: true,
	});
}
