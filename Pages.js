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

const useTrackPosition = (callback) => {
	const callbackRef = useRef();
	callbackRef.current = callback;

	useEffect(() => {
		const interval = setInterval(() => {
			if (callbackRef.current) {
				callbackRef.current();
			}
		}, 16); // ~60fps for smoother karaoke animation

		return () => {
			clearInterval(interval);
		};
	}, []); // Empty dependency array since we use ref for callback
};

const KaraokeLine = react.memo(({ text, isActive, position, startTime }) => {
	// Stabilize position to reduce unnecessary re-renders - handle edge cases
	const stablePosition = useMemo(() => {
		if (typeof position !== 'number' || isNaN(position)) return 0;
		return Math.floor(position / 16) * 16;
	}, [position]);

	// Early return for invalid inputs
	if (!text) {
		return "";
	}

	// Handle ivLyrics word_by_word format with syllables
	// Check if this is the ivLyrics format (has syllables or vocals property)
	if (text && typeof text === 'object') {
		const lineStartTime = text.startTime || startTime || 0;

		// Check if this has multiple vocals (lead + background)
		if (text.vocals && text.vocals.lead && text.vocals.lead.syllables) {
			if (!isActive) {
				const leadText = text.vocals.lead.syllables.map(s => s.text || "").join("");
				const backgroundTexts = (text.vocals.background || [])
					.filter(bg => bg && bg.syllables)
					.map(bg => bg.syllables.map(s => s.text || "").join(""));
				return leadText + (backgroundTexts.length > 0 ? " (" + backgroundTexts.join(", ") + ")" : "");
			}

			const renderVocalTrack = (vocal, isBackground = false) => {
				if (!vocal || !vocal.syllables || !Array.isArray(vocal.syllables)) {
					return react.createElement(react.Fragment, null);
				}
				const syllableElements = vocal.syllables.map((syllable, index) => {
					const syllableStart = syllable.startTime || 0;
					const syllableEnd = syllable.endTime || (syllableStart + 500);
					const syllableDuration = syllableEnd - syllableStart;
					const syllableText = syllable.text || "";

					let syllableState = 'inactive';
					const minThreshold = Math.max(lineStartTime + 100, 100);
					const adjustedSyllableStart = Math.max(syllableStart, minThreshold);

					const isWordActive = isActive && stablePosition >= adjustedSyllableStart && stablePosition <= syllableEnd;
					const isSyllableCompleted = isActive && stablePosition > syllableEnd;
					const isEmphasized = syllableDuration >= 1000 && syllableText.length <= 12;

					// If syllable is not active and not completed, return simple text
					if (!isWordActive && !isSyllableCompleted) {
						return react.createElement(
							"span",
							{
								key: `${isBackground ? 'bg' : 'lead'}-${index}`,
								className: `lyrics-lyricsContainer-Karaoke-Syllable${isBackground ? " lyrics-lyricsContainer-Karaoke-Background" : ""}${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
							},
							syllableText
						);
					}

					// If syllable is completed, show all characters as fully sung
					if (isSyllableCompleted) {
						const characters = Array.from(syllableText || "");
						if (characters.length === 0) {
							return react.createElement(
								"span",
								{
									key: `${isBackground ? 'bg' : 'lead'}-${index}`,
									className: `lyrics-lyricsContainer-Karaoke-Syllable${isBackground ? " lyrics-lyricsContainer-Karaoke-Background" : ""} lyrics-lyricsContainer-Karaoke-SyllableActive${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
								},
								syllableText
							);
						}

						const characterElements = characters.map((char, charIndex) => {
							// All characters are fully sung - keep them white without glow
							const charStyleProps = {
								"--gradient-progress": "100%",
								"--text-shadow-opacity": "0%",
								"--text-shadow-blur-radius": "0px",
								transform: "translateY(0) scale(1)",
								transformOrigin: "center center",
								transition: "all 0.4s ease-out"
							};

							return react.createElement(
								"span",
								{
									key: `completed-char-${index}-${charIndex}`,
									className: "lyrics-lyricsContainer-Karaoke-Character lyrics-lyricsContainer-Karaoke-CharacterActive",
									style: charStyleProps,
								},
								char
							);
						});

						return react.createElement(
							"span",
							{
								key: `${isBackground ? 'bg' : 'lead'}-${index}`,
								className: `lyrics-lyricsContainer-Karaoke-Syllable${isBackground ? " lyrics-lyricsContainer-Karaoke-Background" : ""} lyrics-lyricsContainer-Karaoke-SyllableActive${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
							},
							...characterElements
						);
					}

					// Calculate progress within syllable for character-by-character animation
					const syllableProgress = (stablePosition - adjustedSyllableStart) / (syllableEnd - adjustedSyllableStart);
					const clampedProgress = Math.min(1, Math.max(0, syllableProgress));

					// Split text into individual characters for animation
					const characters = Array.from(syllableText || "");

					// Safety check for empty text
					if (characters.length === 0 || !syllableText) {
						return react.createElement(
							"span",
							{
								key: `${isBackground ? 'bg' : 'lead'}-${index}`,
								className: `lyrics-lyricsContainer-Karaoke-Syllable${isBackground ? " lyrics-lyricsContainer-Karaoke-Background" : ""} lyrics-lyricsContainer-Karaoke-SyllableActive${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
							},
							syllableText
						);
					}

					const characterElements = characters.map((char, charIndex) => {
						// Calculate per-character timing with overlap for smoother flow
						const overlap = 0.3; // 30% overlap between characters
						const charDuration = (1 + overlap) / characters.length;
						const charStartProgress = (charIndex * charDuration) - (overlap * charIndex / characters.length);
						const charEndProgress = charStartProgress + charDuration;

						// Clamp to valid range
						const clampedCharStart = Math.max(0, charStartProgress);
						const clampedCharEnd = Math.min(1, charEndProgress);

						// Determine if this character is active
						let charTimeScale = 0;
						let charGlowTimeScale = 0;

						if (clampedProgress > clampedCharStart) {
							if (clampedProgress >= clampedCharEnd) {
								// Character is fully sung - keep it visible and active
								charTimeScale = 1;
								charGlowTimeScale = 0; // No glow effect
							} else {
								// Character is currently active
								const charProgress = (clampedProgress - clampedCharStart) / (clampedCharEnd - clampedCharStart);
								charTimeScale = Math.min(1, Math.max(0, charProgress));
								charGlowTimeScale = 0; // No glow effect
							}
						}

						// Beautiful-lyrics gradient formula: -20 + (120 * timeScale)
						const gradientProgress = -20 + (120 * charTimeScale);

						// Beautiful-lyrics inspired character scaling when gradient line passes
						let scaleValue = 1.0;
						let yOffset = 0;

						if (charTimeScale > 0 && charTimeScale <= 1) {
							// Character scaling based on gradient progress (0-100%)
							const gradientPos = gradientProgress + 20; // Adjust for gradient start

							// Scale up when gradient is approaching/passing (beautiful-lyrics style)
							if (gradientPos >= 0 && gradientPos <= 120) {
								const scaleProgress = Math.min(1, gradientPos / 100);
								// Peak scale at 50% gradient progress, then ease back
								const scaleFactor = scaleProgress <= 0.5
									? scaleProgress * 2 // Rise to peak
									: 2 - (scaleProgress * 2); // Fall from peak

								scaleValue = 1.0 + (0.08 * scaleFactor); // More pronounced scaling

								// Subtle vertical movement
								yOffset = -(scaleFactor * 0.02);
							}
						}

						const isCharActive = charTimeScale > 0;

						// Style properties for individual character
						const charStyleProps = {
							"--gradient-progress": `${gradientProgress}%`,
							"--text-shadow-opacity": `${charGlowTimeScale * (isEmphasized ? 100 : 35)}%`,
							"--text-shadow-blur-radius": `${4 + (2 * charGlowTimeScale * (isEmphasized ? 3 : 1))}px`,
							transform: `translateY(calc(var(--lyrics-font-size) * ${yOffset * (isEmphasized ? 2 : 1)})) scale(${scaleValue})`,
							transformOrigin: "center center",
							transition: isCharActive ?
								"transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)" :
								"all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)"
						};

						return react.createElement(
							"span",
							{
								key: `active-char-${index}-${charIndex}`,
								className: `lyrics-lyricsContainer-Karaoke-Character${isCharActive ? " lyrics-lyricsContainer-Karaoke-CharacterActive" : ""}`,
								style: charStyleProps,
							},
							char
						);
					});

					return react.createElement(
						"span",
						{
							key: `${isBackground ? 'bg' : 'lead'}-${index}`,
							className: `lyrics-lyricsContainer-Karaoke-Syllable${isBackground ? " lyrics-lyricsContainer-Karaoke-Background" : ""} lyrics-lyricsContainer-Karaoke-SyllableActive${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
						},
						...characterElements
					);
				});
				return react.createElement(react.Fragment, null, ...syllableElements);
			};

			return react.createElement(
				"div",
				{ className: "lyrics-lyricsContainer-Karaoke-MultiVocal" },
				react.createElement(
					"div",
					{ className: "lyrics-lyricsContainer-Karaoke-Lead" },
					renderVocalTrack(text.vocals.lead)
				),
				...((text.vocals.background || []).filter(bg => bg && bg.syllables).map((bgVocal, bgIndex) =>
					react.createElement(
						"div",
						{
							key: `bg-track-${bgIndex}`,
							className: "lyrics-lyricsContainer-Karaoke-BackgroundTrack"
						},
						renderVocalTrack(bgVocal, true)
					)
				))
			);
		}

		// Single vocal track (original format)
		if (text.syllables && Array.isArray(text.syllables)) {
			const lineSyllables = text.syllables.filter(s => s && typeof s === 'object');

			if (!isActive) {
				return lineSyllables.map(syllable => syllable.text || "").join("");
			}

			if (lineSyllables.length === 0) {
				return text.text || "";
			}

			const syllableElements = lineSyllables.map((syllable, index) => {
				const syllableStart = syllable.startTime || 0;
				const syllableEnd = syllable.endTime || (syllableStart + 500);
				const syllableDuration = syllableEnd - syllableStart;
				const syllableText = syllable.text || "";

				let syllableState = 'inactive';
				const minThreshold = Math.max(lineStartTime + 100, 100);
				const adjustedSyllableStart = Math.max(syllableStart, minThreshold);

				const isWordActive = isActive && stablePosition >= adjustedSyllableStart && stablePosition <= syllableEnd;
				const isSyllableCompleted = isActive && stablePosition > syllableEnd;
				const isEmphasized = syllableDuration >= 1000 && syllableText.length <= 12;

				// If syllable is not active and not completed, return simple text
				if (!isWordActive && !isSyllableCompleted) {
					return react.createElement(
						"span",
						{
							key: index,
							className: `lyrics-lyricsContainer-Karaoke-Syllable${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
						},
						syllableText
					);
				}

				// If syllable is completed, show all characters as fully sung
				if (isSyllableCompleted) {
					const characters = Array.from(syllableText || "");
					if (characters.length === 0) {
						return react.createElement(
							"span",
							{
								key: index,
								className: `lyrics-lyricsContainer-Karaoke-Syllable lyrics-lyricsContainer-Karaoke-SyllableActive${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
							},
							syllableText
						);
					}

					const characterElements = characters.map((char, charIndex) => {
						// All characters are fully sung - keep them white without glow
						const charStyleProps = {
							"--gradient-progress": "100%",
							"--text-shadow-opacity": "0%",
							"--text-shadow-blur-radius": "0px",
							transform: "translateY(0) scale(1)",
							transformOrigin: "center center",
							transition: "all 0.4s ease-out"
						};

						return react.createElement(
							"span",
							{
								key: `single-completed-char-${index}-${charIndex}`,
								className: "lyrics-lyricsContainer-Karaoke-Character lyrics-lyricsContainer-Karaoke-CharacterActive",
								style: charStyleProps,
							},
							char
						);
					});

					return react.createElement(
						"span",
						{
							key: index,
							className: `lyrics-lyricsContainer-Karaoke-Syllable lyrics-lyricsContainer-Karaoke-SyllableActive${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
						},
						...characterElements
					);
				}

				// Calculate progress within syllable for character-by-character animation
				const syllableProgress = (stablePosition - adjustedSyllableStart) / (syllableEnd - adjustedSyllableStart);
				const clampedProgress = Math.min(1, Math.max(0, syllableProgress));

				// Split text into individual characters for animation
				const characters = Array.from(syllableText || "");

				// Safety check for empty text
				if (characters.length === 0) {
					return react.createElement(
						"span",
						{
							key: `${isBackground ? 'bg' : 'lead'}-${index}`,
							className: `lyrics-lyricsContainer-Karaoke-Syllable${isBackground ? " lyrics-lyricsContainer-Karaoke-Background" : ""} lyrics-lyricsContainer-Karaoke-SyllableActive${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
						},
						syllableText
					);
				}

				const characterElements = characters.map((char, charIndex) => {
					// Calculate per-character timing with overlap for smoother flow
					const overlap = 0.3; // 30% overlap between characters
					const charDuration = (1 + overlap) / characters.length;
					const charStartProgress = (charIndex * charDuration) - (overlap * charIndex / characters.length);
					const charEndProgress = charStartProgress + charDuration;

					// Clamp to valid range
					const clampedCharStart = Math.max(0, charStartProgress);
					const clampedCharEnd = Math.min(1, charEndProgress);

					// Determine if this character is active
					let charTimeScale = 0;
					let charGlowTimeScale = 0;

					if (clampedProgress > clampedCharStart) {
						if (clampedProgress >= clampedCharEnd) {
							// Character is fully sung - keep it visible and active
							charTimeScale = 1;
							charGlowTimeScale = 0; // No glow effect
						} else {
							// Character is currently active
							const charProgress = (clampedProgress - clampedCharStart) / (clampedCharEnd - clampedCharStart);
							charTimeScale = Math.min(1, Math.max(0, charProgress));
							charGlowTimeScale = 0; // No glow effect
						}
					}

					// Beautiful-lyrics gradient formula: -20 + (120 * timeScale)
					const gradientProgress = -20 + (120 * charTimeScale);

					// Beautiful-lyrics inspired character scaling when gradient line passes
					let scaleValue = 1.0;
					let yOffset = 0;

					if (charTimeScale > 0 && charTimeScale <= 1) {
						// Character scaling based on gradient progress (0-100%)
						const gradientPos = gradientProgress + 20; // Adjust for gradient start

						// Scale up when gradient is approaching/passing (beautiful-lyrics style)
						if (gradientPos >= 0 && gradientPos <= 120) {
							const scaleProgress = Math.min(1, gradientPos / 100);
							// Peak scale at 50% gradient progress, then ease back
							const scaleFactor = scaleProgress <= 0.5
								? scaleProgress * 2 // Rise to peak
								: 2 - (scaleProgress * 2); // Fall from peak

							scaleValue = 1.0 + (0.08 * scaleFactor); // More pronounced scaling

							// Subtle vertical movement
							yOffset = -(scaleFactor * 0.02);
						}
					}

					const isCharActive = charTimeScale > 0;

					// Style properties for individual character
					const charStyleProps = {
						"--gradient-progress": `${gradientProgress}%`,
						"--text-shadow-opacity": `${charGlowTimeScale * (isEmphasized ? 100 : 35)}%`,
						"--text-shadow-blur-radius": `${4 + (2 * charGlowTimeScale * (isEmphasized ? 3 : 1))}px`,
						transform: `translateY(calc(var(--lyrics-font-size) * ${yOffset * (isEmphasized ? 2 : 1)})) scale(${scaleValue})`,
						transformOrigin: "center center",
						transition: isCharActive ?
							"transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)" :
							"all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)"
					};

					return react.createElement(
						"span",
						{
							key: `single-active-char-${index}-${charIndex}`,
							className: `lyrics-lyricsContainer-Karaoke-Character${isCharActive ? " lyrics-lyricsContainer-Karaoke-CharacterActive" : ""}`,
							style: charStyleProps,
						},
						char
					);
				});

				return react.createElement(
					"span",
					{
						key: index,
						className: `lyrics-lyricsContainer-Karaoke-Syllable lyrics-lyricsContainer-Karaoke-SyllableActive${isEmphasized ? " lyrics-lyricsContainer-Karaoke-Emphasis" : ""}`,
					},
					...characterElements
				);
			});
			return react.createElement(react.Fragment, null, ...syllableElements);
		}
	}

	// Fallback to original karaoke format
	if (!isActive) {
		return Array.isArray(text) ? text.map(({ word }) => word).join("") : (text?.text || text || "");
	}

	if (Array.isArray(text)) {
		let currentStartTime = startTime;
		const wordElements = text.map(({ word, time }, index) => {
			const isWordActive = stablePosition >= currentStartTime;
			const wordElement = react.createElement(
				"span",
				{
					key: index,
					className: `lyrics-lyricsContainer-Karaoke-Word${isWordActive ? " lyrics-lyricsContainer-Karaoke-WordActive" : ""}`,
					style: {
						"--word-duration": `${time}ms`,
						transition: !isWordActive ? "all 0s linear" : "",
					},
				},
				word
			);
			currentStartTime += time;
			return wordElement;
		});
		return react.createElement(react.Fragment, null, ...wordElements);
	}

	// Fallback for simple string karaoke (when text is string but isKara is true)
	if (isActive && typeof text === 'string' && text) {

		const characters = Array.from(text);
		const characterElements = characters.map((char, charIndex) => {
			// Simple character-by-character animation for string text
			const charStartProgress = charIndex / characters.length;
			const charEndProgress = (charIndex + 1) / characters.length;

			// Simulate progress (this would normally come from timing data)
			const currentProgress = (stablePosition % 5000) / 5000; // 5 second cycle for demo

			let charTimeScale = 0;
			if (currentProgress > charStartProgress) {
				if (currentProgress >= charEndProgress) {
					charTimeScale = 1;
				} else {
					const charProgress = (currentProgress - charStartProgress) / (charEndProgress - charStartProgress);
					charTimeScale = Math.min(1, Math.max(0, charProgress));
				}
			}

			const gradientProgress = -20 + (120 * charTimeScale);

			// Beautiful-lyrics inspired character scaling when gradient line passes
			let scaleValue = 1.0;
			if (charTimeScale > 0 && charTimeScale <= 1) {
				const gradientPos = gradientProgress + 20;
				if (gradientPos >= 0 && gradientPos <= 120) {
					const scaleProgress = Math.min(1, gradientPos / 100);
					const scaleFactor = scaleProgress <= 0.5
						? scaleProgress * 2
						: 2 - (scaleProgress * 2);
					scaleValue = 1.0 + (0.08 * scaleFactor);
				}
			}

			const charStyleProps = {
				"--gradient-progress": `${gradientProgress}%`,
				"--text-shadow-opacity": "0%",
				"--text-shadow-blur-radius": "0px",
				transform: `scale(${scaleValue})`,
				transformOrigin: "center center",
				transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)"
			};

			return react.createElement(
				"span",
				{
					key: `fallback-char-${charIndex}`,
					className: `lyrics-lyricsContainer-Karaoke-Character${charTimeScale > 0 ? " lyrics-lyricsContainer-Karaoke-CharacterActive" : ""}`,
					style: charStyleProps,
				},
				char
			);
		});

		return react.createElement(react.Fragment, null, ...characterElements);
	}

	return text?.text || text || "";
});

const SyncedLyricsPage = react.memo(({ lyrics = [], provider, copyright, isKara }) => {
	const [position, setPosition] = useState(0);
	const activeLineEle = useRef();
	const lyricContainerEle = useRef();

	useTrackPosition(() => {
		const newPos = Spicetify.Player.getProgress();
		const delay = CONFIG.visual["global-delay"] + CONFIG.visual.delay;
		// Always update position for smoother karaoke animation
		setPosition(newPos + delay);
	});

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
				const displayMode = CONFIG.visual["translate:display-mode"];
				const showTranslatedBelow = displayMode === "below";
				const replaceOriginal = displayMode === "replace";
				
				let mainText, subText, subText2;

				if (isKara) {
					// For karaoke mode, use the entire line object
					mainText = line;
					subText = originalText ? text : null;
					subText2 = text2;
				} else {
					mainText = text;
					subText = null;
					subText2 = null;

					if (showTranslatedBelow && originalText) {
						mainText = originalText;
						subText = text;
						subText2 = text2;
					} else if (replaceOriginal) {
						// When replacing original, show translations
						mainText = text || originalText;
						subText = text2; // Show Mode 2 translation as sub-text
						subText2 = null;
					}
				}

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
							"--animation-index": (animationIndex < 0 ? 0 : animationIndex) + 1,
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
							// For Furigana/Hiragana HTML strings
							...(typeof mainText === "string" && !isKara ? { dangerouslySetInnerHTML: { __html: Utils.rubyTextToHTML(mainText) } } : {}),
						},
						!isKara ? (typeof mainText === "string" ? null : mainText) : react.createElement(KaraokeLine, {
							text: mainText,
							startTime,
							position,
							isActive: i === activeElementIndex
						})
					),
					(() => {
						if (!subText) return null;
						const props = {
							className: "lyrics-lyricsContainer-LyricsLine-sub",
							style: { "--sub-lyric-color": CONFIG.visual["inactive-color"] },
						};
						if (typeof subText === "string") {
							props.dangerouslySetInnerHTML = { __html: Utils.rubyTextToHTML(subText) };
							return react.createElement("p", props);
						}
						return react.createElement("p", props, subText);
					})(),
					(() => {
						if (!subText2) return null;
						const props2 = {
							className: "lyrics-lyricsContainer-LyricsLine-sub",
							style: { "--sub-lyric-color": CONFIG.visual["inactive-color"] },
						};
						if (typeof subText2 === "string") {
							props2.dangerouslySetInnerHTML = { __html: Utils.rubyTextToHTML(subText2) };
							return react.createElement("p", props2);
						}
						return react.createElement("p", props2, subText2);
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

class SearchBar extends react.Component {
	constructor() {
		super();
		this.state = {
			hidden: true,
			atNode: 0,
			foundNodes: [],
		};
		this.container = null;
	}

	componentDidMount() {
		this.viewPort = document.querySelector(".main-view-container .os-viewport");
		this.mainViewOffsetTop = document.querySelector(".Root__main-view").offsetTop;
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
			this.container.blur();
			this.setState({ hidden: true });
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
				this.viewPort.scrollBy(0, rects.y - 100);
				this.setState({ atNode });
			}
		};

		Spicetify.Mousetrap().bind("mod+shift+f", this.toggleCallback);
		Spicetify.Mousetrap(this.container).bind("mod+shift+f", this.toggleCallback);
		Spicetify.Mousetrap(this.container).bind("enter", this.loopThroughCallback);
		Spicetify.Mousetrap(this.container).bind("shift+enter", this.loopThroughCallback);
		Spicetify.Mousetrap(this.container).bind("esc", this.unFocusCallback);
	}

	componentWillUnmount() {
		Spicetify.Mousetrap().unbind("mod+shift+f", this.toggleCallback);
		Spicetify.Mousetrap(this.container).unbind("mod+shift+f", this.toggleCallback);
		Spicetify.Mousetrap(this.container).unbind("enter", this.loopThroughCallback);
		Spicetify.Mousetrap(this.container).unbind("shift+enter", this.loopThroughCallback);
		Spicetify.Mousetrap(this.container).unbind("esc", this.unFocusCallback);
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

const SyncedExpandedLyricsPage = react.memo(({ lyrics, provider, copyright, isKara }) => {
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
					isActive: activeLineIndex === 0,
					progress: position / nextStartTime,
					delay: nextStartTime / 3,
				});
			}

			const isActive = i === activeLineIndex;
			const displayMode = CONFIG.visual["translate:display-mode"];
			const showTranslatedBelow = displayMode === "below";
			const replaceOriginal = displayMode === "replace";
			
			let mainText = text;
			let subText = null;
			let subText2 = null;

			if (showTranslatedBelow && originalText) {
				mainText = originalText;
				subText = text;
				subText2 = text2;
			} else if (replaceOriginal) {
				// When replacing original, show translations
				mainText = text || originalText;
				subText = text2; // Show Mode 2 translation as sub-text
				subText2 = null;
			}

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
						"--animation-index": (animationIndex < 0 ? 0 : animationIndex) + 1,
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
							Spicetify.Platform.ClipboardAPI.copy(Utils.convertParsedToLRC(lyrics, belowMode).original)
								.then(() => Spicetify.showNotification("✓ 가사가 클립보드에 복사되었습니다", false, 2000))
								.catch(() => Spicetify.showNotification("가사 클립보드 복사 실패", true, 2000));
						},
					},
					!isKara ? mainText : react.createElement(KaraokeLine, { text: mainText, startTime, position, isActive })
				),
				subText && react.createElement("p", {
					className: "lyrics-lyricsContainer-LyricsLine-sub",
					style: {
						"--sub-lyric-color": CONFIG.visual["inactive-color"],
					},
					dangerouslySetInnerHTML: {
						__html: Utils.rubyTextToHTML(subText),
					},
				}),
				subText2 && react.createElement("p", {
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

const UnsyncedLyricsPage = react.memo(({ lyrics, provider, copyright }) => {
	return react.createElement(
		"div",
		{
			className: "lyrics-lyricsContainer-UnsyncedLyricsPage",
		},
		react.createElement("p", {
			className: "lyrics-lyricsContainer-LyricsUnsyncedPadding",
		}),
		...lyrics.map(({ text, originalText, text2 }, index) => {
			const displayMode = CONFIG.visual["translate:display-mode"];
			const showTranslatedBelow = displayMode === "below";
			const replaceOriginal = displayMode === "replace";
			
			// Determine what to show as main text
			let lineText;
			if (showTranslatedBelow && originalText) {
				lineText = originalText;
			} else if (replaceOriginal) {
				lineText = text || originalText;
			} else {
				lineText = text;
			}

			// Convert lyrics to text for comparison
			const belowOrigin = (typeof originalText === "object" ? originalText?.props?.children?.[0] : originalText)?.replace(/\s+/g, "");
			const belowTxt = (typeof text === "object" ? text?.props?.children?.[0] : text)?.replace(/\s+/g, "");

			// Show sub-lines in "below" mode or when we have Mode 2 translation in either mode
			const belowMode = showTranslatedBelow && originalText && belowOrigin !== belowTxt;
			const showMode2 = !!text2 && (showTranslatedBelow || replaceOriginal);

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
						// Use HTML for ruby when string
						...(typeof lineText === "string"
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
							...(typeof text === "string"
								? { dangerouslySetInnerHTML: { __html: Utils.rubyTextToHTML(text) } }
								: {}),
						},
						typeof text === "string" ? null : text
					),
				showMode2 &&
					react.createElement(
						"p",
						{
							style: { opacity: 0.5 },
							onContextMenu: (event) => {
								event.preventDefault();
								Spicetify.Platform.ClipboardAPI.copy(text2)
									.then(() => Spicetify.showNotification("✓ Second translation copied to clipboard", false, 2000))
									.catch(() => Spicetify.showNotification("두 번째 번역 클립보드 복사 실패", true, 2000));
							},
							...(typeof text2 === "string"
								? { dangerouslySetInnerHTML: { __html: Utils.rubyTextToHTML(text2) } }
								: {}),
						},
						typeof text2 === "string" ? null : text2
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

const noteContainer = document.createElement("div");
noteContainer.classList.add("lyrics-Genius-noteContainer");
const noteDivider = document.createElement("div");
noteDivider.classList.add("lyrics-Genius-divider");
noteDivider.innerHTML = `<svg width="32" height="32" viewBox="0 0 13 4" fill="currentColor"><path d=\"M13 10L8 4.206 3 10z\"/></svg>`;
noteDivider.style.setProperty("--link-left", 0);
const noteTextContainer = document.createElement("div");
noteTextContainer.classList.add("lyrics-Genius-noteTextContainer");
noteTextContainer.onclick = (event) => {
	event.preventDefault();
	event.stopPropagation();
};
noteContainer.append(noteDivider, noteTextContainer);

function showNote(parent, note) {
	if (noteContainer.parentElement === parent) {
		noteContainer.remove();
		return;
	}
	noteTextContainer.innerText = note;
	parent.append(noteContainer);
	const arrowPos = parent.offsetLeft - noteContainer.offsetLeft;
	noteDivider.style.setProperty("--link-left", `${arrowPos}px`);
	const box = noteTextContainer.getBoundingClientRect();
	if (box.y + box.height > window.innerHeight) {
		// Wait for noteContainer is mounted
		setTimeout(() => {
			noteContainer.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "nearest",
			});
		}, 50);
	}
}

const GeniusPage = react.memo(
	({ lyrics, provider, copyright, versions, versionIndex, onVersionChange, isSplitted, lyrics2, versionIndex2, onVersionChange2 }) => {
		let notes = {};
		let container = null;
		let container2 = null;

		// Fetch notes
		useEffect(() => {
			if (!container) return;
			notes = {};
			let links = container.querySelectorAll("a");
			if (isSplitted && container2) {
				links = [...links, ...container2.querySelectorAll("a")];
			}
			for (const link of links) {
				let id = link.pathname.match(/\/(\d+)\//);
				if (!id) {
					id = link.dataset.id;
				} else {
					id = id[1];
				}
				ProviderGenius.getNote(id).then((note) => {
					notes[id] = note;
					link.classList.add("fetched");
				});
				link.onclick = (event) => {
					event.preventDefault();
					if (!notes[id]) return;
					showNote(link, notes[id]);
				};
			}
		}, [lyrics, lyrics2]);

		const lyricsEl1 = react.createElement(
			"div",
			null,
			react.createElement(VersionSelector, { items: versions, index: versionIndex, callback: onVersionChange }),
			react.createElement("div", {
				className: "lyrics-lyricsContainer-LyricsLine lyrics-lyricsContainer-LyricsLine-active",
				ref: (c) => {
					container = c;
				},
				dangerouslySetInnerHTML: {
					__html: lyrics,
				},
				onContextMenu: (event) => {
					event.preventDefault();
					const copylyrics = lyrics.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "");
					Spicetify.Platform.ClipboardAPI.copy(copylyrics)
						.then(() => Spicetify.showNotification("✓ 가사가 클립보드에 복사되었습니다", false, 2000))
						.catch(() => Spicetify.showNotification("가사 클립보드 복사 실패", true, 2000));
				},
			})
		);

		const mainContainer = [lyricsEl1];
		const shouldSplit = versions.length > 1 && isSplitted;

		if (shouldSplit) {
			const lyricsEl2 = react.createElement(
				"div",
				null,
				react.createElement(VersionSelector, { items: versions, index: versionIndex2, callback: onVersionChange2 }),
				react.createElement("div", {
					className: "lyrics-lyricsContainer-LyricsLine lyrics-lyricsContainer-LyricsLine-active",
					ref: (c) => {
						container2 = c;
					},
					dangerouslySetInnerHTML: {
						__html: lyrics2,
					},
					onContextMenu: (event) => {
						event.preventDefault();
						const copylyrics = lyrics.replace(/<br>/g, "\n").replace(/<[^>]*>/g, "");
						Spicetify.Platform.ClipboardAPI.copy(copylyrics)
							.then(() => Spicetify.showNotification("✓ 가사가 클립보드에 복사되었습니다", false, 2000))
							.catch(() => Spicetify.showNotification("가사 클립보드 복사 실패", true, 2000));
					},
				})
			);
			mainContainer.push(lyricsEl2);
		}

		return react.createElement(
			"div",
			{
				className: "lyrics-lyricsContainer-UnsyncedLyricsPage",
			},
			react.createElement("p", {
				className: "lyrics-lyricsContainer-LyricsUnsyncedPadding main-type-ballad",
			}),
			react.createElement("div", { className: shouldSplit ? "split" : "" }, mainContainer),
			react.createElement(CreditFooter, {
				provider,
				copyright,
			}),
			react.createElement(SearchBar, null)
		);
	}
);

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

const VersionSelector = react.memo(({ items, index, callback }) => {
	if (items.length < 2) {
		return null;
	}
	return react.createElement(
		"div",
		{
			className: "lyrics-versionSelector",
		},
		react.createElement(
			"select",
			{
				onChange: (event) => {
					callback(items, event.target.value);
				},
				value: index,
			},
			...items.map((a, i) => {
				return react.createElement("option", { key: i, value: i }, a.title);
			})
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
	);
});

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
