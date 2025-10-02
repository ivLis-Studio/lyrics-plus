// Run "npm i @types/react" to have this type package available in workspace
/// <reference types="react" />
/// <reference path="../../globals.d.ts" />

/** @type {React} */
const react = Spicetify.React;
const { useState, useEffect, useCallback, useMemo, useRef } = react;
/** @type {import("react").ReactDOM | null} */
let reactDOM = Spicetify.ReactDOM;

function ensureReactDOM() {
	if (reactDOM && (typeof reactDOM.render === "function" || typeof reactDOM.createPortal === "function")) {
		return reactDOM;
	}

	const resolved = (window?.Spicetify?.ReactDOM) || window?.ReactDOM || null;
	if (resolved && resolved !== reactDOM) {
		reactDOM = resolved;
		window.reactDOM = resolved;
	}

	return reactDOM;
}

window.lyricsPlusEnsureReactDOM = ensureReactDOM;
const spotifyVersion = Spicetify.Platform.version;

// Define a function called "render" to specify app entry point
// This function will be used to mount app to main view.
function render() {
	return react.createElement(LyricsContainer, null);
}

// Optimized utility functions with better error handling and performance
const StorageManager = {
	get(key, defaultVal = true) {
		try {
			const value = localStorage.getItem(key);
			return value !== null ? value === "true" : defaultVal;
		} catch (error) {
			return defaultVal;
		}
	},

	getPersisted(key) {
		// Try Spicetify LocalStorage first (more reliable)
		try {
			const value = Spicetify?.LocalStorage?.get(key);
			if (typeof value === "string") return value;
		} catch (error) {
			// Error ignored
		}

		// Fallback to regular localStorage
		try {
			return localStorage.getItem(key);
		} catch (error) {
			// Error ignored
		}

		return null;
	},

	setPersisted(key, value) {
		const stringValue = String(value);
		let success = false;

		// Try Spicetify LocalStorage first
		try {
			Spicetify?.LocalStorage?.set(key, stringValue);
			success = true;
		} catch (error) {
			// Error ignored
		}

		// Fallback to regular localStorage
		try {
			localStorage.setItem(key, stringValue);
			success = true;
		} catch (error) {
			// Error ignored
		}

		if (!success) {
			// Failed to persist data
		}
	},

	// Unified config save method to reduce duplication
	saveConfig(name, value) {
		if (name === "gemini-api-key" || name === "gemini-api-key-romaji") {
			// Save sensitive keys to both storages for persistence
			this.setPersisted(`${APP_NAME}:visual:${name}`, value);
		} else {
			localStorage.setItem(`${APP_NAME}:visual:${name}`, value);
		}
	}
};

const APP_NAME = "lyrics-plus";

const KARAOKE = 0;
const SYNCED = 1;
const UNSYNCED = 2;

const CONFIG = {
	visual: {
			"playbar-button": StorageManager.get("lyrics-plus:visual:playbar-button", false),
	colorful: StorageManager.get("lyrics-plus:visual:colorful"),
	"gradient-background": StorageManager.get("lyrics-plus:visual:gradient-background"),
	"background-brightness": localStorage.getItem("lyrics-plus:visual:background-brightness") || "80",
	noise: StorageManager.get("lyrics-plus:visual:noise"),
		"background-color": localStorage.getItem("lyrics-plus:visual:background-color") || "var(--spice-main)",
		"active-color": localStorage.getItem("lyrics-plus:visual:active-color") || "var(--spice-text)",
		"inactive-color": localStorage.getItem("lyrics-plus:visual:inactive-color") || "rgba(var(--spice-rgb-subtext),0.5)",
		"highlight-color": localStorage.getItem("lyrics-plus:visual:highlight-color") || "var(--spice-button)",
		alignment: localStorage.getItem("lyrics-plus:visual:alignment") || "center",
		"lines-before": localStorage.getItem("lyrics-plus:visual:lines-before") || "0",
		"lines-after": localStorage.getItem("lyrics-plus:visual:lines-after") || "2",
		"font-size": localStorage.getItem("lyrics-plus:visual:font-size") || "32",
		"original-font-weight": localStorage.getItem("lyrics-plus:visual:original-font-weight") || "400",
		"original-font-size": localStorage.getItem("lyrics-plus:visual:original-font-size") || "32",
		"translation-font-weight": localStorage.getItem("lyrics-plus:visual:translation-font-weight") || "300",
		"translation-font-size": localStorage.getItem("lyrics-plus:visual:translation-font-size") || "24",
		"text-shadow-enabled": StorageManager.get("lyrics-plus:visual:text-shadow-enabled", true),
		"text-shadow-color": localStorage.getItem("lyrics-plus:visual:text-shadow-color") || "#000000",
		"text-shadow-opacity": localStorage.getItem("lyrics-plus:visual:text-shadow-opacity") || "50",
		"text-shadow-blur": localStorage.getItem("lyrics-plus:visual:text-shadow-blur") || "2",
		"original-opacity": localStorage.getItem("lyrics-plus:visual:original-opacity") || "100",
		"translation-opacity": localStorage.getItem("lyrics-plus:visual:translation-opacity") || "85",
		"translate:translated-lyrics-source": localStorage.getItem("lyrics-plus:visual:translate:translated-lyrics-source") || "geminiKo",
		"translate:display-mode": localStorage.getItem("lyrics-plus:visual:translate:display-mode") || "replace",
		"translate:detect-language-override": localStorage.getItem("lyrics-plus:visual:translate:detect-language-override") || "off",
		"translation-mode:english": localStorage.getItem("lyrics-plus:visual:translation-mode:english") || "none",
		"translation-mode:japanese": localStorage.getItem("lyrics-plus:visual:translation-mode:japanese") || "none",
		"translation-mode:korean": localStorage.getItem("lyrics-plus:visual:translation-mode:korean") || "none",
		"translation-mode:chinese": localStorage.getItem("lyrics-plus:visual:translation-mode:chinese") || "none",
		"translation-mode:gemini": localStorage.getItem("lyrics-plus:visual:translation-mode:gemini") || "none",
		"translation-mode-2:english": localStorage.getItem("lyrics-plus:visual:translation-mode-2:english") || "none",
		"translation-mode-2:japanese": localStorage.getItem("lyrics-plus:visual:translation-mode-2:japanese") || "none",
		"translation-mode-2:korean": localStorage.getItem("lyrics-plus:visual:translation-mode-2:korean") || "none",
		"translation-mode-2:chinese": localStorage.getItem("lyrics-plus:visual:translation-mode-2:chinese") || "none",
		"translation-mode-2:gemini": localStorage.getItem("lyrics-plus:visual:translation-mode-2:gemini") || "none",
		"gemini-api-key": StorageManager.getPersisted("lyrics-plus:visual:gemini-api-key") || "",
		"gemini-api-key-romaji": StorageManager.getPersisted("lyrics-plus:visual:gemini-api-key-romaji") || "",
		translate: StorageManager.get("lyrics-plus:visual:translate", false),
		"ja-detect-threshold": localStorage.getItem("lyrics-plus:visual:ja-detect-threshold") || "40",
		"hans-detect-threshold": localStorage.getItem("lyrics-plus:visual:hans-detect-threshold") || "40",
		"fade-blur": StorageManager.get("lyrics-plus:visual:fade-blur"),
		"karaoke-bounce": StorageManager.get("lyrics-plus:visual:karaoke-bounce", true),
		"fullscreen-key": localStorage.getItem("lyrics-plus:visual:fullscreen-key") || "f12",
			"synced-compact": StorageManager.get("lyrics-plus:visual:synced-compact"),
		"global-delay": Number(localStorage.getItem("lyrics-plus:visual:global-delay")) || 0,
		delay: 0,
	},
	providers: {
		lrclib: {
			on: StorageManager.get("lyrics-plus:provider:lrclib:on"),
			desc: "lrclib.net에서 제공되는 가사입니다. 동기화된 가사와 동기화되지 않은 가사를 모두 지원합니다. LRCLIB은 무료 오픈소스 가사 제공자입니다.",
			modes: [SYNCED, UNSYNCED],
		},
		ivlyrics: {
			on: StorageManager.get("lyrics-plus:provider:ivlyrics:on", true),
			desc: "ivLyrics API에서 제공되는 가사입니다. 동기화된 가사, 동기화되지 않은 가사, 단어별 카라오케 가사를 지원합니다.",
			modes: [KARAOKE, SYNCED, UNSYNCED],
		},
		spotify: {
			on: StorageManager.get("lyrics-plus:provider:spotify:on"),
			desc: "공식 Spotify API에서 제공되는 가사입니다.",
			modes: [SYNCED, UNSYNCED],
		},
		local: {
			on: StorageManager.get("lyrics-plus:provider:local:on"),
			desc: "이전 Spotify 세션에서 로드된 캐시/로컬 파일의 가사를 제공합니다.",
			modes: [SYNCED, UNSYNCED],
		},
	},
	providersOrder: localStorage.getItem("lyrics-plus:services-order"),
	modes: ["노래방", "동기화", "일반가사"],
	locked: localStorage.getItem("lyrics-plus:lock-mode") || "-1",
};

try {
	CONFIG.providersOrder = JSON.parse(CONFIG.providersOrder);
	if (!Array.isArray(CONFIG.providersOrder) || Object.keys(CONFIG.providers).length !== CONFIG.providersOrder.length) {
		throw "";
	}
} catch {
	CONFIG.providersOrder = ["ivlyrics", "spotify", "lrclib", "local"];
	localStorage.setItem("lyrics-plus:services-order", JSON.stringify(CONFIG.providersOrder));
}

CONFIG.locked = Number.parseInt(CONFIG.locked);
CONFIG.visual["lines-before"] = Number.parseInt(CONFIG.visual["lines-before"]);
CONFIG.visual["lines-after"] = Number.parseInt(CONFIG.visual["lines-after"]);
CONFIG.visual["font-size"] = Number.parseInt(CONFIG.visual["font-size"]);
CONFIG.visual["original-font-weight"] = Number.parseInt(CONFIG.visual["original-font-weight"]);
CONFIG.visual["original-font-size"] = Number.parseInt(CONFIG.visual["original-font-size"]);
CONFIG.visual["translation-font-weight"] = Number.parseInt(CONFIG.visual["translation-font-weight"]);
CONFIG.visual["translation-font-size"] = Number.parseInt(CONFIG.visual["translation-font-size"]);
CONFIG.visual["text-shadow-opacity"] = Number.parseInt(CONFIG.visual["text-shadow-opacity"]);
CONFIG.visual["text-shadow-blur"] = Number.parseInt(CONFIG.visual["text-shadow-blur"]);
CONFIG.visual["original-opacity"] = Number.parseInt(CONFIG.visual["original-opacity"]);
CONFIG.visual["translation-opacity"] = Number.parseInt(CONFIG.visual["translation-opacity"]);
CONFIG.visual["background-brightness"] = Number.parseInt(CONFIG.visual["background-brightness"]);
CONFIG.visual["ja-detect-threshold"] = Number.parseInt(CONFIG.visual["ja-detect-threshold"]);
CONFIG.visual["hans-detect-threshold"] = Number.parseInt(CONFIG.visual["hans-detect-threshold"]);

let CACHE = {};

const emptyState = {
	karaoke: null,
	synced: null,
	unsynced: null,
	currentLyrics: null,
};

// Enhanced cache system with memory-efficient LRU and automatic cleanup
const CacheManager = {
	_cache: new Map(),
	_maxSize: 100, // Limit cache to 100 songs
	_ttl: 30 * 60 * 1000, // 30 minutes TTL
	_cleanupTimer: null,
	_statsEnabled: false,

	// Performance statistics
	_stats: {
		hits: 0,
		misses: 0,
		evictions: 0,
		cleanups: 0
	},

	init() {
		// Start periodic cleanup to prevent memory leaks
		this._startPeriodicCleanup();

		// Listen for memory pressure events
		if ('memory' in performance) {
			this._setupMemoryPressureListener();
		}
	},

	get(key) {
		const item = this._cache.get(key);
		if (!item) {
			if (this._statsEnabled) this._stats.misses++;
			return null;
		}

		// Check if expired
		if (Date.now() > item.expiry) {
			this._cache.delete(key);
			if (this._statsEnabled) this._stats.misses++;
			return null;
		}

		// Update access time for LRU (move to end)
		this._cache.delete(key);
		item.lastAccessed = Date.now();
		this._cache.set(key, item);

		if (this._statsEnabled) this._stats.hits++;
		return item.data;
	},

	set(key, data) {
		// Clean up if cache is getting too large
		if (this._cache.size >= this._maxSize) {
			this._cleanupOldEntries();
		}

		this._cache.set(key, {
			data,
			expiry: Date.now() + this._ttl,
			lastAccessed: Date.now(),
			size: this._estimateSize(data)
		});
	},

	_cleanupOldEntries() {
		// LRU eviction - remove oldest entries
		const entries = Array.from(this._cache.entries());
		const toRemove = Math.floor(entries.length * 0.3); // Remove 30% to reduce frequent cleanups

		// Sort by last accessed time (oldest first)
		entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

		for (let i = 0; i < toRemove; i++) {
			this._cache.delete(entries[i][0]);
		}

		if (this._statsEnabled) {
			this._stats.evictions += toRemove;
			this._stats.cleanups++;
		}
	},

	_startPeriodicCleanup() {
		// Clean up expired entries every 5 minutes
		this._cleanupTimer = setInterval(() => {
			const now = Date.now();
			const keysToDelete = [];

			for (const [key, item] of this._cache.entries()) {
				if (now > item.expiry) {
					keysToDelete.push(key);
				}
			}

			keysToDelete.forEach(key => this._cache.delete(key));

			if (this._statsEnabled && keysToDelete.length > 0) {
				this._stats.cleanups++;
			}
		}, 5 * 60 * 1000);
	},

	_setupMemoryPressureListener() {
		// Aggressive cleanup on memory pressure
		if (typeof PerformanceObserver !== 'undefined') {
			try {
				const observer = new PerformanceObserver((list) => {
					for (const entry of list.getEntries()) {
						if (entry.name === 'memory') {
							const { totalJSHeapSize, usedJSHeapSize, jsHeapSizeLimit } = entry;
							const memoryUsage = usedJSHeapSize / jsHeapSizeLimit;

							// If memory usage > 80%, clear half the cache
							if (memoryUsage > 0.8) {
								this._aggressiveCleanup();
							}
						}
					}
				});
				observer.observe({ entryTypes: ['measure'] });
			} catch (error) {
				// Performance Observer not available
			}
		}
	},

	_aggressiveCleanup() {
		const entries = Array.from(this._cache.entries());
		const toRemove = Math.floor(entries.length * 0.5);

		entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

		for (let i = 0; i < toRemove; i++) {
			this._cache.delete(entries[i][0]);
		}
	},

	_estimateSize(data) {
		// Rough estimation of object size in bytes
		try {
			return JSON.stringify(data).length * 2; // 2 bytes per character (UTF-16)
		} catch {
			return 1000; // Default estimate
		}
	},

	clear() {
		this._cache.clear();
		if (this._cleanupTimer) {
			clearInterval(this._cleanupTimer);
			this._cleanupTimer = null;
		}
	},

	// Clear cache entries for a specific URI
	clearByUri(uri) {
		const keysToDelete = [];
		for (const [key] of this._cache) {
			if (key.includes(uri)) {
				keysToDelete.push(key);
			}
		}
		keysToDelete.forEach(key => this._cache.delete(key));
		return keysToDelete.length;
	},

	// Get cache statistics
	getStats() {
		const hitRate = this._stats.hits / (this._stats.hits + this._stats.misses) * 100;
		return {
			...this._stats,
			hitRate: isNaN(hitRate) ? 0 : hitRate.toFixed(2),
			cacheSize: this._cache.size,
			maxSize: this._maxSize
		};
	},

	enableStats() {
		this._statsEnabled = true;
	}
};

// Rate limiting utility
const RateLimiter = {
	_calls: new Map(),

	canMakeCall(key, maxCalls = 5, windowMs = 60000) {
		const now = Date.now();
		const calls = this._calls.get(key) || [];
		
		// Remove calls outside the window
		const validCalls = calls.filter(time => now - time < windowMs);
		
		if (validCalls.length >= maxCalls) {
			return false;
		}
		
		validCalls.push(now);
		this._calls.set(key, validCalls);
		return true;
	}
};

let lyricContainerUpdate;
let reloadLyrics;

const fontSizeLimit = { min: 16, max: 256, step: 4 };

const thresholdSizeLimit = { min: 0, max: 100, step: 5 };

class LyricsContainer extends react.Component {
	constructor() {
		super();
		this.state = {
			karaoke: null,
			synced: null,
			unsynced: null,
			currentLyrics: null,
			romaji: null,
			furigana: null,
			hiragana: null,
			hangul: null,
			romaja: null,
			katakana: null,
			cn: null,
			hk: null,
			tw: null,
			uri: "",
			provider: "",
			colors: {
				background: "",
				inactive: "",
			},
			tempo: "0.25s",
			explicitMode: -1,
			lockMode: CONFIG.locked,
			mode: -1,
			isLoading: false,
			versionIndex: 0,
			versionIndex2: 0,
			isFullscreen: false,
			isFADMode: false,
			isCached: false,
			language: null,
			isTranslationLoading: false,
		};
		this.currentTrackUri = "";
		this.nextTrackUri = "";
		this.availableModes = [];
		this.styleVariables = {};
		this.fullscreenContainer = document.createElement("div");
		this.fullscreenContainer.id = "lyrics-fullscreen-container";
		this.mousetrap = null;
		this.containerRef = react.createRef(null);
		this.translator = null;
		this.initMoustrap();
		// Cache last state
		this.languageOverride = CONFIG.visual["translate:detect-language-override"];
		this.reRenderLyricsPage = false;
		this.displayMode = null;
		
		// Prevent infinite render loops
		this.lastProcessedUri = null;
		this.lastProcessedMode = null;
		
		// Translation loading timer
		this.translationLoadingTimer = null;
	}

	/**
	 * 번역 로딩 상태를 시작합니다 (1초 후에 로딩 메시지 표시)
	 */
	startTranslationLoading() {
		this.clearTranslationLoading();
		this.translationLoadingTimer = setTimeout(() => {
			this.setState({ isTranslationLoading: true });
		}, 1000);
	}

	/**
	 * 번역 로딩 상태를 종료합니다
	 */
	clearTranslationLoading() {
		if (this.translationLoadingTimer) {
			clearTimeout(this.translationLoadingTimer);
			this.translationLoadingTimer = null;
		}
		this.setState({ isTranslationLoading: false });
	}

	infoFromTrack(track) {
		const meta = track?.metadata;
		if (!meta) {
			return null;
		}
		return {
			duration: Number(meta.duration),
			album: meta.album_title,
			artist: meta.artist_name,
			title: meta.title,
			uri: track.uri,
			image: meta.image_url,
		};
	}

	async fetchColors(uri) {
		let vibrant = 0;
		try {
			try {
				const { fetchExtractedColorForTrackEntity } = Spicetify.GraphQL.Definitions;
				const { data } = await Spicetify.GraphQL.Request(fetchExtractedColorForTrackEntity, { uri });
				const { hex } = data.trackUnion.albumOfTrack.coverArt.extractedColors.colorDark;
				vibrant = Number.parseInt(hex.replace("#", ""), 16);
			} catch {
				const colors = await Spicetify.CosmosAsync.get(`https://spclient.wg.spotify.com/colorextractor/v1/extract-presets?uri=${uri}&format=json`);
				vibrant = colors.entries[0].color_swatches.find((color) => color.preset === "VIBRANT_NON_ALARMING").color;
			}
		} catch {
			vibrant = 8747370;
		}

		this.setState({
			colors: {
				background: Utils.convertIntToRGB(vibrant),
				inactive: Utils.convertIntToRGB(vibrant, 3),
			},
		});
	}

	async fetchTempo(uri) {
		const audio = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/audio-features/${uri.split(":")[2]}`);
		let tempo = audio.tempo;

		const MIN_TEMPO = 60;
		const MAX_TEMPO = 150;
		const MAX_PERIOD = 0.4;
		if (!tempo) tempo = 105;
		if (tempo < MIN_TEMPO) tempo = MIN_TEMPO;
		if (tempo > MAX_TEMPO) tempo = MAX_TEMPO;

		let period = MAX_PERIOD - ((tempo - MIN_TEMPO) / (MAX_TEMPO - MIN_TEMPO)) * MAX_PERIOD;
		period = Math.round(period * 100) / 100;

		this.setState({
			tempo: `${String(period)}s`,
		});
	}

	async tryServices(trackInfo, mode = -1) {
		const currentMode = CONFIG.modes[mode] || "";
		let finalData = { ...emptyState, uri: trackInfo.uri };
		for (const id of CONFIG.providersOrder) {
			const service = CONFIG.providers[id];
			if (!service.on) continue;
			if (mode !== -1 && !service.modes.includes(mode)) continue;

			let data;
			try {
				data = await Providers[id](trackInfo);
			} catch (e) {
				continue;
			}

			if (data.error || (!data.karaoke && !data.synced && !data.unsynced)) continue;
			if (mode === -1) {
				finalData = data;
				return finalData;
			}

			if (!data[currentMode]) {
				for (const key in data) {
					if (!finalData[key]) {
						finalData[key] = data[key];
					}
				}
				continue;
			}

			for (const key in data) {
				if (!finalData[key]) {
					finalData[key] = data[key];
				}
			}

			if (data.provider !== "local" && finalData.provider && finalData.provider !== data.provider) {
				const styledMode = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
				finalData.copyright = `${styledMode} lyrics provided by ${data.provider}\n${finalData.copyright || ""}`.trim();
			}


			return finalData;
		}

		return finalData;
	}

	async fetchLyrics(track, mode = -1, refresh = false) {
		try {
			const info = this.infoFromTrack(track);
			if (!info) {
				this.setState({ error: "No track info", isLoading: false });
				return;
			}

		// keep artist/title for prompts
		this.setState({ artist: info.artist, title: info.title });

		let isCached = this.lyricsSaved(info.uri);

		if (CONFIG.visual.colorful || CONFIG.visual["gradient-background"]) {
			this.fetchColors(info.uri);
		}

		this.fetchTempo(info.uri);
		this.resetDelay();

		let tempState;
		// if lyrics are cached
		if ((mode === -1 && CACHE[info.uri]) || CACHE[info.uri]?.[CONFIG.modes?.[mode]]) {
			tempState = { ...CACHE[info.uri], isCached };
			if (CACHE[info.uri]?.mode) {
				this.state.explicitMode = CACHE[info.uri]?.mode;
				tempState = { ...tempState, mode: CACHE[info.uri]?.mode };
			}
		} else {
			// Save current mode before loading to maintain UI consistency
			const currentMode = this.getCurrentMode();
			this.lastModeBeforeLoading = currentMode !== -1 ? currentMode : SYNCED;
			this.setState({ ...emptyState, isLoading: true, isCached: false });

			const resp = await this.tryServices(info, mode);
			if (resp.provider) {
				// Cache lyrics
				CACHE[resp.uri] = resp;
			}

			// This True when the user presses the Cache Lyrics button and saves it to localStorage.
			isCached = this.lyricsSaved(resp.uri);

			// In case user skips tracks too fast and multiple callbacks
			// set wrong lyrics to current track.
			if (resp.uri === this.currentTrackUri) {
				tempState = { ...resp, isLoading: false, isCached };
			} else {
				return;
			}
		}

		let finalMode = mode;
		if (mode === -1) {
			if (this.state.explicitMode !== -1) {
				finalMode = this.state.explicitMode;
			} else if (this.state.lockMode !== -1) {
				finalMode = this.state.lockMode;
			} else {
				// Auto switch: prefer karaoke, then synced, then unsynced
				if (tempState.karaoke) {
					finalMode = KARAOKE;
				} else if (tempState.synced) {
					finalMode = SYNCED;
				} else if (tempState.unsynced) {
					finalMode = UNSYNCED;
				}
			}
		}

		// if song changed one time
		if (tempState.uri !== this.state.uri || refresh) {
			// Detect language from the new lyrics data
			let defaultLanguage = null;
			if (tempState.synced) {
				defaultLanguage = Utils.detectLanguage(tempState.synced);
			} else if (tempState.unsynced) {
				defaultLanguage = Utils.detectLanguage(tempState.unsynced);
			}

			// reset and apply - preserve cached translations if available
			this.setState({
				furigana: null,
				romaji: null,
				hiragana: null,
				katakana: null,
				hangul: null,
				romaja: null,
				cn: null,
				hk: null,
				tw: null,
				...tempState,
				language: defaultLanguage,
				...this.applyTranslationStates(tempState)
			});
			return;
		}

		// Preserve cached translations when not changing songs
		this.setState({
			...tempState,
			...this.applyTranslationStates(tempState)
		});
		} catch (error) {
			this.setState({
				error: `Failed to fetch lyrics: ${error.message}`,
				isLoading: false,
				...emptyState
			});
		}
	}

	lyricsSource(lyricsState, mode) {
		if (!lyricsState) return;

		let lyrics = lyricsState[CONFIG.modes[mode]];
		// Fallback: if the preferred mode has no lyrics, use any available lyrics
		if (!lyrics) {
			lyrics = lyricsState.karaoke || lyricsState.synced || lyricsState.unsynced || null;
			if (!lyrics) {
				this.setState({ currentLyrics: [] });
				return;
			}
		}

		// Clean up any existing progress flags from previous songs
		const currentUri = lyricsState.uri;
		if (this.lastCleanedUri !== currentUri) {
			// Remove all progress flags
			Object.keys(this).forEach(key => {
				if (key.includes(':inProgress')) {
					delete this[key];
				}
			});
			// Reset per-track progressive results and inflight maps
			this._dmResults = {};
			this._inflightGemini = new Map();
			this.lastCleanedUri = currentUri;
		}

		// Handle translation and display modes efficiently
		const originalLanguage = this.provideLanguageCode(lyrics);
		let friendlyLanguage = null;
		
		if (originalLanguage) {
			try {
				friendlyLanguage = new Intl.DisplayNames(["en"], { type: "language" }).of(originalLanguage.split("-")[0])?.toLowerCase();
			} catch (error) {
				// Error ignored
			}
		}
		
		// For Gemini mode, use generic keys if no specific language detected
		const provider = CONFIG.visual["translate:translated-lyrics-source"];
		const modeKey = provider === "geminiKo" && !friendlyLanguage ? "gemini" : friendlyLanguage;
		
		const displayMode1 = CONFIG.visual[`translation-mode:${modeKey}`];
		const displayMode2 = CONFIG.visual[`translation-mode-2:${modeKey}`];

		this.language = originalLanguage;
		this.displayMode = displayMode1; // Keep for legacy compatibility
		this.displayMode2 = displayMode2;

		const processMode = async (mode, baseLyrics) => {
			if (!mode || mode === "none") return null;
			try {
				if (String(mode).startsWith("gemini")) {
					return await this.getGeminiTranslation(lyricsState, baseLyrics, mode);
				} else {
					return await this.getTraditionalConversion(lyricsState, baseLyrics, originalLanguage, mode);
				}
			} catch (error) {
				const modeDisplayName = mode === "gemini_romaji" ? "Romaji, Romaja, Pinyin translation" : "Korean translation";
				Spicetify.showNotification(`${modeDisplayName} failed: ${error.message || "Unknown error"}`, true, 4000);
				return null; // Return null on failure
			}
		};

		const { uri } = lyricsState; // Capture the URI for this specific request

		// If no display modes are active, just optimize the original lyrics (e.g., to handle note lines)
		if ((!displayMode1 || displayMode1 === "none") && (!displayMode2 || displayMode2 === "none")) {
			const optimizedLyrics = this.optimizeTranslations(lyrics, null, null);
			this.setState({ currentLyrics: Array.isArray(optimizedLyrics) ? optimizedLyrics : [] });
			return;
		}

		// Progressive loading: keep results per track so Mode 1 does not disappear when Mode 2 finishes
		this._dmResults[currentUri] = this._dmResults[currentUri] || { mode1: null, mode2: null };
		let lyricsMode1 = this._dmResults[currentUri].mode1;
		let lyricsMode2 = this._dmResults[currentUri].mode2;

		const updateCombinedLyrics = () => {
			// Guard clause to prevent race conditions from previous songs
			if (this.state.uri !== uri) {
				return;
			}
			// Smart deduplication and optimization
			const optimizedTranslations = this.optimizeTranslations(lyrics, lyricsMode1, lyricsMode2);
			this.setState({ currentLyrics: Array.isArray(optimizedTranslations) ? optimizedTranslations : [] });
		};

		// Start both requests, but don't wait for both to finish to update UI
		const promise1 = processMode(displayMode1, lyrics);
		const promise2 = processMode(displayMode2, lyrics);

		promise1.then(result => {
			lyricsMode1 = result;
			this._dmResults[currentUri].mode1 = result;
			updateCombinedLyrics();
		}).catch(error => {
			// Still update UI even if one mode fails
			updateCombinedLyrics();
		});

		promise2.then(result => {
			lyricsMode2 = result;
			this._dmResults[currentUri].mode2 = result;
			updateCombinedLyrics();
		}).catch(error => {
			// Still update UI even if one mode fails
			updateCombinedLyrics();
		});
	}

	/**
	 * Smart optimization for translations - removes duplicates and identical content
	 * @param {Array} originalLyrics - Original lyrics
	 * @param {Array} mode1 - Translation from Display Mode 1
	 * @param {Array} mode2 - Translation from Display Mode 2
	 * @returns {Array} Optimized lyrics with smart deduplication
	 */
	optimizeTranslations(originalLyrics, mode1, mode2) {
		// React 31 방지: 배열 유효성 검사
		if (!originalLyrics || !Array.isArray(originalLyrics)) {
			return [];
		}

		// Helper: note/placeholder-only line (e.g., ♪, …)
		const isNoteLine = (text) => {
			const t = String(text || "").trim();
			if (!t) return true;
			return /^[\s♪♩♫♬·•・。.、…~\-]+$/.test(t);
		};

		// Helper function to normalize text for comparison
		const normalizeForComparison = (text) => {
			if (!text || typeof text !== 'string') return '';
			return text.toLowerCase()
				.replace(/[^\p{L}\p{N}\s]/gu, '') // remove punctuation/symbols but keep letters/numbers of any script
				.replace(/\s+/g, ' ')
				.trim();
		};

		// Helper function to check if two translations are similar (>85% similarity)
		const areTranslationsSimilar = (text1, text2) => {
			if (!text1 || !text2) return false;
			const norm1 = normalizeForComparison(text1);
			const norm2 = normalizeForComparison(text2);
			if (!norm1 || !norm2) return false;
			if (norm1 === norm2) return true;
			const words1 = norm1.split(' ').filter(w => w.length > 2);
			const words2 = norm2.split(' ').filter(w => w.length > 2);
			if (words1.length === 0 || words2.length === 0) return false;
			const commonWords = words1.filter(word => words2.includes(word));
			const similarity = commonWords.length / Math.max(words1.length, words2.length);
			return similarity > 0.85;
		};

		// Process each line to determine what to display
		const processedLyrics = originalLyrics.map((line, i) => {
			// React 31 방지: null/undefined 체크 및 안전한 텍스트 추출
			if (!line) {
				return { text: null, text2: null, originalText: '' };
			}

			// Safely extract original text
			const originalText = (typeof line === 'object') ? (line.text || '') : String(line || '');
			let translation1 = '';
			let translation2 = '';

			// Safely extract translations with boundary check
			if (mode1 && Array.isArray(mode1) && i < mode1.length && mode1[i]) {
				translation1 = (typeof mode1[i] === 'object') ? (mode1[i].text || '') : String(mode1[i] || '');
			}
			if (mode2 && Array.isArray(mode2) && i < mode2.length && mode2[i]) {
				translation2 = (typeof mode2[i] === 'object') ? (mode2[i].text || '') : String(mode2[i] || '');
			}

			// If original is a note/placeholder line, never show sub-lines
			if (isNoteLine(originalText)) {
				return { ...line, originalText, text: null, text2: null };
			}

			// Ignore translations that are notes-only
			if (isNoteLine(translation1)) translation1 = '';
			if (isNoteLine(translation2)) translation2 = '';

			const normalizedOriginal = normalizeForComparison(originalText);
			const normalizedTrans1 = normalizeForComparison(translation1);
			const normalizedTrans2 = normalizeForComparison(translation2);

			const trans1SameAsOriginal = normalizedTrans1 && normalizedTrans1 === normalizedOriginal;
			const trans2SameAsOriginal = normalizedTrans2 && normalizedTrans2 === normalizedOriginal;
			const translationsSame = normalizedTrans1 && normalizedTrans2 &&
				(normalizedTrans1 === normalizedTrans2 || areTranslationsSimilar(translation1, translation2));

			let finalText = null;
			let finalText2 = null;

			if (translationsSame) {
				if (!trans1SameAsOriginal) {
					finalText = translation1 || translation2;
				}
			} else {
				if (!trans1SameAsOriginal && translation1) finalText = translation1;
				if (!trans2SameAsOriginal && translation2) finalText2 = translation2;
				if (!finalText && finalText2) { finalText = finalText2; finalText2 = null; }
			}

			// Create safe line object ensuring all properties are valid
			const safeLine = {
				...(line && typeof line === 'object' ? line : {}),
				originalText: String(originalText),
				text: finalText ? String(finalText) : null,
				text2: finalText2 ? String(finalText2) : null
			};

			return safeLine;
		});

		return processedLyrics;
	}

	getGeminiTranslation(lyricsState, lyrics, mode) {
		return(new Promise((resolve, reject) => {
			const viKey = StorageManager.getPersisted(`${APP_NAME}:visual:gemini-api-key`);
			const romajiKey = StorageManager.getPersisted(`${APP_NAME}:visual:gemini-api-key-romaji`);
			
			// Determine mode type and API key
			let wantSmartPhonetic = false;
			let apiKey;
			
			if (mode === "gemini_romaji") {
				// Use Smart Phonetic logic for the unified Romaji, Romaja, Pinyin button
				wantSmartPhonetic = true;
				apiKey = "no";
			} else {
				// Default to Korean
				apiKey = "no";
			}

			if (!apiKey || !Array.isArray(lyrics) || lyrics.length === 0) {
				return reject(new Error("Gemini API key missing. Please add at least one key in Settings."));
			}

			const cacheKey = mode;
			const cacheKey2 = `${lyricsState.uri}:${cacheKey}`;
			const cached = CacheManager.get(cacheKey2);

			if (cached) return resolve(cached);

			// De-duplicate concurrent calls per (uri, type). Share the same promise for callers
			const inflightKey = `${lyricsState.uri}:${cacheKey}`;
			if (this._inflightGemini?.has(inflightKey)) {
				return this._inflightGemini.get(inflightKey).then(resolve).catch(reject);
			}

			// Use optimized rate limiter with separate keys for each translation type
			const rateLimitKey = mode.replace('gemini_', 'gemini-');
			if (!RateLimiter.canMakeCall(rateLimitKey, 5, 2000)) {
				const modeName = mode === "gemini_romaji" ? "Romaji, Romaja, Pinyin" : "Korean";
				return reject(new Error(`${modeName} 번역 요청이 너무 많습니다. 1분 뒤, 다시시도해주세요.`));
			}

			// Filter out section headers before sending to Gemini for translation
			const allLines = lyrics.map((l) => l?.text || "").filter(Boolean);
			const nonSectionLines = allLines.filter(line => !Utils.isSectionHeader(line));
			const text = nonSectionLines.join("\n");

			// Start translation loading indicator (1초 후 표시)
			this.startTranslationLoading();

			const inflightPromise = Translator.callGemini({ 
				apiKey, 
				artist: this.state.artist || lyricsState.artist, 
				title: this.state.title || lyricsState.title, 
				text, 
				wantSmartPhonetic,
				provider: lyricsState.provider
			})
				.then((response) => {
					let outText;
					if (wantSmartPhonetic) {
						outText = response.phonetic;
					} else {
						outText = response.vi;
					}
					
					if (!outText) throw new Error("Empty result from Gemini.");
					
					// Handle both array and string formats
					let lines;
					if (Array.isArray(outText)) {
						lines = outText;
					} else if (typeof outText === 'string') {
						lines = outText.split("\n");
					} else {
						throw new Error("Invalid translation format received from Gemini.");
					}
					
					// Create mapping arrays for proper alignment
					const originalNonSectionLines = [];
					const originalNonSectionIndices = [];
					
					// Collect non-section lines from original lyrics (excluding empty lines)
					lyrics.forEach((line, i) => {
						const text = line?.text || "";
						if (!Utils.isSectionHeader(text) && text.trim() !== "") {
							originalNonSectionLines.push(text);
							originalNonSectionIndices.push(i);
						}
					});
					
					// Filter out section headers and empty lines from translation results
					const cleanTranslationLines = lines.filter(line => 
						line && 
						line.trim() !== "" && 
						!Utils.isSectionHeader(line.trim())
					);
					
					// Use the clean translation lines for mapping
					lines = cleanTranslationLines;
					
					// Smart mapping that accounts for section headers and empty lines
					const mapped = lyrics.map((line, i) => {
						const originalText = line?.text || "";
						
						// If this is a section header, keep original and don't show translation
						if (Utils.isSectionHeader(originalText)) {
							return {
								...line,
								text: null,
								originalText: originalText,
							};
						}
						
						// If this is an empty line, keep it empty
						if (originalText.trim() === "") {
							return {
								...line,
								text: "",
								originalText: originalText,
							};
						}
						
						// Find the translation index for this non-section, non-empty line
						const positionInNonSectionLines = originalNonSectionIndices.indexOf(i);
						const translatedText = lines[positionInNonSectionLines]?.trim() || "";
						
						return {
							...line,
							text: translatedText || line?.text || "",
							originalText: originalText,
						};
					});
					CacheManager.set(cacheKey2, mapped);
					return mapped;
				})
				.finally(() => {
					this.clearTranslationLoading();
					this._inflightGemini = this._inflightGemini || new Map();
					this._inflightGemini?.delete(inflightKey);
				});

			this._inflightGemini = this._inflightGemini || new Map();
			this._inflightGemini.set(inflightKey, inflightPromise);
			inflightPromise.then(resolve).catch(reject);
		}));
	}

	getTraditionalConversion(lyricsState, lyrics, language, displayMode) {
		return new Promise((resolve, reject) => {
			if (!Array.isArray(lyrics)) return reject(new Error("Invalid lyrics format for conversion."));

			const cacheKey = `${lyricsState.uri}:trad:${language}:${displayMode}`;
			const cached = CacheManager.get(cacheKey);
			if (cached) return resolve(cached);

			// De-duplicate concurrent calls per (uri, language, mode)
			this._inflightTrad = this._inflightTrad || new Map();
			const inflightKey = `${lyricsState.uri}:trad:${language}:${displayMode}`;
			if (this._inflightTrad.has(inflightKey)) {
				return this._inflightTrad.get(inflightKey).then(resolve).catch(reject);
			}

			// Start translation loading indicator (1초 후 표시)
			this.startTranslationLoading();

			const inflightPromise = this.translateLyrics(language, lyrics, displayMode)
				.then((translated) => {
					if (translated !== undefined && translated !== null) {
						CacheManager.set(cacheKey, translated);
						return translated;
					}
					throw new Error("Empty result from conversion.");
				})
				.finally(() => {
					this.clearTranslationLoading();
					this._inflightTrad.delete(inflightKey);
				});

			this._inflightTrad.set(inflightKey, inflightPromise);
			inflightPromise.then(resolve).catch(reject);
		});
	}

	provideLanguageCode(lyrics) {
		if (!lyrics) return null;

		const provider = CONFIG.visual["translate:translated-lyrics-source"];
		
		// For Gemini API, always detect language from lyrics (no override needed)
		if (provider === "geminiKo") {
			// If we have a cached language in state, use it
			if (this.state.language) {
				return this.state.language;
			}
			
			// Otherwise, detect language from lyrics
			const detectedLanguage = Utils.detectLanguage(lyrics);
			
			return detectedLanguage;
		}
		
		// For Kuromoji mode, use language override if set
		if (CONFIG.visual["translate:detect-language-override"] !== "off") {
			const overrideLanguage = CONFIG.visual["translate:detect-language-override"];
			return overrideLanguage;
		}
		
		// If we have a cached language in state, use it
		if (this.state.language) {
			return this.state.language;
		}
		
		// Otherwise, detect language from lyrics
		const detectedLanguage = Utils.detectLanguage(lyrics);
		
		return detectedLanguage;
	}

	async translateLyrics(language, lyrics, targetConvert) {
		if (!language || !Array.isArray(lyrics) || String(targetConvert).startsWith("gemini")) {
			return lyrics;
		}

		if (!this.translator) {
			this.translator = new Translator(language);
		}
		await this.translator.awaitFinished(language);

		let result;
		try {
			if (language === "ja") {
				// Japanese
				const map = {
					romaji: { target: "romaji", mode: "spaced" },
					furigana: { target: "hiragana", mode: "furigana" },
					hiragana: { target: "hiragana", mode: "normal" },
					katakana: { target: "katakana", mode: "normal" },
				};

				if (!map[targetConvert]) return lyrics;

				result = await Promise.all(
					lyrics.map(async (lyric) => await this.translator.romajifyText(lyric?.text || "", map[targetConvert].target, map[targetConvert].mode))
				);
			} else if (language === "ko") {
				// Korean
				if (targetConvert !== "romaja") return lyrics;
				result = await Promise.all(lyrics.map(async (lyric) => await this.translator.convertToRomaja(lyric?.text || "", targetConvert)));
			} else if (language === "zh-hans") {
				// Chinese (Simplified)
				if (targetConvert === "pinyin") {
					result = await Promise.all(
						lyrics.map(async (lyric) => await this.translator.convertToPinyin(lyric?.text || "", { toneType: "mark", type: "string" }))
					);
					// Warn if pinyin conversion produced no visible changes (likely CDN blocked -> fallback)
					const anyChanged = lyrics.some((lyric, i) => (result?.[i] ?? "") !== (lyric?.text || ""));
					if (!anyChanged) {
						Spicetify.showNotification("Pinyin library unavailable. Showing original. Allow jsDelivr or unpkg.", true, 4000);
					}
				} else {
					const map = {
						cn: { from: "cn", target: "cn" },
						tw: { from: "cn", target: "tw" },
						hk: { from: "cn", target: "hk" },
					};

					// prevent conversion between the same language.
					if (targetConvert === "cn") {
						Spicetify.showNotification("Conversion skipped: Already in Simplified Chinese", false, 2000);
						return lyrics;
					}

					result = await Promise.all(
						lyrics.map(async (lyric) => await this.translator.convertChinese(lyric?.text || "", map[targetConvert].from, map[targetConvert].target))
					);
				}
			} else if (language === "zh-hant") {
				// Chinese (Traditional)
				if (targetConvert === "pinyin") {
					result = await Promise.all(
						lyrics.map(async (lyric) => await this.translator.convertToPinyin(lyric?.text || "", { toneType: "mark", type: "string" }))
					);
					// Warn if pinyin conversion produced no visible changes (likely CDN blocked -> fallback)
					const anyChanged = lyrics.some((lyric, i) => (result?.[i] ?? "") !== (lyric?.text || ""));
					if (!anyChanged) {
						Spicetify.showNotification("Pinyin library unavailable. Showing original. Allow jsDelivr or unpkg.", true, 4000);
					}
				} else {
					const map = {
						cn: { from: "t", target: "cn" },
						hk: { from: "t", target: "hk" },
						tw: { from: "t", target: "tw" },
					};

					if (!map[targetConvert]) return lyrics;

					// Allow conversion from Traditional Chinese to different variants/simplified
					result = await Promise.all(
						lyrics.map(async (lyric) => await this.translator.convertChinese(lyric?.text || "", map[targetConvert].from, map[targetConvert].target))
					);
				}
			}

			const res = Utils.processTranslatedLyrics(result, lyrics);
			Spicetify.showNotification("✓ Conversion completed successfully", false, 2000);
			return res;
		} catch (error) {
			Spicetify.showNotification(`Conversion failed: ${error.message || "Unknown error"}`, true, 3000);
		}
	}

	resetDelay() {
		CONFIG.visual.delay = Number(localStorage.getItem(`lyrics-delay:${Spicetify.Player.data.item.uri}`)) || 0;
	}


	// Helper method to get translation states for saving/restoring
	getTranslationStates() {
		return {
			romaji: this.state.romaji,
			furigana: this.state.furigana,
			hiragana: this.state.hiragana,
			katakana: this.state.katakana,
			hangul: this.state.hangul,
			romaja: this.state.romaja,
			cn: this.state.cn,
			hk: this.state.hk,
			tw: this.state.tw,
			currentLyrics: this.state.currentLyrics,
			language: this.state.language
		};
	}

	// Helper method to apply translation states
	applyTranslationStates(states, additional = {}) {
		return {
			...additional,
			...(states.romaji && { romaji: states.romaji }),
			...(states.furigana && { furigana: states.furigana }),
			...(states.hiragana && { hiragana: states.hiragana }),
			...(states.katakana && { katakana: states.katakana }),
			...(states.hangul && { hangul: states.hangul }),
			...(states.romaja && { romaja: states.romaja }),
			...(states.cn && { cn: states.cn }),
			...(states.hk && { hk: states.hk }),
			...(states.tw && { tw: states.tw }),
			...(states.currentLyrics && { currentLyrics: states.currentLyrics }),
			...(states.language && { language: states.language })
		};
	}

	saveLocalLyrics(uri, lyrics) {
		// Include translations and phonetic conversions in cache
		const fullLyricsData = {
			...lyrics,
			...this.getTranslationStates()
		};

		const localLyrics = JSON.parse(localStorage.getItem(`${APP_NAME}:local-lyrics`)) || {};
		localLyrics[uri] = fullLyricsData;
		localStorage.setItem(`${APP_NAME}:local-lyrics`, JSON.stringify(localLyrics));
		this.setState({ isCached: true });
	}

	deleteLocalLyrics(uri) {
		const localLyrics = JSON.parse(localStorage.getItem(`${APP_NAME}:local-lyrics`)) || {};
		delete localLyrics[uri];
		localStorage.setItem(`${APP_NAME}:local-lyrics`, JSON.stringify(localLyrics));
		this.setState({ isCached: false });
	}

	lyricsSaved(uri) {
		const localLyrics = JSON.parse(localStorage.getItem(`${APP_NAME}:local-lyrics`)) || {};
		return !!localLyrics[uri];
	}

	resetTranslationCache(uri) {
		// Clear translation cache for this URI
		const clearedCount = CacheManager.clearByUri(uri);
		
		// Clear progressive results for this track
		if (this._dmResults && this._dmResults[uri]) {
			delete this._dmResults[uri];
		}
		
		// Clear inflight Gemini requests for this track
		if (this._inflightGemini) {
			const keysToDelete = [];
			for (const [key] of this._inflightGemini) {
				if (key.includes(uri)) {
					keysToDelete.push(key);
				}
			}
			keysToDelete.forEach(key => this._inflightGemini.delete(key));
		}
		
		// Check if there are any translations to reset
		const hasTranslations = this.state.romaji || this.state.furigana || this.state.hiragana ||
			this.state.katakana || this.state.hangul || this.state.romaja ||
			this.state.cn || this.state.hk || this.state.tw;
		
		// Reset translation states
		this.setState({
			romaji: null,
			furigana: null,
			hiragana: null,
			katakana: null,
			hangul: null,
			romaja: null,
			cn: null,
			hk: null,
			tw: null,
		});
		
		// Force re-process lyrics with current display modes
		const currentMode = this.getCurrentMode();
		this.lyricsSource(this.state, currentMode);
		
		if (hasTranslations) {
			Spicetify.showNotification(`✓ Reset ${clearedCount} translation cache entries`, false, 2000);
		} else {
			Spicetify.showNotification("✓ Translation cache cleared (no translations found)", false, 2000);
		}
	}

	processLyricsFromFile(event) {
		const file = event.target.files;
		if (!file.length) return;
		const reader = new FileReader();

		if (file[0].size > 1024 * 1024) {
			Spicetify.showNotification("File too large: Maximum size is 1MB", true, 3000);
			return;
		}

		reader.onload = (e) => {
			try {
				const localLyrics = Utils.parseLocalLyrics(e.target.result);
				const parsedKeys = Object.keys(localLyrics)
					.filter((key) => localLyrics[key])
					.map((key) => key[0].toUpperCase() + key.slice(1))
					.map((key) => `<strong>${key}</strong>`);

				if (!parsedKeys.length) {
					Spicetify.showNotification("No valid lyrics found in file", true, 3000);
					return;
				}

				this.setState({
					...localLyrics,
					provider: "local",
					...this.applyTranslationStates(localLyrics)
				});
				CACHE[this.currentTrackUri] = { ...localLyrics, provider: "local", uri: this.currentTrackUri };
				this.saveLocalLyrics(this.currentTrackUri, localLyrics);

				Spicetify.showNotification(`✓ Successfully loaded ${parsedKeys.join(", ")} lyrics from file`, false, 3000);
			} catch (e) {
				Spicetify.showNotification("Failed to load lyrics: Invalid file format", true, 3000);
			}
		};

		reader.onerror = (e) => {
			Spicetify.showNotification("Failed to read file: File may be corrupted", true, 3000);
		};

		reader.readAsText(file[0]);
		event.target.value = "";
	}
	initMoustrap() {
		if (!this.mousetrap && Spicetify.Mousetrap) {
			this.mousetrap = new Spicetify.Mousetrap();
		}
	}

	componentDidMount() {
		// Prevent duplicate global registration
		if (window.lyricContainer && window.lyricContainer !== this) {
			if (typeof window.lyricContainer.componentWillUnmount === 'function') {
				window.lyricContainer.componentWillUnmount();
			}
		}

		// Register instance for external access
		window.lyricContainer = this;

		// Cache DOM elements to avoid repeated queries
		this._domCache = {
			viewport: null,
			fadContainer: null,
			fileInput: null
		};

		// Check for updates when app starts
		setTimeout(() => {
			Utils.showUpdateNotificationIfAvailable().catch(error => {
				// Error ignored
			});
		}, 3000); // Delay to avoid interfering with app startup

		// Initialize enhanced cache system only once
		if (!CacheManager._initialized) {
			CacheManager.init();
			CacheManager._initialized = true;
		}
		
		this.onQueueChange = async ({ data: queue }) => {
			this.state.explicitMode = this.state.lockMode;
			this.currentTrackUri = queue.current.uri;
			this.fetchLyrics(queue.current, this.state.explicitMode);
			this.viewPort.scrollTo(0, 0);

			// Fetch next track
			const nextTrack = queue.queued?.[0] || queue.nextUp?.[0];
			const nextInfo = this.infoFromTrack(nextTrack);
			// Debounce next track fetch
			if (!nextInfo || nextInfo.uri === this.nextTrackUri) return;
			this.nextTrackUri = nextInfo.uri;
			this.tryServices(nextInfo, this.state.explicitMode).then((resp) => {
				if (resp.provider) {
					// Cache lyrics
					CACHE[resp.uri] = resp;
				}
			});
		};

		if (Spicetify.Player?.data?.item) {
			this.state.explicitMode = this.state.lockMode;
			this.currentTrackUri = Spicetify.Player.data.item.uri;
			this.fetchLyrics(Spicetify.Player.data.item, this.state.explicitMode);
		}

		this.updateVisualOnConfigChange();
		Utils.addQueueListener(this.onQueueChange);

		lyricContainerUpdate = () => {
			this.reRenderLyricsPage = !this.reRenderLyricsPage;
			this.updateVisualOnConfigChange();
			this.forceUpdate();
		};

		reloadLyrics = () => {
			CACHE = {};
			this.updateVisualOnConfigChange();
			this.forceUpdate();
			this.fetchLyrics(Spicetify.Player.data.item, this.state.explicitMode, true);
		};

		// Cache viewport element for better performance
		this.viewPort = this._domCache?.viewport ??
			(this._domCache && (this._domCache.viewport = document.querySelector(".Root__main-view .os-viewport") ??
			document.querySelector(".Root__main-view .main-view-container__scroll-node")));

		this.configButton = new Spicetify.Menu.Item("Lyrics Plus config", false, openConfig, "lyrics");
		this.configButton.register();

		// Throttled font size change to improve performance
		let fontSizeChangeTimeout = null;
		this.onFontSizeChange = (event) => {
			if (!event.ctrlKey) return;

			// Prevent too frequent updates
			if (fontSizeChangeTimeout) return;

			fontSizeChangeTimeout = setTimeout(() => {
				fontSizeChangeTimeout = null;
			}, 50); // 50ms throttle

			const dir = event.deltaY < 0 ? 1 : -1;
			let temp = CONFIG.visual["font-size"] + dir * fontSizeLimit.step;
			if (temp < fontSizeLimit.min) {
				temp = fontSizeLimit.min;
			} else if (temp > fontSizeLimit.max) {
				temp = fontSizeLimit.max;
			}
			CONFIG.visual["font-size"] = temp;
			StorageManager.saveConfig("font-size", temp);
			lyricContainerUpdate();
		};

		this.toggleFullscreen = () => {
			const isEnabled = !this.state.isFullscreen;
			if (isEnabled) {
				document.body.append(this.fullscreenContainer);
				document.documentElement.requestFullscreen();
				this.mousetrap.bind("esc", this.toggleFullscreen);
			} else {
				this.fullscreenContainer.remove();
				document.exitFullscreen();
				this.mousetrap.unbind("esc");
			}

			this.setState({
				isFullscreen: isEnabled,
			});
		};
		this.mousetrap.reset();
		this.mousetrap.bind(CONFIG.visual["fullscreen-key"], this.toggleFullscreen);
		window.addEventListener("fad-request", lyricContainerUpdate);
	}

	componentWillUnmount() {
		// Core cleanup
		Utils.removeQueueListener(this.onQueueChange);
		this.configButton?.deregister();
		this.mousetrap?.reset();
		window.removeEventListener("fad-request", lyricContainerUpdate);

		// Clean up translation loading timer
		this.clearTranslationLoading();

		// Clean up cache system
		CacheManager.clear();

		// Clear DOM cache
		if (this._domCache) {
			this._domCache = null;
		}

		// Clean up global references
		if (window.lyricContainer === this) {
			delete window.lyricContainer;
		}

		// Clean up performance monitoring
		if (window.lyricsPerformance) {
			delete window.lyricsPerformance;
		}

		// Clean up inflight requests
		if (this._inflightGemini) {
			this._inflightGemini.clear();
			this._inflightGemini = null;
		}

		if (this._inflightTrad) {
			this._inflightTrad.clear();
			this._inflightTrad = null;
		}

		// Clean up progressive results
		if (this._dmResults) {
			this._dmResults = null;
		}

		// Force garbage collection hint
		if (window.gc && typeof window.gc === 'function') {
			setTimeout(() => window.gc(), 100);
		}
	}

	updateVisualOnConfigChange() {
		this.availableModes = CONFIG.modes.filter((_, id) => {
			return Object.values(CONFIG.providers).some((p) => p.on && p.modes.includes(id));
		});

		if (!CONFIG.visual.colorful) {
			this.styleVariables = {
				"--lyrics-color-active": CONFIG.visual["active-color"],
				"--lyrics-color-inactive": CONFIG.visual["inactive-color"],
				"--lyrics-color-background": CONFIG.visual["background-color"],
				"--lyrics-highlight-background": CONFIG.visual["highlight-color"],
				"--lyrics-background-noise": CONFIG.visual.noise ? "var(--background-noise)" : "unset",
			};
		} else if (CONFIG.visual.colorful) {
			this.styleVariables = {
				"--lyrics-color-active": "white",
				"--lyrics-color-inactive": "rgba(255, 255, 255, 0.7)",
				"--lyrics-color-background": this.state.colors.background || "transparent",
				"--lyrics-highlight-background": this.state.colors.inactive,
				"--lyrics-background-noise": CONFIG.visual.noise ? "var(--background-noise)" : "unset",
			};
		}

		this.styleVariables = {
			...this.styleVariables,
			"--lyrics-align-text": CONFIG.visual.alignment,
			"--lyrics-font-size": `${CONFIG.visual["font-size"]}px`,
			"--animation-tempo": this.state.tempo,
		};

		this.mousetrap.reset();
		this.mousetrap.bind(CONFIG.visual["fullscreen-key"], this.toggleFullscreen);
	}

	getCurrentMode() {
		let mode = -1;
		if (this.state.explicitMode !== -1) {
			mode = this.state.explicitMode;
		} else if (this.state.lockMode !== -1) {
			mode = this.state.lockMode;
		} else {
			// Auto switch: prefer karaoke, then synced, then unsynced
			if (this.state.karaoke) {
				mode = KARAOKE;
			} else if (this.state.synced) {
				mode = SYNCED;
			} else if (this.state.unsynced) {
				mode = UNSYNCED;
			}
		}
		return mode;
	}

	render() {
		// Enhanced FAD container detection - try multiple selectors if main one fails
		let fadLyricsContainer = this._domCache?.fadContainer;
		
		if (!fadLyricsContainer || !document.contains(fadLyricsContainer)) {
			// Try main selector first
			fadLyricsContainer = document.getElementById("fad-lyrics-plus-container");
			
			// If not found, try alternative selectors for FAD extension
			if (!fadLyricsContainer) {
				const altSelectors = [
					"[data-fad-lyrics]",
					".fad-lyrics-container"
				];
				
				for (const selector of altSelectors) {
					const element = document.querySelector(selector);
					if (element) {
						fadLyricsContainer = element;
						break;
					}
				}
			}
			
			// Cache the result
			if (this._domCache) {
				this._domCache.fadContainer = fadLyricsContainer;
			}
		}
		
		this.state.isFADMode = !!fadLyricsContainer;

		if (this.state.isFADMode) {
			// Text colors will be set by FAD extension
			this.styleVariables = {};
		} else if (CONFIG.visual.colorful && this.state.colors.background) {
			const isLight = Utils.isColorLight(this.state.colors.background);
			this.styleVariables = {
				"--lyrics-color-active": isLight ? "black" : "white",
				"--lyrics-color-inactive": isLight ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)",
				"--lyrics-color-background": this.state.colors.background,
				"--lyrics-highlight-background": this.state.colors.inactive,
				"--lyrics-background-noise": CONFIG.visual.noise ? "var(--background-noise)" : "unset",
			};
		}

		const backgroundStyle = {};
		if (CONFIG.visual["gradient-background"] && this.state.colors.background) {
			const brightness = CONFIG.visual["background-brightness"] / 100;
			backgroundStyle.backgroundColor = this.state.colors.background;
			backgroundStyle.filter = `brightness(${brightness})`;
		}

		// Helper function to convert hex color with opacity
		const hexToRgba = (hex, opacity) => {
			const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			if (result) {
				const r = parseInt(result[1], 16);
				const g = parseInt(result[2], 16);
				const b = parseInt(result[3], 16);
				return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
			}
			return hex;
		};

		// Build text shadow CSS value
		const shadowColor = hexToRgba(CONFIG.visual["text-shadow-color"], CONFIG.visual["text-shadow-opacity"]);
		const textShadow = CONFIG.visual["text-shadow-enabled"]
			? `0 0 ${CONFIG.visual["text-shadow-blur"]}px ${shadowColor}`
			: "none";

		this.styleVariables = {
			...this.styleVariables,
			"--lyrics-align-text": CONFIG.visual.alignment,
			"--lyrics-font-size": `${CONFIG.visual["font-size"]}px`,
			"--lyrics-original-font-weight": CONFIG.visual["original-font-weight"],
			"--lyrics-original-font-size": `${CONFIG.visual["original-font-size"]}px`,
			"--lyrics-translation-font-weight": CONFIG.visual["translation-font-weight"],
			"--lyrics-translation-font-size": `${CONFIG.visual["translation-font-size"]}px`,
			"--lyrics-line-spacing": `${CONFIG.visual["line-spacing"] || 8}px`,
			"--lyrics-text-shadow": textShadow,
			"--lyrics-original-opacity": CONFIG.visual["original-opacity"] / 100,
			"--lyrics-translation-opacity": CONFIG.visual["translation-opacity"] / 100,
			"--animation-tempo": this.state.tempo,
		};

		let mode = this.getCurrentMode();

		let activeItem;
		let showTranslationButton;

		// Get current display modes to track changes
		const originalLanguage = this.provideLanguageCode(this.state.currentLyrics);
		const friendlyLanguage = originalLanguage && new Intl.DisplayNames(["en"], { type: "language" }).of(originalLanguage.split("-")[0])?.toLowerCase();
		
		// For Gemini mode, use generic keys if no specific language detected
		const provider = CONFIG.visual["translate:translated-lyrics-source"];
		const modeKey = provider === "geminiKo" && !friendlyLanguage ? "gemini" : friendlyLanguage;
		
		const displayMode1 = CONFIG.visual[`translation-mode:${modeKey}`];
		const displayMode2 = CONFIG.visual[`translation-mode-2:${modeKey}`];
		const currentModeKey = `${mode}_${displayMode1 || 'none'}_${displayMode2 || 'none'}`;

		// Only call lyricsSource on state/mode/translation changes, not every render
		if (this.lastProcessedUri !== this.state.uri || this.lastProcessedMode !== currentModeKey) {
			this.lastProcessedUri = this.state.uri;
			this.lastProcessedMode = currentModeKey;
		this.lyricsSource(this.state, mode);
		}
		const hasTranslation = false;

		// Always render the Conversions button on synced/unsynced pages.
		// Previously it was gated by detected language/loading state, causing it to
		// be hidden on initial load or for non-target languages (e.g., English).
		const potentialMode = this.state.explicitMode !== -1 ? this.state.explicitMode :
			this.state.lockMode !== -1 ? this.state.lockMode : 
			(this.state.isLoading ? (this.lastModeBeforeLoading || SYNCED) : mode);
		
		showTranslationButton = (potentialMode === KARAOKE || potentialMode === SYNCED || potentialMode === UNSYNCED || mode === -1);

		if (mode !== -1) {

			if (mode === KARAOKE && this.state.karaoke) {
				activeItem = react.createElement(SyncedLyricsPage, {
					trackUri: this.state.uri,
					lyrics: Array.isArray(this.state.currentLyrics) ? this.state.currentLyrics : this.state.karaoke,
					provider: this.state.provider,
					copyright: this.state.copyright,
					isKara: true,
					reRenderLyricsPage: this.reRenderLyricsPage,
				});
			} else if (mode === SYNCED && this.state.synced) {
				activeItem = react.createElement(CONFIG.visual["synced-compact"] ? SyncedLyricsPage : SyncedExpandedLyricsPage, {
					trackUri: this.state.uri,
					lyrics: Array.isArray(this.state.currentLyrics) ? this.state.currentLyrics : [],
					provider: this.state.provider,
					copyright: this.state.copyright,
					reRenderLyricsPage: this.reRenderLyricsPage,
				});
			} else if (mode === UNSYNCED && this.state.unsynced) {
				activeItem = react.createElement(UnsyncedLyricsPage, {
					trackUri: this.state.uri,
					lyrics: Array.isArray(this.state.currentLyrics) ? this.state.currentLyrics : [],
					provider: this.state.provider,
					copyright: this.state.copyright,
					reRenderLyricsPage: this.reRenderLyricsPage,
				});
			}
		}

		if (!activeItem) {
			activeItem = react.createElement(
				"div",
				{
					className: "lyrics-lyricsContainer-LyricsUnavailablePage",
				},
				react.createElement(
					"span",
					{
						className: "lyrics-lyricsContainer-LyricsUnavailableMessage",
					},
					this.state.isLoading ? LoadingIcon : "(• _ • )"
				)
			);
		}

		this.state.mode = mode;

		const topBarProps = {
			links: CONFIG.modes,
			activeLink: CONFIG.modes[mode] || CONFIG.modes[0],
			lockLink: CONFIG.locked !== -1 ? CONFIG.modes[CONFIG.locked] : null,
			switchCallback: (selectedMode) => {
				const modeIndex = CONFIG.modes.indexOf(selectedMode);
				if (modeIndex !== -1) {
					this.switchTo(modeIndex);
				}
			},
			lockCallback: (selectedMode) => {
				const modeIndex = CONFIG.modes.indexOf(selectedMode);
				if (modeIndex !== -1) {
					this.lockIn(modeIndex);
				}
			}
		};

	const topBarContent = typeof TopBarContent === "function"
		? react.createElement(TopBarContent, topBarProps)
		: null;		const out = react.createElement(
			"div",
			{
				className: `lyrics-lyricsContainer-LyricsContainer${CONFIG.visual["fade-blur"] ? " blur-enabled" : ""}${
					fadLyricsContainer ? " fad-enabled" : ""
				}`,
				style: this.styleVariables,
				ref: (el) => {
					if (!el) return;
					el.onmousewheel = this.onFontSizeChange;
				},
			},
			// Tab bar for mode switching
			topBarContent,
			react.createElement("div", {
				id: "lyrics-plus-gradient-background",
				style: backgroundStyle,
			}),
			react.createElement("div", {
				className: "lyrics-lyricsContainer-LyricsBackground",
			}),
			// Translation loading indicator
			this.state.isTranslationLoading &&
				react.createElement(
					"div",
					{
						className: "lyrics-translation-loading-indicator",
					},
					react.createElement(
						"div",
						{
							className: "lyrics-translation-loading-content",
						},
						react.createElement("div", {
							className: "lyrics-translation-loading-spinner",
						}),
						react.createElement("span", null, "번역을 요청하고 있습니다. 30초 정도 소요됩니다")
					)
				),
			react.createElement(
				"div",
				{
					className: "lyrics-config-button-container",
				},
				showTranslationButton &&
					react.createElement(TranslationMenu, {
						friendlyLanguage,
						hasTranslation: {},
					}),
				react.createElement(SettingsMenu),
				react.createElement(
					Spicetify.ReactComponent.TooltipWrapper,
					{
						label: this.state.isCached ? "Lyrics cached" : "Cache lyrics",
					},
					react.createElement(
						"button",
						{
							className: "lyrics-config-button",
							onClick: () => {
								const { synced, unsynced, karaoke } = this.state;
								if (!synced && !unsynced && !karaoke) {
									Spicetify.showNotification("No lyrics available to cache", true, 2000);
									return;
								}

								if (this.state.isCached) {
									this.deleteLocalLyrics(this.currentTrackUri);
									Spicetify.showNotification("✓ Lyrics cache deleted", false, 2000);
								} else {
									this.saveLocalLyrics(this.currentTrackUri, { synced, unsynced, karaoke });
									Spicetify.showNotification("✓ Lyrics cached successfully", false, 2000);
								}
							},
						},
						react.createElement("svg", {
							width: 16,
							height: 16,
							viewBox: "0 0 16 16",
							fill: "currentColor",
							dangerouslySetInnerHTML: {
								__html: Spicetify.SVGIcons[this.state.isCached ? "downloaded" : "download"],
							},
						})
					)
				),
				react.createElement(
					Spicetify.ReactComponent.TooltipWrapper,
					{
						label: "Load lyrics from file",
					},
					react.createElement(
						"button",
						{
							className: "lyrics-config-button",
							onClick: () => {
								const fileInput = this._domCache?.fileInput ??
									(this._domCache && (this._domCache.fileInput = document.getElementById("lyrics-file-input")));
								fileInput?.click();
							},
						},
						react.createElement("input", {
							type: "file",
							id: "lyrics-file-input",
							accept: ".lrc,.txt",
							onChange: this.processLyricsFromFile.bind(this),
							style: {
								display: "none",
							},
						}),
						react.createElement("svg", {
							width: 16,
							height: 16,
							viewBox: "0 0 16 16",
							fill: "currentColor",
							dangerouslySetInnerHTML: {
								__html: Spicetify.SVGIcons["plus-alt"],
							},
						})
					)
				),
				// Reset Translation button - show when there are lyrics and potential translations
				(() => {
					const hasLyrics = this.state.synced || this.state.unsynced;
					return hasLyrics;
				})() &&
				react.createElement(
					Spicetify.ReactComponent.TooltipWrapper,
					{
						label: "Reset translation cache",
					},
					react.createElement(
						"button",
						{
							className: "lyrics-config-button",
							onClick: () => {
								this.resetTranslationCache(this.currentTrackUri);
							},
						},
						react.createElement("svg", {
							width: 16,
							height: 16,
							viewBox: "0 0 16 16",
							fill: "currentColor",
							dangerouslySetInnerHTML: {
								__html: Spicetify.SVGIcons["x"] || Spicetify.SVGIcons["close"] || Spicetify.SVGIcons["cross"] ||
								// Simple X icon as fallback for reset
								'<path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>',
							},
						})
					)
				)
			),
			activeItem
		);

		const dom = ensureReactDOM();
		if (this.state.isFullscreen && dom?.createPortal && this.fullscreenContainer) {
			return dom.createPortal(out, this.fullscreenContainer);
		}
		if (fadLyricsContainer && dom?.createPortal) {
			return dom.createPortal(out, fadLyricsContainer);
		}
		return out;
	}

	switchTo(mode) {
		this.setState({ explicitMode: mode });
		this.fetchLyrics();
	}

		lockIn(mode) {
		CONFIG.locked = mode;
		localStorage.setItem("lyrics-plus:lock-mode", mode.toString());
		this.setState({ lockMode: mode });
		this.fetchLyrics();
	}
}
