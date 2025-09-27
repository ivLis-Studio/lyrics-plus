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
		subText = originalText ? safeRenderText(text) : null;
		subText2 = safeRenderText(text2);
	} else {
		mainText = safeRenderText(text);
		subText = null;
		subText2 = null;

		if (showTranslatedBelow && originalText) {
			mainText = safeRenderText(originalText);
			subText = safeRenderText(text);
			subText2 = safeRenderText(text2);
		} else if (replaceOriginal) {
			// When replacing original, show translations
			mainText = safeRenderText(text) || safeRenderText(originalText);
			subText = safeRenderText(text2); // Show Mode 2 translation as sub-text
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

const KaraokeLine = react.memo(({ text, isActive, position, startTime }) => {
	// Stabilize position to reduce unnecessary re-renders - handle edge cases
	const stablePosition = useMemo(() => {
		if (typeof position !== 'number' || isNaN(position)) return 0;
		// Reduced granularity for better performance - update every 32ms instead of 16ms
		return Math.floor(position / 32) * 32;
	}, [position]);

	// Safe text extraction helper - 안전한 텍스트 추출
	const extractTextSafely = useCallback((textObj) => {
		if (!textObj) return "";
		if (typeof textObj === "string") return textObj;
		if (typeof textObj === "object") {
			if (textObj.syllables && Array.isArray(textObj.syllables)) {
				return textObj.syllables.map(s => s?.text || "").join("");
			}
			if (textObj.vocals && textObj.vocals.lead && textObj.vocals.lead.syllables) {
				const leadText = textObj.vocals.lead.syllables.map(s => s?.text || "").join("");
				const backgroundTexts = (textObj.vocals.background || [])
					.filter(bg => bg && bg.syllables)
					.map(bg => bg.syllables.map(s => s?.text || "").join(""));
				return leadText + (backgroundTexts.length > 0 ? " (" + backgroundTexts.join(", ") + ")" : "");
			}
			if (textObj.text) return String(textObj.text);
		}
		return String(textObj || "");
	}, []);

	// 비활성 카라오케 처리
	const inactiveText = useMemo(() => {
		if (isActive) return null;
		return extractTextSafely(text);
	}, [isActive, text, extractTextSafely]);

	if (inactiveText !== null) {
		return inactiveText;
	}

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
					return react.createElement(react.Fragment, { key: `empty-vocal-${isBackground ? 'bg' : 'lead'}` });
				}
				const syllableElements = vocal.syllables.map((syllable, index) => {
					const syllableStart = syllable?.startTime || 0;
					const syllableEnd = syllable?.endTime || (syllableStart + 500);
					const syllableDuration = syllableEnd - syllableStart;
					const syllableText = syllable?.text || "";
				
					// Skip empty syllables
					if (!syllableText) {
						return react.createElement(
							"span",
							{
								key: `${isBackground ? 'bg' : 'lead'}-empty-${index}`,
								className: `lyrics-lyricsContainer-Karaoke-Syllable${isBackground ? " lyrics-lyricsContainer-Karaoke-Background" : ""}`,
							},
							""
						);
					}

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
						// Safety check: ensure char is a string
						if (typeof char !== 'string' || char === null || char === undefined) {
							return null; // Skip invalid characters
						}

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
								charGlowTimeScale = charProgress; // Enable glow during active phase
							}
						}

						// Beautiful-lyrics gradient formula: -20 + (120 * timeScale)
						const gradientProgress = -20 + (120 * charTimeScale);

						// Enhanced character scaling with beautiful smooth animation
						let scaleValue = 1.0;
						let yOffset = 0;

						if (charTimeScale > 0 && charTimeScale < 1) {
							// Use sin curve for natural scaling animation (0 → 1 → 0)
							const progress = charTimeScale; // 0 to 1
							const scaleFactor = Math.sin(progress * Math.PI); // Smooth bell curve

							// Enhanced scaling with different intensities based on syllable emphasis
							const maxScale = isEmphasized ? 0.25 : 0.15; // 25% or 15% max scaling
							scaleValue = 1.0 + (maxScale * scaleFactor);

							// Subtle bounce effect - characters rise slightly when scaling
							const bounceFactor = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5; // 0 to 1
							yOffset = -(scaleFactor * 0.03 * (isEmphasized ? 1.5 : 1));

							// Add slight rotation for extra dynamism on emphasized syllables
							if (isEmphasized && scaleFactor > 0.3) {
								const rotationAngle = Math.sin(progress * Math.PI * 2) * 2; // -2 to +2 degrees
								yOffset += Math.sin(progress * Math.PI) * 0.01; // Extra lift
							}
						}

						const isCharActive = charTimeScale > 0;

						// Style properties for individual character with enhanced animations
						const charStyleProps = {
							"--gradient-progress": `${gradientProgress}%`,
							"--text-shadow-opacity": `${charGlowTimeScale * 100}%`,
							"--text-shadow-blur-radius": `${6 + (4 * charGlowTimeScale * 3)}px`,
							transform: `translateY(calc(var(--lyrics-font-size) * ${yOffset * 2})) scale(${scaleValue})`,
							transformOrigin: "center bottom", // Better anchor point for scaling
							transition: charTimeScale > 0 && charTimeScale < 1 ?
								"transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : // Active: Quick response
								"all 0.4s cubic-bezier(0.23, 1, 0.32, 1)", // Inactive: Smooth ease-out
							// Add subtle filter effects for active characters
							filter: charTimeScale > 0 ?
								`blur(0px) brightness(${1 + (charGlowTimeScale * 0.2)}) saturate(${1 + (charGlowTimeScale * 0.3)})` :
								"blur(0.05px) brightness(1) saturate(1)"
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
				return react.createElement(react.Fragment, { key: `vocal-fragment-${isBackground ? 'bg' : 'lead'}` }, ...syllableElements);
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
				// return text.text || "";
				const lyricString = text.text || "";
				if (isActive && typeof lyricString === 'string' && lyricString) {
					const characters = Array.from(lyricString);
					const characterElements = characters.map((char, charIndex) => {
						if (char === '\n') {
							return react.createElement('br', { key: `br-${charIndex}` });
						}
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

					return react.createElement(react.Fragment, { key: `fallback-char-fragment-${text?.startTime || 'unknown'}` }, ...characterElements);
				}
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
					// Safety check: ensure char is a string
					if (typeof char !== 'string' || char === null || char === undefined) {
						return null; // Skip invalid characters
					}

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
							charGlowTimeScale = 0; // No glow effect for completed
						} else {
							// Character is currently active
							const charProgress = (clampedProgress - clampedCharStart) / (clampedCharEnd - clampedCharStart);
							charTimeScale = Math.min(1, Math.max(0, charProgress));
							charGlowTimeScale = charProgress; // Enable glow during active phase
						}
					}

					// Beautiful-lyrics gradient formula: -20 + (120 * timeScale)
					const gradientProgress = -20 + (120 * charTimeScale);

					// Enhanced character scaling with beautiful smooth animation
					let scaleValue = 1.0;
					let yOffset = 0;

					if (charTimeScale > 0 && charTimeScale < 1) {
						// Use sin curve for natural scaling animation (0 → 1 → 0)
						const progress = charTimeScale; // 0 to 1
						const scaleFactor = Math.sin(progress * Math.PI); // Smooth bell curve

						// Enhanced scaling with different intensities based on syllable emphasis
						const maxScale = isEmphasized ? 0.25 : 0.15; // 25% or 15% max scaling
						scaleValue = 1.0 + (maxScale * scaleFactor);

						// Subtle bounce effect - characters rise slightly when scaling
						const bounceFactor = Math.sin(progress * Math.PI * 2) * 0.5 + 0.5; // 0 to 1
						yOffset = -(scaleFactor * 0.03 * (isEmphasized ? 1.5 : 1));

						// Add slight rotation for extra dynamism on emphasized syllables
						if (isEmphasized && scaleFactor > 0.3) {
							const rotationAngle = Math.sin(progress * Math.PI * 2) * 2; // -2 to +2 degrees
							yOffset += Math.sin(progress * Math.PI) * 0.01; // Extra lift
						}
					}

					const isCharActive = charTimeScale > 0;

					// Style properties for individual character with enhanced animations
					const charStyleProps = {
						"--gradient-progress": `${gradientProgress}%`,
						"--text-shadow-opacity": `${charGlowTimeScale * 100}%`,
						"--text-shadow-blur-radius": `${6 + (4 * charGlowTimeScale * 3)}px`,
						transform: `translateY(calc(var(--lyrics-font-size) * ${yOffset * 2})) scale(${scaleValue})`,
						transformOrigin: "center bottom", // Better anchor point for scaling
						transition: charTimeScale > 0 && charTimeScale < 1 ?
							"transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : // Active: Quick response
							"all 0.4s cubic-bezier(0.23, 1, 0.32, 1)", // Inactive: Smooth ease-out
						// Add subtle filter effects for active characters
						filter: charTimeScale > 0 ?
							`blur(0px) brightness(${1 + (charGlowTimeScale * 0.2)}) saturate(${1 + (charGlowTimeScale * 0.3)})` :
							"blur(0.05px) brightness(1) saturate(1)"
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
				return react.createElement(react.Fragment, { key: `syllable-fragment-${text?.startTime || 'unknown'}` }, ...syllableElements);
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
			return react.createElement(react.Fragment, { key: `word-fragment-${index}` }, ...wordElements);
	}

	// Fallback for simple string karaoke (when text is string or object with text property)
	const lyricString = (typeof text === 'string') ? text : text?.text;
	if (isActive && typeof lyricString === 'string' && lyricString) {
		const characters = Array.from(lyricString);
		const characterElements = characters.map((char, charIndex) => {
			if (char === '\n') {
				return react.createElement('br', { key: `br-${charIndex}` });
			}
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

		return react.createElement(react.Fragment, { key: `string-char-fragment-${text?.startTime || 'unknown'}` }, ...characterElements);
	}

	return extractTextSafely(text);
});

const SyncedLyricsPage = react.memo(({ lyrics = [], provider, copyright, isKara }) => {
	const [position, setPosition] = useState(0);
	const activeLineEle = useRef();
	const lyricContainerEle = useRef();

	// Hook은 항상 같은 순서로 호출되어야 함
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
						// Safe rendering for main text
						(() => {
							if (isKara) {
								// 카라오케 모드에서는 KaraokeLine 컴포넌트 사용
								return react.createElement(KaraokeLine, {
									text: mainText,
									startTime,
									position,
									isActive: i === activeElementIndex
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
						if (typeof subText === "string") {
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
						if (typeof subText2 === "string") {
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
	const [position, setPosition] = useState(0);
	const activeLineRef = useRef(null);
	const pageRef = useRef(null);

	// Hook은 항상 같은 순서로 호출되어야 함
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
							Spicetify.Platform.ClipboardAPI.copy(Utils.convertParsedToLRC(lyrics).original)
								.then(() => Spicetify.showNotification("✓ 가사가 클립보드에 복사되었습니다", false, 2000))
								.catch(() => Spicetify.showNotification("가사 클립보드 복사 실패", true, 2000));
						},
						// For Furigana/Hiragana HTML strings
						...(typeof mainText === "string" && !isKara ? { dangerouslySetInnerHTML: { __html: Utils.rubyTextToHTML(mainText) } } : {}),
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

const UnsyncedLyricsPage = react.memo(({ lyrics = [], provider, copyright }) => {
	// Hook은 항상 같은 순서로 호출되어야 함
	const lyricsArray = useMemo(() => {
		// 안전한 배열 변환
		if (Array.isArray(lyrics)) {
			return lyrics;
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
							...(typeof subText === "string"
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
							...(typeof showMode2Translation === "string"
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
