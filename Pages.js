// Optimized CreditFooter with better memoization
const CreditFooter = react.memo(({ provider, copyright }) => {
	if (provider === "local" || !provider) return null;
	
	const credit = useMemo(() => {
		const credits = [Spicetify.Locale.get("web-player.lyrics.providedBy", provider)];
		if (copyright) {
			credits.push(...copyright.split("\n"));
		}
		return credits.join(" • ");
	}, [provider, copyright]);

	return react.createElement(
		"p",
		{
			className: "lyrics-lyricsContainer-Provider main-type-mesto",
			dir: "auto",
		},
		credit
	);
});

// Optimized IdlingIndicator with memoization and performance improvements
const IdlingIndicator = react.memo(({ isActive = false, progress = 0, delay = 0 }) => {
	const className = useMemo(() => 
		`lyrics-idling-indicator ${!isActive ? "lyrics-idling-indicator-hidden" : ""} lyrics-lyricsContainer-LyricsLine lyrics-lyricsContainer-LyricsLine-active`,
		[isActive]
	);

	const style = useMemo(() => ({
		"--position-index": 0,
		"--animation-index": 1,
		"--indicator-delay": `${delay}ms`,
	}), [delay]);

	// Memoize circle states to avoid unnecessary re-renders
	const circleStates = useMemo(() => [
		progress >= 0.05 ? "active" : "",
		progress >= 0.33 ? "active" : "",
		progress >= 0.66 ? "active" : ""
	], [progress]);

	return react.createElement(
		"div",
		{ className, style },
		react.createElement("div", { className: `lyrics-idling-indicator__circle ${circleStates[0]}` }),
		react.createElement("div", { className: `lyrics-idling-indicator__circle ${circleStates[1]}` }),
		react.createElement("div", { className: `lyrics-idling-indicator__circle ${circleStates[2]}` })
	);
});

const emptyLine = {
	startTime: 0,
	endTime: 0,
	text: [],
};

// Safe text renderer that handles objects, null, and undefined
const safeRenderText = (value) => {
	if (value === null || value === undefined) return "";
	if (typeof value === "string") return value;
	if (typeof value === "object") {
		// Handle React elements
		if (value && typeof value === 'object' && value.$$typeof) {
			return value; // React element, return as-is
		}
		// Handle line objects for karaoke
		if (value.text) return value.text;
		if (value.syllables) return value;
		if (value.vocals) return value;
		// Fallback: return empty string for other objects
		return "";
	}
	return String(value);
};

// Unified function to handle lyrics display mode logic
const getLyricsDisplayMode = (isKara, line, text, originalText, text2) => {
	const displayMode = CONFIG.visual["translate:display-mode"];
	const showTranslatedBelow = displayMode === "below";
	const replaceOriginal = displayMode === "replace";

	let mainText, subText, subText2;

	if (isKara) {
		// For karaoke mode, safely handle the line object
		mainText = line; // Keep as object for KaraokeLine component
		subText = text ? safeRenderText(text) : null;
		subText2 = safeRenderText(text2);
	} else {
		// Default: show original text
		// originalText is the actual original lyrics
		// text is the first translation (can be null)
		// text2 is the second translation (can be null)
		
		if (showTranslatedBelow) {
			// Show original as main, translations below
			mainText = safeRenderText(originalText);
			subText = text ? safeRenderText(text) : null;
			subText2 = text2 ? safeRenderText(text2) : null;
		} else if (replaceOriginal && text) {
			// Replace original with translation (only if translation exists)
			mainText = safeRenderText(text);
			subText = text2 ? safeRenderText(text2) : null;
			subText2 = null;
		} else {
			// Default: just show original
			mainText = safeRenderText(originalText);
			subText = null;
			subText2 = null;
		}
	}

	return { mainText, subText, subText2 };
};

// Global animation manager to prevent multiple instances
const AnimationManager = {
	active: false,
	frameId: null,
	callbacks: new Set(),
	lastTime: 0,
	targetFPS: 60,

	start() {
		if (this.active) return;
		this.active = true;
		this.frameInterval = 1000 / this.targetFPS;
		this.animate();
	},

	stop() {
		if (this.frameId) {
			cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}
		this.active = false;
	},

	addCallback(callback) {
		this.callbacks.add(callback);
		this.start();
	},

	removeCallback(callback) {
		this.callbacks.delete(callback);
		if (this.callbacks.size === 0) {
			this.stop();
		}
	},

	animate() {
		if (!this.active) return;

		this.frameId = requestAnimationFrame((currentTime) => {
			if (currentTime - this.lastTime >= this.frameInterval) {
				this.callbacks.forEach(callback => {
					try {
						callback();
					} catch (error) {
						console.error('Error in animation callback:', error);
					}
				});
				this.lastTime = currentTime;
			}
			this.animate();
		});
	}
};

// Enhanced visibility change manager to prevent duplicate listeners
const VisibilityManager = {
	listeners: new Set(),
	isListening: false,

	addListener(callback) {
		this.listeners.add(callback);
		if (!this.isListening) {
			document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
			this.isListening = true;
		}
	},

	removeListener(callback) {
		this.listeners.delete(callback);
		if (this.listeners.size === 0 && this.isListening) {
			document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
			this.isListening = false;
		}
	},

	handleVisibilityChange() {
		const isVisible = !document.hidden;
		this.listeners.forEach(callback => {
			try {
				callback(isVisible);
			} catch (error) {
				console.error('Error in visibility callback:', error);
			}
		});
	}
};

// Expose managers globally for performance monitoring
if (typeof window !== 'undefined') {
	window.AnimationManager = AnimationManager;
	window.VisibilityManager = VisibilityManager;
}

const useTrackPosition = (callback) => {
	const callbackRef = useRef();
	const mountedRef = useRef(true);
	const isActiveRef = useRef(true);

	callbackRef.current = callback;

	useEffect(() => {
		// Component mounted
		mountedRef.current = true;
		isActiveRef.current = true;

		const wrappedCallback = () => {
			if (mountedRef.current && isActiveRef.current && callbackRef.current) {
				callbackRef.current();
			}
		};

		// Add to global animation manager
		AnimationManager.addCallback(wrappedCallback);

		// Add visibility listener
		const visibilityCallback = (isVisible) => {
			if (mountedRef.current) {
				isActiveRef.current = isVisible;
			}
		};
		VisibilityManager.addListener(visibilityCallback);

		return () => {
			// Component unmounting
			mountedRef.current = false;
			isActiveRef.current = false;
			AnimationManager.removeCallback(wrappedCallback);
			VisibilityManager.removeListener(visibilityCallback);
		};
	}, []);
};

// 새로운 가라오케 컴포넌트 - synced 모드 기반의 간단한 구조
const KaraokeLine = react.memo(({ line, position, isActive, globalCharOffset = 0, activeGlobalCharIndex = -1 }) => {
	if (!line || !line.syllables || !Array.isArray(line.syllables)) {
		return line?.text || "";
	}

	const elements = [];
	let localCharIndex = 0;

	// 전체 글자 정보를 먼저 수집
	const allChars = [];
	line.syllables.forEach((syllable, syllableIndex) => {
		if (!syllable || !syllable.text) return;

		const syllableStart = syllable.startTime || 0;
		const syllableEnd = syllable.endTime || syllableStart + 500;
		const syllableText = syllable.text || "";
		const charArray = Array.from(syllableText);

		charArray.forEach((char, charIndex) => {
			const charDuration = (syllableEnd - syllableStart) / charArray.length;
			const charStart = syllableStart + (charIndex * charDuration);
			const charEnd = charStart + charDuration;

			allChars.push({
				char,
				charStart,
				charEnd,
				syllableIndex,
				charIndex,
				localIndex: localCharIndex,
				globalIndex: globalCharOffset + localCharIndex
			});
			localCharIndex++;
		});
	});

	// 현재 활성 글자 찾기 (이 줄에서만)
	let activeLocalIndex = -1;
	if (isActive) {
		for (let i = 0; i < allChars.length; i++) {
			if (position >= allChars[i].charStart && position < allChars[i].charEnd) {
				activeLocalIndex = i;
				break;
			}
		}
	}

	// 글자들을 렌더링
	localCharIndex = 0;
	line.syllables.forEach((syllable, syllableIndex) => {
		if (!syllable || !syllable.text) return;

		const syllableText = syllable.text || "";
		const charArray = Array.from(syllableText);

		charArray.forEach((char, charIndex) => {
			const charInfo = allChars[localCharIndex];
			const isCharActive = activeLocalIndex === localCharIndex;
			const isCharSung = isActive && position > charInfo.charEnd;

			// 전체 가사에서의 글로벌 위치를 기준으로 거리 계산
			const currentGlobalIndex = charInfo.globalIndex;
			let waveOffset = 0;
			let waveScale = 1;
			let transitionDelay = 0;
			
			// 가라오케 바운스 설정 확인
			const karaokeBounceEnabled = CONFIG.visual["karaoke-bounce"];
			
			// 전체 가사의 현재 활성 글자와 비교 (바운스 효과가 활성화된 경우에만)
			if (karaokeBounceEnabled && activeGlobalCharIndex >= 0) {
				const distance = Math.abs(currentGlobalIndex - activeGlobalCharIndex);
				
				// 앞뒤 2글자까지 영향받도록 제한
				if (distance <= 2) {
					// 매우 부드러운 시간 기반 순차적 애니메이션
					transitionDelay = distance * 0.05; // 각 글자마다 50ms 딜레이
					
					// 더 부드러운 이차함수 곡선: y = -(x/2)^2 + 1
					const normalizedDistance = distance / 2;
					const waveStrength = Math.max(0, 1 - normalizedDistance * normalizedDistance);
					
					// 더 섬세한 움직임
					waveOffset = -10 * waveStrength; // 최대 -10px 위로
					waveScale = 1 + 0.12 * waveStrength; // 최대 1.12배 확대
				}
			}

			let className = "lyrics-karaoke-char";
			if (isCharActive) {
				className += " active";
			} else if (isCharSung) {
				className += " sung";
			}

			const style = (karaokeBounceEnabled && activeGlobalCharIndex >= 0) ? {
				transform: `translateY(${waveOffset}px) scale(${waveScale})`,
				// 더 부드러운 easing 함수 사용
				transition: `transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${transitionDelay}s, color 0.2s ease-out`,
				transitionDelay: `${transitionDelay}s`
			} : {
				// 바운스 비활성화 시 색상 전환만
				transition: 'color 0.2s ease-out'
			};

			elements.push(react.createElement(
				"span",
				{
					key: `${syllableIndex}-${charIndex}`,
					className,
					style
				},
				char
			));

			localCharIndex++;
		});

		// 음절 뒤에 좁은 공백 추가 (마지막 음절 제외)
		if (syllableIndex < line.syllables.length - 1) {
			// 좁은 공백 추가
			elements.push(react.createElement(
				"span",
				{
					key: `space-${syllableIndex}`,
					className: "lyrics-karaoke-space"
				},
				" "
			));
		}
	});

	return react.createElement("span", { className: "lyrics-karaoke-line" }, elements);
});

const SyncedLyricsPage = react.memo(({ lyrics = [], provider, copyright, isKara }) => {
	// 유효성 검사를 Hook 호출 전에 수행하지 않음 - Hook은 항상 같은 순서로 호출되어야 함
	const [position, setPosition] = useState(0);
	const activeLineEle = useRef();
	const lyricContainerEle = useRef();

	useTrackPosition(() => {
		const newPos = Spicetify.Player.getProgress();
		const delay = CONFIG.visual["global-delay"] + CONFIG.visual.delay;
		// Always update position for smoother karaoke animation
		setPosition(newPos + delay);
	});

	// 전체 가사의 글로벌 캐릭터 인덱스와 현재 활성 글자 계산
	const { globalCharOffsets, activeGlobalCharIndex } = useMemo(() => {
		const offsets = [];
		let totalChars = 0;
		let activeCharIndex = -1;

		for (let i = 0; i < lyrics.length; i++) {
			const line = lyrics[i];
			offsets.push(totalChars);

			if (line?.syllables && Array.isArray(line.syllables)) {
				// 이 줄이 활성 상태인지 확인
				const isLineActive = position >= (line.startTime || 0) && 
					(i === lyrics.length - 1 || position < (lyrics[i + 1]?.startTime || Infinity));

				for (const syllable of line.syllables) {
					if (!syllable || !syllable.text) continue;

					const syllableText = syllable.text || "";
					const charArray = Array.from(syllableText);
					const syllableStart = syllable.startTime || 0;
					const syllableEnd = syllable.endTime || syllableStart + 500;

					for (let charIdx = 0; charIdx < charArray.length; charIdx++) {
						const charDuration = (syllableEnd - syllableStart) / charArray.length;
						const charStart = syllableStart + (charIdx * charDuration);
						const charEnd = charStart + charDuration;

						// 현재 재생 중인 글자 찾기
						if (isLineActive && position >= charStart && position < charEnd) {
							activeCharIndex = totalChars;
						}

						totalChars++;
					}
				}
			}
		}

		return { globalCharOffsets: offsets, activeGlobalCharIndex: activeCharIndex };
	}, [lyrics, position]);

	const lyricWithEmptyLines = useMemo(
		() =>
			[emptyLine, emptyLine, ...lyrics].map((line, i) => ({
				...line,
				lineNumber: i,
			})),
		[lyrics]
	);

	const lyricsId = useMemo(() => lyrics[0]?.text || "no-lyrics", [lyrics]);

	// Optimize active line calculation with memoization
	const activeLineIndex = useMemo(() => {
		for (let i = lyricWithEmptyLines.length - 1; i > 0; i--) {
			const line = lyricWithEmptyLines[i];
			if (line && position >= (line.startTime || 0)) {
				return i;
			}
		}
		return 0;
	}, [lyricWithEmptyLines, position]);

	const activeLines = useMemo(() => {
		const startIndex = Math.max(activeLineIndex - CONFIG.visual["lines-before"], 0);
		const linesCount = CONFIG.visual["lines-before"] + CONFIG.visual["lines-after"] + 1;
		return lyricWithEmptyLines.slice(startIndex, startIndex + linesCount);
	}, [activeLineIndex, lyricWithEmptyLines]);

	// 유효성 검사는 Hook 호출 후에 수행
	if (!Array.isArray(lyrics) || lyrics.length === 0) {
		console.warn('SyncedLyricsPage: Invalid lyrics provided', { lyrics, type: typeof lyrics });
		return react.createElement(
			"div",
			{ className: "lyrics-lyricsContainer-SyncedLyricsPage" },
			react.createElement(
				"div",
				{ className: "lyrics-lyricsContainer-LyricsUnavailablePage" },
				react.createElement(
					"span",
					{ className: "lyrics-lyricsContainer-LyricsUnavailableMessage" },
					"No lyrics available"
				)
			)
		);
	}

	let offset = lyricContainerEle.current ? lyricContainerEle.current.clientHeight / 2 : 0;
	if (activeLineEle.current) {
		offset += -(activeLineEle.current.offsetTop + activeLineEle.current.clientHeight / 2);
	}

	return react.createElement(
		"div",
		{
			className: "lyrics-lyricsContainer-SyncedLyricsPage",
			ref: lyricContainerEle,
		},
		react.createElement(
			"div",
			{
				className: "lyrics-lyricsContainer-SyncedLyrics",
				style: {
					"--offset": `${offset}px`,
				},
				key: lyricsId,
			},
			...activeLines.map((line, i) => {
				const { text, lineNumber, startTime, originalText, text2 } = line;
				if (i === 1 && activeLineIndex === 1) {
					const nextLine = activeLines[2];
					const nextStartTime = nextLine?.startTime || 1;
					return react.createElement(IdlingIndicator, {
						key: `idling-indicator-${lineNumber}`,
						progress: position / nextStartTime,
						delay: nextStartTime / 3,
					});
				}

				let className = "lyrics-lyricsContainer-LyricsLine";
				const activeElementIndex = Math.min(activeLineIndex, CONFIG.visual["lines-before"]);
				let ref;

				if (i === activeElementIndex) {
					className += " lyrics-lyricsContainer-LyricsLine-active";
					ref = activeLineEle;
				}

				let animationIndex;
				if (activeLineIndex <= CONFIG.visual["lines-before"]) {
					animationIndex = i - activeLineIndex;
				} else {
					animationIndex = i - CONFIG.visual["lines-before"] - 1;
				}

				const paddingLine = (animationIndex < 0 && -animationIndex > CONFIG.visual["lines-before"]) || animationIndex > CONFIG.visual["lines-after"];
				if (paddingLine) {
					className += " lyrics-lyricsContainer-LyricsLine-paddingLine";
				}
				const isActive = i === activeElementIndex;
				const { mainText, subText, subText2 } = getLyricsDisplayMode(isKara, line, text, originalText, text2);

				if (isActive) {
					ref = activeLineEle;
				}

				return react.createElement(
					"div",
					{
						className,
						style: {
							cursor: "pointer",
							"--position-index": animationIndex,
							// Lines moving down (animationIndex > 0) should not animate transform
							"--animation-index": animationIndex > 0 ? 0 : (animationIndex < 0 ? 0 : animationIndex) + 1,
							"--blur-index": Math.abs(animationIndex),
						},
						dir: "auto",
						ref,
						key: lineNumber,
						onClick: (event) => {
							if (startTime) {
								Spicetify.Player.seek(startTime);
							}
						},
					},
					react.createElement(
						"p",
						{
							onContextMenu: (event) => {
								event.preventDefault();
								Spicetify.Platform.ClipboardAPI.copy(Utils.convertParsedToLRC(lyrics).original)
									.then(() => Spicetify.showNotification("✓ 가사가 클립보드에 복사되었습니다", false, 2000))
									.catch(() => Spicetify.showNotification("가사 클립보드 복사 실패", true, 2000));
							},
							// For Furigana/Hiragana HTML strings - React 310 방지를 위한 안전한 검증
							...(typeof mainText === "string" && !isKara && mainText ? { dangerouslySetInnerHTML: { __html: Utils.rubyTextToHTML(mainText) } } : {}),
						},
						// Safe rendering for main text
						(() => {
							if (isKara) {
								// 새로운 가라오케 모드 - 전역 글자 인덱스 전달
								const currentLineIndex = lineNumber - 2; // emptyLine 2개 제외
								const globalOffset = currentLineIndex >= 0 && currentLineIndex < globalCharOffsets.length 
									? globalCharOffsets[currentLineIndex] 
									: 0;
								
								return react.createElement(KaraokeLine, {
									line,
									position,
									isActive: i === activeElementIndex,
									globalCharOffset: globalOffset,
									activeGlobalCharIndex: activeGlobalCharIndex
								});
							} else {
								// 비카라오케 모드에서는 문자열이면 dangerouslySetInnerHTML 사용
								if (typeof mainText === "string") {
									return null; // Content will be set via dangerouslySetInnerHTML
								} else {
									// 객체인 경우 안전한 렌더링
									return safeRenderText(mainText);
								}
							}
						})()
					),
					(() => {
						if (!subText) return null;
						const props = {
							className: "lyrics-lyricsContainer-LyricsLine-sub",
							style: { "--sub-lyric-color": CONFIG.visual["inactive-color"] },
						};
						// React 310 방지: 문자열이고 빈 문자열이 아닐 때만 dangerouslySetInnerHTML 사용
						if (typeof subText === "string" && subText) {
							props.dangerouslySetInnerHTML = { __html: Utils.rubyTextToHTML(subText) };
							return react.createElement("p", props);
						}
						return react.createElement("p", props, safeRenderText(subText));
					})(),
					(() => {
						if (!subText2) return null;
						const props2 = {
							className: "lyrics-lyricsContainer-LyricsLine-sub",
							style: { "--sub-lyric-color": CONFIG.visual["inactive-color"] },
						};
						// React 310 방지: 문자열이고 빈 문자열이 아닐 때만 dangerouslySetInnerHTML 사용
						if (typeof subText2 === "string" && subText2) {
							props2.dangerouslySetInnerHTML = { __html: Utils.rubyTextToHTML(subText2) };
							return react.createElement("p", props2);
						}
						return react.createElement("p", props2, safeRenderText(subText2));
					})()
				);
			})
		),
		react.createElement(CreditFooter, {
			provider,
			copyright,
		})
	);
});

// Global SearchBar manager to prevent duplicate instances
const SearchBarManager = {
	instance: null,
	bindings: new Set(),

	register(instance) {
		// Clean up previous instance
		if (this.instance) {
			this.cleanup();
		}
		this.instance = instance;
	},

	unregister(instance) {
		if (this.instance === instance) {
			this.cleanup();
			this.instance = null;
		}
	},

	bind(key, callback) {
		const bindingKey = `${key}-${callback.name}`;
		if (this.bindings.has(bindingKey)) {
			return; // Already bound
		}
		Spicetify.Mousetrap().bind(key, callback);
		this.bindings.add(bindingKey);
	},

	bindToContainer(container, key, callback) {
		const bindingKey = `container-${key}-${callback.name}`;
		if (this.bindings.has(bindingKey)) {
			return; // Already bound
		}
		Spicetify.Mousetrap(container).bind(key, callback);
		this.bindings.add(bindingKey);
	},

	cleanup() {
		this.bindings.forEach(bindingKey => {
			const [type, key] = bindingKey.split('-');
			if (type === 'container' && this.instance?.container) {
				try {
					Spicetify.Mousetrap(this.instance.container).unbind(key);
				} catch (e) {
					// Container might be null
				}
			} else {
				try {
					Spicetify.Mousetrap().unbind(key);
				} catch (e) {
					// Mousetrap might not be available
				}
			}
		});
		this.bindings.clear();
	}
};

class SearchBar extends react.Component {
	constructor() {
		super();
		this.state = {
			hidden: true,
			atNode: 0,
			foundNodes: [],
		};
		this.container = null;
		this.instanceId = `searchbar-${Date.now()}-${Math.random()}`;
	}

	componentDidMount() {
		// Register with global manager
		SearchBarManager.register(this);

		this.viewPort = document.querySelector(".main-view-container .os-viewport");
		this.mainViewOffsetTop = document.querySelector(".Root__main-view")?.offsetTop || 0;
		
		this.toggleCallback = () => {
			if (!(Spicetify.Platform.History.location.pathname === "/lyrics-plus" && this.container)) return;

			if (this.state.hidden) {
				this.setState({ hidden: false });
				this.container.focus();
			} else {
				this.setState({ hidden: true });
				this.container.blur();
			}
		};
		this.unFocusCallback = () => {
			if (this.container) {
				this.container.blur();
				this.setState({ hidden: true });
			}
		};
		this.loopThroughCallback = (event) => {
			if (!this.state.foundNodes.length) {
				return;
			}

			if (event.key === "Enter") {
				const dir = event.shiftKey ? -1 : 1;
				let atNode = this.state.atNode + dir;
				if (atNode < 0) {
					atNode = this.state.foundNodes.length - 1;
				}
				atNode %= this.state.foundNodes.length;
				const rects = this.state.foundNodes[atNode].getBoundingClientRect();
				if (this.viewPort) {
					this.viewPort.scrollBy(0, rects.y - 100);
				}
				this.setState({ atNode });
			}
		};

		// Use SearchBarManager to prevent duplicate bindings
		SearchBarManager.bind("mod+shift+f", this.toggleCallback);
		if (this.container) {
			SearchBarManager.bindToContainer(this.container, "mod+shift+f", this.toggleCallback);
			SearchBarManager.bindToContainer(this.container, "enter", this.loopThroughCallback);
			SearchBarManager.bindToContainer(this.container, "shift+enter", this.loopThroughCallback);
			SearchBarManager.bindToContainer(this.container, "esc", this.unFocusCallback);
		}
	}

	componentWillUnmount() {
		// Unregister from global manager
		SearchBarManager.unregister(this);
	}

	getNodeFromInput(event) {
		const value = event.target.value.toLowerCase();
		if (!value) {
			this.setState({ foundNodes: [] });
			this.viewPort.scrollTo(0, 0);
			return;
		}

		const lyricsPage = document.querySelector(".lyrics-lyricsContainer-UnsyncedLyricsPage");
		const walker = document.createTreeWalker(
			lyricsPage,
			NodeFilter.SHOW_TEXT,
			(node) => {
				if (node.textContent.toLowerCase().includes(value)) {
					return NodeFilter.FILTER_ACCEPT;
				}
				return NodeFilter.FILTER_REJECT;
			},
			false
		);

		const foundNodes = [];
		while (walker.nextNode()) {
			const range = document.createRange();
			range.selectNodeContents(walker.currentNode);
			foundNodes.push(range);
		}

		if (!foundNodes.length) {
			this.viewPort.scrollBy(0, 0);
		} else {
			const rects = foundNodes[0].getBoundingClientRect();
			this.viewPort.scrollBy(0, rects.y - 100);
		}

		this.setState({ foundNodes, atNode: 0 });
	}

	render() {
		let y = 0;
		let height = 0;
		if (this.state.foundNodes.length) {
			const node = this.state.foundNodes[this.state.atNode];
			const rects = node.getBoundingClientRect();
			y = rects.y + this.viewPort.scrollTop - this.mainViewOffsetTop;
			height = rects.height;
		}
		return react.createElement(
			"div",
			{
				className: `lyrics-Searchbar${this.state.hidden ? " hidden" : ""}`,
			},
			react.createElement("input", {
				ref: (c) => {
					this.container = c;
				},
				onChange: this.getNodeFromInput.bind(this),
			}),
			react.createElement("svg", {
				width: 16,
				height: 16,
				viewBox: "0 0 16 16",
				fill: "currentColor",
				dangerouslySetInnerHTML: {
					__html: Spicetify.SVGIcons.search,
				},
			}),
			react.createElement(
				"span",
				{
					hidden: this.state.foundNodes.length === 0,
				},
				`${this.state.atNode + 1}/${this.state.foundNodes.length}`
			),
			react.createElement("div", {
				className: "lyrics-Searchbar-highlight",
				style: {
					"--search-highlight-top": `${y}px`,
					"--search-highlight-height": `${height}px`,
				},
			})
		);
	}
}

function isInViewport(element) {
	const rect = element.getBoundingClientRect();
	return (
		rect.top >= 0 &&
		rect.left >= 0 &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	);
}

const SyncedExpandedLyricsPage = react.memo(({ lyrics = [], provider, copyright, isKara }) => {
	// Hook은 항상 먼저 호출되어야 함 - React 130 방지
	const [position, setPosition] = useState(0);
	const activeLineRef = useRef(null);
	const pageRef = useRef(null);

	useTrackPosition(() => {
		const newPos = Spicetify.Player.getProgress();
		const delay = CONFIG.visual["global-delay"] + CONFIG.visual.delay;
		// Always update position for smoother karaoke animation
		setPosition(newPos + delay);
	});

	const padded = useMemo(() => [emptyLine, ...lyrics], [lyrics]);

	const intialScroll = useMemo(() => [false], [lyrics]);

	const lyricsId = useMemo(() => lyrics[0]?.text || "no-lyrics", [lyrics]);

	// Optimize active line calculation with memoization
	const activeLineIndex = useMemo(() => {
		for (let i = padded.length - 1; i >= 0; i--) {
			const line = padded[i];
			if (line && position >= (line.startTime || 0)) {
				return i;
			}
		}
		return 0;
	}, [padded, position]);

	useEffect(() => {
		if (activeLineRef.current && (!intialScroll[0] || isInViewport(activeLineRef.current))) {
			activeLineRef.current.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "nearest",
			});
			intialScroll[0] = true;
		}
	}, [activeLineRef.current]);

	// 유효성 검사는 Hook 호출 후에 수행
	if (!Array.isArray(lyrics) || lyrics.length === 0) {
		console.warn('SyncedExpandedLyricsPage: Invalid lyrics provided', { lyrics, type: typeof lyrics });
		return react.createElement(
			"div",
			{ className: "lyrics-lyricsContainer-UnsyncedLyricsPage" },
			react.createElement(
				"div",
				{ className: "lyrics-lyricsContainer-LyricsUnavailablePage" },
				react.createElement(
					"span",
					{ className: "lyrics-lyricsContainer-LyricsUnavailableMessage" },
					"No lyrics available"
				)
			)
		);
	}

	return react.createElement(
		"div",
		{
			className: "lyrics-lyricsContainer-UnsyncedLyricsPage",
			key: lyricsId,
			ref: pageRef,
		},
		react.createElement("p", {
			className: "lyrics-lyricsContainer-LyricsUnsyncedPadding",
		}),
		padded.map(({ text, startTime, originalText, text2 }, i) => {
				if (i === 0) {
					const nextLine = padded[1];
					const nextStartTime = nextLine?.startTime || 1;
					return react.createElement(IdlingIndicator, {
						key: `expanded-idling-${i}`,
						isActive: activeLineIndex === 0,
						progress: position / nextStartTime,
						delay: nextStartTime / 3,
					});
				}

			const isActive = i === activeLineIndex;
			const { mainText, subText, subText2 } = getLyricsDisplayMode(false, null, text, originalText, text2);

			let ref;
			if (isActive) {
				ref = activeLineRef;
			}

			let animationIndex;
			if (activeLineIndex <= CONFIG.visual["lines-before"]) {
				animationIndex = i - activeLineIndex;
			} else {
				animationIndex = i - CONFIG.visual["lines-before"] - 1;
			}

			let className = "lyrics-lyricsContainer-LyricsLine";
			if (isActive) {
				className += " lyrics-lyricsContainer-LyricsLine-active";
			}

			const paddingLine = (animationIndex < 0 && -animationIndex > CONFIG.visual["lines-before"]) || animationIndex > CONFIG.visual["lines-after"];
			if (paddingLine) {
				className += " lyrics-lyricsContainer-LyricsLine-paddingLine";
			}

			return react.createElement(
				"div",
				{
					className,
					style: {
						cursor: "pointer",
						"--position-index": animationIndex,
						// Lines moving down (animationIndex > 0) should not animate transform
						"--animation-index": animationIndex > 0 ? 0 : (animationIndex < 0 ? 0 : animationIndex) + 1,
						"--blur-index": Math.abs(animationIndex),
					},
					dir: "auto",
					ref,
					key: i,
					onClick: (event) => {
						if (startTime) {
							Spicetify.Player.seek(startTime);
						}
					},
				},
				react.createElement(
					"p",
					{
						onContextMenu: (event) => {
							event.preventDefault();
							Spicetify.Platform.ClipboardAPI.copy(Utils.convertParsedToLRC(lyrics).original)
								.then(() => Spicetify.showNotification("✓ 가사가 클립보드에 복사되었습니다", false, 2000))
								.catch(() => Spicetify.showNotification("가사 클립보드 복사 실패", true, 2000));
						},
						// For Furigana/Hiragana HTML strings - React 310 방지
						...(typeof mainText === "string" && !isKara && mainText ? { dangerouslySetInnerHTML: { __html: Utils.rubyTextToHTML(mainText) } } : {}),
					},
					// Safe rendering for main text
					(() => {
						if (isKara) {
							// 카라오케 모드에서는 KaraokeLine 컴포넌트 사용
							return react.createElement(KaraokeLine, {
								text: mainText,
								startTime,
								position,
								isActive
							});
						} else {
							// 비카라오케 모드에서는 문자열이면 dangerouslySetInnerHTML 사용
							if (typeof mainText === "string") {
								return null; // Content will be set via dangerouslySetInnerHTML
							} else {
								// 객체인 경우 안전한 렌더링
								return safeRenderText(mainText);
							}
						}
					})()
				),
				// React 310 방지: subText가 문자열이고 비어있지 않을 때만 렌더링
				subText && typeof subText === "string" && subText && react.createElement("p", {
					className: "lyrics-lyricsContainer-LyricsLine-sub",
					style: {
						"--sub-lyric-color": CONFIG.visual["inactive-color"],
					},
					dangerouslySetInnerHTML: {
						__html: Utils.rubyTextToHTML(subText),
					},
				}),
				// React 310 방지: subText2가 문자열이고 비어있지 않을 때만 렌더링
				subText2 && typeof subText2 === "string" && subText2 && react.createElement("p", {
					className: "lyrics-lyricsContainer-LyricsLine-sub",
					style: {
						"--sub-lyric-color": CONFIG.visual["inactive-color"],
					},
					dangerouslySetInnerHTML: {
						__html: Utils.rubyTextToHTML(subText2),
					},
				})
			);
		}),
		react.createElement("p", {
			className: "lyrics-lyricsContainer-LyricsUnsyncedPadding",
		}),
		react.createElement(CreditFooter, {
			provider,
			copyright,
		}),
		react.createElement(SearchBar, null)
	);
});

const UnsyncedLyricsPage = react.memo(({ lyrics = [], provider, copyright }) => {
	// Hook은 항상 같은 순서로 호출되어야 함 - React 130 방지
	const lyricsArray = useMemo(() => {
		// React 31 방지: 안전한 배열 변환 및 유효성 검사
		if (!lyrics) {
			console.warn('UnsyncedLyricsPage: No lyrics provided');
			return [];
		}
		if (Array.isArray(lyrics)) {
			// 배열의 각 요소가 유효한지 확인
			return lyrics.filter(item => item !== null && item !== undefined);
		}
		if (typeof lyrics === "string") {
			return lyrics.split("\n").map((text, index) => ({ text, index }));
		}
		// 비어있거나 잘못된 데이터인 경우 빈 배열 반환
		console.warn('UnsyncedLyricsPage: Invalid lyrics provided', { lyrics, type: typeof lyrics });
		return [];
	}, [lyrics]);

	// 유효성 검사는 Hook 호출 후에 수행
	if (lyricsArray.length === 0) {
		return react.createElement(
			"div",
			{ className: "lyrics-lyricsContainer-UnsyncedLyricsPage" },
			react.createElement(
				"div",
				{ className: "lyrics-lyricsContainer-LyricsUnavailablePage" },
				react.createElement(
					"span",
					{ className: "lyrics-lyricsContainer-LyricsUnavailableMessage" },
					"사용 가능한 가사가 없음"
				)
			)
		);
	}

	return react.createElement(
		"div",
		{
			className: "lyrics-lyricsContainer-UnsyncedLyricsPage",
		},
		react.createElement("p", {
			className: "lyrics-lyricsContainer-LyricsUnsyncedPadding",
		}),
		...lyricsArray.map(({ text, originalText, text2 }, index) => {
			const { mainText: lineText, subText, subText2: showMode2Translation } = getLyricsDisplayMode(false, null, text, originalText, text2);

			// Convert lyrics to text for comparison
			const belowOrigin = (typeof originalText === "object" ? originalText?.props?.children?.[0] : originalText)?.replace(/\s+/g, "");
			const belowTxt = (typeof text === "object" ? text?.props?.children?.[0] : text)?.replace(/\s+/g, "");

			// Show sub-lines in "below" mode or when we have Mode 2 translation in either mode
			const displayMode = CONFIG.visual["translate:display-mode"];
			const showTranslatedBelow = displayMode === "below";
			const replaceOriginal = displayMode === "replace";
			const belowMode = showTranslatedBelow && originalText && belowOrigin !== belowTxt;
			const showMode2 = !!showMode2Translation && (showTranslatedBelow || replaceOriginal);

			return react.createElement(
				"div",
				{
					className: "lyrics-lyricsContainer-LyricsLine lyrics-lyricsContainer-LyricsLine-active",
					key: index,
					dir: "auto",
				},
				react.createElement(
					"p",
					{
						onContextMenu: (event) => {
							event.preventDefault();
							Spicetify.Platform.ClipboardAPI.copy(Utils.convertParsedToUnsynced(lyrics, belowMode).original)
								.then(() => Spicetify.showNotification("✓ 가사가 클립보드에 복사되었습니다", false, 2000))
								.catch(() => Spicetify.showNotification("가사 클립보드 복사 실패", true, 2000));
						},
						// React 310 방지: 문자열이고 비어있지 않을 때만 dangerouslySetInnerHTML 사용
						...(typeof lineText === "string" && lineText
							? { dangerouslySetInnerHTML: { __html: Utils.rubyTextToHTML(lineText) } }
							: {}),
					},
					typeof lineText === "string" ? null : lineText
				),
				belowMode &&
					react.createElement(
						"p",
						{
							style: { opacity: 0.5 },
							onContextMenu: (event) => {
								event.preventDefault();
								Spicetify.Platform.ClipboardAPI.copy(Utils.convertParsedToUnsynced(lyrics, belowMode).conver)
									.then(() => Spicetify.showNotification("✓ Translation copied to clipboard", false, 2000))
									.catch(() => Spicetify.showNotification("번역 클립보드 복사 실패", true, 2000));
							},
							// React 310 방지: 문자열이고 비어있지 않을 때만 dangerouslySetInnerHTML 사용
							...(typeof subText === "string" && subText
								? { dangerouslySetInnerHTML: { __html: Utils.rubyTextToHTML(subText) } }
								: {}),
						},
						typeof subText === "string" ? null : subText
					),
				showMode2 &&
					react.createElement(
						"p",
						{
							style: { opacity: 0.5 },
							onContextMenu: (event) => {
								event.preventDefault();
								Spicetify.Platform.ClipboardAPI.copy(showMode2Translation)
									.then(() => Spicetify.showNotification("✓ Second translation copied to clipboard", false, 2000))
									.catch(() => Spicetify.showNotification("두 번째 번역 클립보드 복사 실패", true, 2000));
							},
							// React 310 방지: 문자열이고 비어있지 않을 때만 dangerouslySetInnerHTML 사용
							...(typeof showMode2Translation === "string" && showMode2Translation
								? { dangerouslySetInnerHTML: { __html: Utils.rubyTextToHTML(showMode2Translation) } }
								: {}),
						},
						typeof showMode2Translation === "string" ? null : showMode2Translation
					)
			);
		}),
		react.createElement("p", {
			className: "lyrics-lyricsContainer-LyricsUnsyncedPadding",
		}),

		react.createElement(CreditFooter, {
			provider,
			copyright,
		}),
		react.createElement(SearchBar, null)
	);
});




const LoadingIcon = react.createElement(
	"svg",
	{
		width: "200px",
		height: "200px",
		viewBox: "0 0 100 100",
		preserveAspectRatio: "xMidYMid",
	},
	react.createElement(
		"circle",
		{
			cx: "50",
			cy: "50",
			r: "0",
			fill: "none",
			stroke: "currentColor",
			"stroke-width": "2",
		},
		react.createElement("animate", {
			attributeName: "r",
			repeatCount: "indefinite",
			dur: "1s",
			values: "0;40",
			keyTimes: "0;1",
			keySplines: "0 0.2 0.8 1",
			calcMode: "spline",
			begin: "0s",
		}),
		react.createElement("animate", {
			attributeName: "opacity",
			repeatCount: "indefinite",
			dur: "1s",
			values: "1;0",
			keyTimes: "0;1",
			keySplines: "0.2 0 0.8 1",
			calcMode: "spline",
			begin: "0s",
		})
	),
	react.createElement(
		"circle",
		{
			cx: "50",
			cy: "50",
			r: "0",
			fill: "none",
			stroke: "currentColor",
			"stroke-width": "2",
		},
		react.createElement("animate", {
			attributeName: "r",
			repeatCount: "indefinite",
			dur: "1s",
			values: "0;40",
			keyTimes: "0;1",
			keySplines: "0 0.2 0.8 1",
			calcMode: "spline",
			begin: "-0.5s",
		}),
		react.createElement("animate", {
			attributeName: "opacity",
			repeatCount: "indefinite",
			dur: "1s",
			values: "1;0",
			keyTimes: "0;1",
			keySplines: "0.2 0 0.8 1",
			calcMode: "spline",
			begin: "-0.5s",
		})
	)
);


const LyricsPage = ({ lyricsContainer }) => {
	const modes = CONFIG.modes;
	const activeMode = lyricsContainer.getCurrentMode();
	const lockMode = CONFIG.locked;

	return react.createElement(
		react.Fragment,
		null,
		react.createElement(TopBarContent, {
			links: modes,
			activeLink: modes[activeMode] || modes[0],
			lockLink: lockMode !== -1 ? modes[lockMode] : null,
			switchCallback: (mode) => {
				const modeIndex = modes.indexOf(mode);
				if (modeIndex !== -1) {
					lyricsContainer.switchTo(modeIndex);
				}
			},
			lockCallback: (mode) => {
				const modeIndex = modes.indexOf(mode);
				if (modeIndex !== -1) {
					lyricsContainer.lockIn(modeIndex);
				}
			}
		}),
		lyricsContainer.render()
	);
};
