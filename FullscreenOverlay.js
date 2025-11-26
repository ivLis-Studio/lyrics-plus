// Fullscreen Overlay Component - Enhanced UI/UX
const FullscreenOverlay = (() => {
    const react = Spicetify.React;
    const { useState, useEffect, useCallback, useRef } = react;

    // Format time helper (ms to mm:ss)
    const formatTime = (ms) => {
        if (!ms || ms < 0) return "0:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Format current time helper
    const formatClock = (date, showSeconds = false) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        if (showSeconds) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // Clock Component
    const Clock = ({ show, showSeconds = false, size = 48 }) => {
        const [time, setTime] = useState(new Date());

        useEffect(() => {
            if (!show) return;
            const interval = showSeconds ? 1000 : 1000;
            const timer = setInterval(() => setTime(new Date()), interval);
            return () => clearInterval(timer);
        }, [show, showSeconds]);

        if (!show) return null;

        return react.createElement("div", { 
            className: "fullscreen-clock",
            style: { fontSize: `${size}px` }
        },
            formatClock(time, showSeconds)
        );
    };

    // Context Info Component (Playlist/Album name)
    const ContextInfo = ({ show, showImage = true }) => {
        const [contextName, setContextName] = useState("");
        const [contextType, setContextType] = useState("");
        const [contextImage, setContextImage] = useState("");

        useEffect(() => {
            if (!show) return;

            const updateContext = async () => {
                try {
                    const context = Spicetify.Player.data?.context;
                    if (context?.metadata) {
                        setContextName(context.metadata.context_description || "");
                        
                        // Get image URL - try multiple sources
                        let imageUrl = context.metadata.image_url || "";
                        
                        // Helper function to convert image ID to full URL
                        const toFullImageUrl = (url) => {
                            if (!url) return "";
                            // Already a full URL
                            if (url.startsWith("http://") || url.startsWith("https://")) {
                                return url;
                            }
                            // spotify:image: format
                            if (url.startsWith("spotify:image:")) {
                                const imageId = url.replace("spotify:image:", "");
                                return `https://i.scdn.co/image/${imageId}`;
                            }
                            // Just an image ID (hex string like ab67706c...)
                            if (/^[a-f0-9]+$/i.test(url)) {
                                return `https://i.scdn.co/image/${url}`;
                            }
                            // Unknown format, return as-is
                            return url;
                        };
                        
                        imageUrl = toFullImageUrl(imageUrl);
                        
                        // If still no valid image, try to fetch from context URI
                        if (!imageUrl && context.uri) {
                            try {
                                const uri = context.uri;
                                if (uri.includes("playlist:")) {
                                    const playlistId = uri.split(":").pop();
                                    const playlistData = await Spicetify.CosmosAsync.get(
                                        `https://api.spotify.com/v1/playlists/${playlistId}?fields=images`
                                    );
                                    if (playlistData?.images?.[0]?.url) {
                                        imageUrl = playlistData.images[0].url;
                                    }
                                } else if (uri.includes("album:")) {
                                    const albumId = uri.split(":").pop();
                                    const albumData = await Spicetify.CosmosAsync.get(
                                        `https://api.spotify.com/v1/albums/${albumId}?fields=images`
                                    );
                                    if (albumData?.images?.[0]?.url) {
                                        imageUrl = albumData.images[0].url;
                                    }
                                }
                            } catch (fetchErr) {
                                console.debug("Failed to fetch context image:", fetchErr);
                            }
                        }
                        
                        setContextImage(imageUrl);
                        
                        // Determine context type
                        const uri = context.uri || "";
                        if (uri.includes("playlist")) setContextType(I18n.t("fullscreen.contextType.playlist"));
                        else if (uri.includes("album")) setContextType(I18n.t("fullscreen.contextType.album"));
                        else if (uri.includes("artist")) setContextType(I18n.t("fullscreen.contextType.artist"));
                        else if (uri.includes("collection")) setContextType(I18n.t("fullscreen.contextType.collection"));
                        else if (uri.includes("station")) setContextType(I18n.t("fullscreen.contextType.station"));
                        else setContextType("");
                    }
                } catch (e) {
                    console.error("Context update error:", e);
                }
            };

            updateContext();
            Spicetify.Player.addEventListener("songchange", updateContext);
            return () => Spicetify.Player.removeEventListener("songchange", updateContext);
        }, [show]);

        if (!show || !contextName) return null;

        return react.createElement("div", { className: "fullscreen-context-info" },
            showImage && contextImage && react.createElement("img", {
                src: contextImage,
                className: "fullscreen-context-image"
            }),
            react.createElement("div", { className: "fullscreen-context-text" },
                contextType && react.createElement("span", { className: "fullscreen-context-type" }, contextType),
                react.createElement("span", { className: "fullscreen-context-name" }, contextName)
            )
        );
    };

    // Next Track Preview Component
    const NextTrackPreview = ({ show, secondsBeforeEnd = 15 }) => {
        const [visible, setVisible] = useState(false);
        const [nextTrack, setNextTrack] = useState(null);

        useEffect(() => {
            if (!show) return;

            const checkNextTrack = () => {
                try {
                    const duration = Spicetify.Player.getDuration();
                    const position = Spicetify.Player.getProgress();
                    const remaining = (duration - position) / 1000;

                    // Show when less than secondsBeforeEnd remaining
                    if (remaining <= secondsBeforeEnd && remaining > 0) {
                        // Get next track from queue
                        const queue = Spicetify.Queue;
                        if (queue?.nextTracks?.length > 0) {
                            const next = queue.nextTracks[0];
                            if (next?.contextTrack?.metadata) {
                                setNextTrack({
                                    title: next.contextTrack.metadata.title,
                                    artist: next.contextTrack.metadata.artist_name,
                                    image: next.contextTrack.metadata.image_url
                                });
                                setVisible(true);
                                return;
                            }
                        }
                    }
                    setVisible(false);
                } catch (e) {
                    setVisible(false);
                }
            };

            const interval = setInterval(checkNextTrack, 500);
            return () => clearInterval(interval);
        }, [show, secondsBeforeEnd]);

        if (!show || !visible || !nextTrack) return null;

        return react.createElement("div", { className: "fullscreen-next-track" },
            react.createElement("div", { className: "fullscreen-next-track-label" }, I18n.t("fullscreen.controls.nextTrackLabel")),
            react.createElement("div", { className: "fullscreen-next-track-content" },
                nextTrack.image && react.createElement("img", {
                    src: nextTrack.image,
                    className: "fullscreen-next-track-image"
                }),
                react.createElement("div", { className: "fullscreen-next-track-info" },
                    react.createElement("div", { className: "fullscreen-next-track-title" }, nextTrack.title),
                    react.createElement("div", { className: "fullscreen-next-track-artist" }, nextTrack.artist)
                )
            )
        );
    };

    // Progress Bar Component (독립형 - 컨트롤과 별개로 표시 가능)
    const ProgressBar = ({ show }) => {
        const [progress, setProgress] = useState(0);
        const [duration, setDuration] = useState(0);
        const progressRef = useRef(null);
        const isDragging = useRef(false);

        useEffect(() => {
            if (!show) return;

            const updateProgress = () => {
                if (!isDragging.current) {
                    setProgress(Spicetify.Player.getProgress() || 0);
                }
                setDuration(Spicetify.Player.getDuration() || 0);
            };

            updateProgress();
            const progressInterval = setInterval(updateProgress, 200);

            return () => clearInterval(progressInterval);
        }, [show]);

        const handleProgressClick = useCallback((e) => {
            if (!progressRef.current) return;
            const rect = progressRef.current.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newProgress = percent * duration;
            Spicetify.Player.seek(newProgress);
            setProgress(newProgress);
        }, [duration]);

        const handleProgressDrag = useCallback((e) => {
            if (!isDragging.current || !progressRef.current) return;
            const rect = progressRef.current.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setProgress(percent * duration);
        }, [duration]);

        const handleMouseUp = useCallback((e) => {
            if (isDragging.current && progressRef.current) {
                const rect = progressRef.current.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                Spicetify.Player.seek(percent * duration);
            }
            isDragging.current = false;
            document.removeEventListener('mousemove', handleProgressDrag);
            document.removeEventListener('mouseup', handleMouseUp);
        }, [duration, handleProgressDrag]);

        const handleMouseDown = useCallback(() => {
            isDragging.current = true;
            document.addEventListener('mousemove', handleProgressDrag);
            document.addEventListener('mouseup', handleMouseUp);
        }, [handleProgressDrag, handleMouseUp]);

        if (!show) return null;

        const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

        return react.createElement("div", { className: "fullscreen-progress-standalone" },
            react.createElement("span", { className: "fullscreen-time" }, formatTime(progress)),
            react.createElement("div", {
                className: "fullscreen-progress-bar",
                ref: progressRef,
                onClick: handleProgressClick,
                onMouseDown: handleMouseDown
            },
                react.createElement("div", {
                    className: "fullscreen-progress-fill",
                    style: { width: `${progressPercent}%` }
                }),
                react.createElement("div", {
                    className: "fullscreen-progress-handle",
                    style: { left: `${progressPercent}%` }
                })
            ),
            react.createElement("span", { className: "fullscreen-time" }, formatTime(duration))
        );
    };

    // Player Controls Component (개선된 UI/UX)
    const PlayerControls = ({ show, showVolume = true, buttonSize = 36, showBackground = false }) => {
        const [isPlaying, setIsPlaying] = useState(!Spicetify.Player.isPaused?.());
        const [isShuffle, setIsShuffle] = useState(false);
        const [repeatMode, setRepeatMode] = useState(0);
        const [isLiked, setIsLiked] = useState(false);
        const [volume, setVolume] = useState(Spicetify.Player.getVolume?.() ?? 1);
        const [isMuted, setIsMuted] = useState(false);

        useEffect(() => {
            if (!show) return;

            const updatePlayState = () => setIsPlaying(!Spicetify.Player.isPaused?.());
            const updateShuffle = () => setIsShuffle(Spicetify.Player.getShuffle?.() || false);
            const updateRepeat = () => setRepeatMode(Spicetify.Player.getRepeat?.() || 0);
            
            const checkLiked = async () => {
                try {
                    const uri = Spicetify.Player.data?.item?.uri;
                    if (uri && Spicetify.Platform?.LibraryAPI) {
                        const result = await Spicetify.Platform.LibraryAPI.contains(uri);
                        setIsLiked(Array.isArray(result) ? result[0] : result);
                    }
                } catch (e) {}
            };

            updatePlayState();
            updateShuffle();
            updateRepeat();
            checkLiked();
            setVolume(Spicetify.Player.getVolume?.() ?? 1);
            
            Spicetify.Player.addEventListener("onplaypause", updatePlayState);
            Spicetify.Player.addEventListener("songchange", checkLiked);

            return () => {
                Spicetify.Player.removeEventListener("onplaypause", updatePlayState);
                Spicetify.Player.removeEventListener("songchange", checkLiked);
            };
        }, [show]);

        const toggleLike = async () => {
            try {
                const uri = Spicetify.Player.data?.item?.uri;
                if (uri && Spicetify.Platform?.LibraryAPI) {
                    if (isLiked) {
                        await Spicetify.Platform.LibraryAPI.remove({ uris: [uri] });
                    } else {
                        await Spicetify.Platform.LibraryAPI.add({ uris: [uri] });
                    }
                    setIsLiked(!isLiked);
                }
            } catch (e) {
                console.error("Toggle like error:", e);
            }
        };

        const cycleRepeat = () => {
            const nextMode = (repeatMode + 1) % 3;
            Spicetify.Player.setRepeat(nextMode);
            setRepeatMode(nextMode);
        };

        if (!show) return null;
        
        const buttonStyle = {
            width: `${buttonSize}px`,
            height: `${buttonSize}px`
        };
        const mainButtonStyle = {
            width: `${buttonSize + 12}px`,
            height: `${buttonSize + 12}px`
        };
        const smallButtonStyle = {
            width: `${buttonSize - 4}px`,
            height: `${buttonSize - 4}px`
        };

        const handleVolumeChange = (e) => {
            const newVolume = parseFloat(e.target.value);
            setVolume(newVolume);
            Spicetify.Player.setVolume(newVolume);
            setIsMuted(newVolume === 0);
        };

        const toggleMute = () => {
            if (isMuted || volume === 0) {
                const newVol = 0.5;
                Spicetify.Player.setVolume(newVol);
                setVolume(newVol);
                setIsMuted(false);
            } else {
                Spicetify.Player.setVolume(0);
                setVolume(0);
                setIsMuted(true);
            }
        };

        return react.createElement("div", { 
            className: `fullscreen-player-controls ${showBackground ? 'with-background' : ''}`
        },
            // Main control row: like, shuffle, prev, play, next, repeat, add-to-playlist
            react.createElement("div", { className: "fullscreen-control-row fullscreen-control-main-row" },
                // Like button (left side)
                react.createElement("button", {
                    className: `fullscreen-control-btn fullscreen-like-btn ${isLiked ? 'liked' : ''}`,
                    style: smallButtonStyle,
                    onClick: toggleLike,
                    title: isLiked ? I18n.t("fullscreen.controls.unlike") : I18n.t("fullscreen.controls.like")
                },
                    react.createElement("svg", {
                        viewBox: "0 0 16 16",
                        fill: isLiked ? "currentColor" : "none",
                        stroke: "currentColor",
                        strokeWidth: isLiked ? "0" : "1.5",
                        dangerouslySetInnerHTML: { __html: Spicetify.SVGIcons["heart"] }
                    })
                ),
                // Shuffle
                react.createElement("button", {
                    className: `fullscreen-control-btn ${isShuffle ? 'active' : ''}`,
                    style: smallButtonStyle,
                    onClick: () => {
                        Spicetify.Player.setShuffle(!isShuffle);
                        setIsShuffle(!isShuffle);
                    },
                    title: I18n.t("fullscreen.controls.shuffle")
                },
                    react.createElement("svg", {
                        viewBox: "0 0 16 16",
                        fill: "currentColor",
                        dangerouslySetInnerHTML: { __html: Spicetify.SVGIcons.shuffle }
                    })
                ),
                // Previous
                react.createElement("button", {
                    className: "fullscreen-control-btn",
                    style: buttonStyle,
                    onClick: () => Spicetify.Player.back(),
                    title: I18n.t("fullscreen.controls.previous")
                },
                    react.createElement("svg", {
                        viewBox: "0 0 16 16",
                        fill: "currentColor",
                        dangerouslySetInnerHTML: { __html: Spicetify.SVGIcons["skip-back"] }
                    })
                ),
                // Play/Pause (main button)
                react.createElement("button", {
                    className: "fullscreen-control-btn fullscreen-control-play",
                    style: mainButtonStyle,
                    onClick: () => Spicetify.Player.togglePlay(),
                    title: isPlaying ? I18n.t("fullscreen.controls.pause") : I18n.t("fullscreen.controls.play")
                },
                    react.createElement("svg", {
                        viewBox: "0 0 16 16",
                        fill: "currentColor",
                        dangerouslySetInnerHTML: { __html: isPlaying ? Spicetify.SVGIcons.pause : Spicetify.SVGIcons.play }
                    })
                ),
                // Next
                react.createElement("button", {
                    className: "fullscreen-control-btn",
                    style: buttonStyle,
                    onClick: () => Spicetify.Player.next(),
                    title: I18n.t("fullscreen.controls.next")
                },
                    react.createElement("svg", {
                        viewBox: "0 0 16 16",
                        fill: "currentColor",
                        dangerouslySetInnerHTML: { __html: Spicetify.SVGIcons["skip-forward"] }
                    })
                ),
                // Repeat
                react.createElement("button", {
                    className: `fullscreen-control-btn ${repeatMode > 0 ? 'active' : ''}`,
                    style: smallButtonStyle,
                    onClick: cycleRepeat,
                    title: repeatMode === 0 ? I18n.t("fullscreen.controls.repeatOff") : repeatMode === 1 ? I18n.t("fullscreen.controls.repeatAll") : I18n.t("fullscreen.controls.repeatOne")
                },
                    react.createElement("svg", {
                        viewBox: "0 0 16 16",
                        fill: "currentColor",
                        dangerouslySetInnerHTML: { __html: repeatMode === 2 ? (Spicetify.SVGIcons["repeat-once"] || Spicetify.SVGIcons.repeat) : Spicetify.SVGIcons.repeat }
                    })
                ),
                // Share link button (right side, for symmetry)
                react.createElement("button", {
                    className: "fullscreen-control-btn",
                    style: smallButtonStyle,
                    onClick: async () => {
                        const trackId = Spicetify.Player.data?.item?.uri?.split(':')[2];
                        if (trackId) {
                            const shareUrl = `https://open.spotify.com/track/${trackId}`;
                            try {
                                await navigator.clipboard.writeText(shareUrl);
                                Spicetify.showNotification(I18n.t("fullscreen.controls.shareCopied"));
                            } catch (e) {
                                // Fallback
                                if (Spicetify.Platform?.ClipboardAPI) {
                                    Spicetify.Platform.ClipboardAPI.copy(shareUrl);
                                    Spicetify.showNotification(I18n.t("fullscreen.controls.shareCopied"));
                                }
                            }
                        }
                    },
                    title: I18n.t("fullscreen.controls.share")
                },
                    react.createElement("svg", {
                        viewBox: "0 0 16 16",
                        fill: "currentColor",
                        dangerouslySetInnerHTML: { __html: Spicetify.SVGIcons["share"] || '<path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>' }
                    })
                )
            ),
            // Volume row
            showVolume && react.createElement("div", { className: "fullscreen-control-row fullscreen-control-volume-row" },
                react.createElement("div", { className: "fullscreen-volume-wrapper" },
                    react.createElement("button", {
                        className: "fullscreen-control-btn",
                        style: smallButtonStyle,
                        onClick: toggleMute,
                        title: isMuted ? I18n.t("fullscreen.controls.unmute") : I18n.t("fullscreen.controls.mute")
                    },
                        react.createElement("svg", {
                            viewBox: "0 0 16 16",
                            fill: "currentColor",
                            dangerouslySetInnerHTML: { 
                                __html: (isMuted || volume === 0) 
                                    ? Spicetify.SVGIcons["volume-off"] 
                                    : volume < 0.5 
                                        ? Spicetify.SVGIcons["volume-one-wave"] 
                                        : Spicetify.SVGIcons["volume-two-wave"]
                            }
                        })
                    ),
                    react.createElement("input", {
                        type: "range",
                        className: "fullscreen-volume-slider",
                        min: 0,
                        max: 1,
                        step: 0.01,
                        value: volume,
                        onChange: handleVolumeChange
                    })
                )
            )
        );
    };

    // Lyrics Progress Indicator
    const LyricsProgress = ({ show, currentLine, totalLines }) => {
        if (!show || totalLines <= 0) return null;

        const percent = Math.round(((currentLine + 1) / totalLines) * 100);

        return react.createElement("div", { className: "fullscreen-lyrics-progress" },
            react.createElement("div", { className: "fullscreen-lyrics-progress-bar" },
                react.createElement("div", {
                    className: "fullscreen-lyrics-progress-fill",
                    style: { width: `${percent}%` }
                })
            ),
            react.createElement("span", { className: "fullscreen-lyrics-progress-text" },
                `${currentLine + 1} / ${totalLines}`
            )
        );
    };

    // Main Overlay Component
    const Overlay = ({ 
        coverUrl, 
        title, 
        artist, 
        isFullscreen,
        currentLyricIndex = 0,
        totalLyrics = 0
    }) => {
        const [uiVisible, setUiVisible] = useState(true);
        const hideTimerRef = useRef(null);

        // Get settings from CONFIG
        const showAlbum = CONFIG?.visual?.["fullscreen-show-album"] !== false;
        const showInfo = CONFIG?.visual?.["fullscreen-show-info"] !== false;
        const albumSize = Number(CONFIG?.visual?.["fullscreen-album-size"]) || 400;
        const albumRadius = Number(CONFIG?.visual?.["fullscreen-album-radius"]) || 12;
        const titleSize = Number(CONFIG?.visual?.["fullscreen-title-size"]) || 48;
        const artistSize = Number(CONFIG?.visual?.["fullscreen-artist-size"]) || 24;

        // UI element settings
        const showClock = CONFIG?.visual?.["fullscreen-show-clock"] !== false;
        const clockShowSeconds = CONFIG?.visual?.["fullscreen-clock-show-seconds"] === true;
        const clockSize = Number(CONFIG?.visual?.["fullscreen-clock-size"]) || 48;
        const showContext = CONFIG?.visual?.["fullscreen-show-context"] !== false;
        const showContextImage = CONFIG?.visual?.["fullscreen-show-context-image"] !== false;
        const showNextTrack = CONFIG?.visual?.["fullscreen-show-next-track"] !== false;
        const nextTrackSeconds = Number(CONFIG?.visual?.["fullscreen-next-track-seconds"]) || 15;
        const showControls = CONFIG?.visual?.["fullscreen-show-controls"] !== false;
        const showVolume = CONFIG?.visual?.["fullscreen-show-volume"] !== false;
        const showProgress = CONFIG?.visual?.["fullscreen-show-progress"] !== false;
        const showLyricsProgress = CONFIG?.visual?.["fullscreen-show-lyrics-progress"] === true;
        const autoHideUI = CONFIG?.visual?.["fullscreen-auto-hide-ui"] !== false;
        const autoHideDelay = (Number(CONFIG?.visual?.["fullscreen-auto-hide-delay"]) || 3) * 1000;
        
        // Control style settings
        const controlButtonSize = Number(CONFIG?.visual?.["fullscreen-control-button-size"]) || 36;
        const controlsBackground = CONFIG?.visual?.["fullscreen-controls-background"] === true;
        const controlsCompact = CONFIG?.visual?.["fullscreen-controls-compact"] === true;
        
        // Layout settings
        const controlsPosition = CONFIG?.visual?.["fullscreen-controls-position"] || "left-panel";
        const albumShadow = CONFIG?.visual?.["fullscreen-album-shadow"] !== false;

        // Auto-hide UI on mouse inactivity
        useEffect(() => {
            if (!isFullscreen || !autoHideUI) {
                setUiVisible(true);
                return;
            }

            const handleMouseMove = () => {
                setUiVisible(true);
                if (hideTimerRef.current) {
                    clearTimeout(hideTimerRef.current);
                }
                hideTimerRef.current = setTimeout(() => {
                    setUiVisible(false);
                }, autoHideDelay);
            };

            hideTimerRef.current = setTimeout(() => {
                setUiVisible(false);
            }, autoHideDelay);

            document.addEventListener('mousemove', handleMouseMove);
            
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                if (hideTimerRef.current) {
                    clearTimeout(hideTimerRef.current);
                }
            };
        }, [isFullscreen, autoHideUI, autoHideDelay]);

        if (!isFullscreen) return null;

        const isTwoColumn = CONFIG?.visual?.["fullscreen-two-column"] !== false;
        const hideLeftPanel = !showAlbum && !showInfo && controlsPosition !== "left-panel";
        const showControlsInLeftPanel = controlsPosition === "left-panel" && showControls;
        const showControlsInBottom = controlsPosition === "bottom" && showControls;

        return react.createElement(react.Fragment, null,
            // Bottom-left: Context info
            react.createElement("div", {
                className: `fullscreen-bottom-left ${!uiVisible ? 'hidden' : ''}`
            },
                react.createElement(ContextInfo, { show: showContext, showImage: showContextImage })
            ),
            // Top-right: Clock & Next track
            react.createElement("div", {
                className: `fullscreen-top-right ${!uiVisible ? 'hidden' : ''}`
            },
                react.createElement(Clock, { 
                    show: showClock,
                    showSeconds: clockShowSeconds,
                    size: clockSize
                }),
                react.createElement(NextTrackPreview, { 
                    show: showNextTrack, 
                    secondsBeforeEnd: nextTrackSeconds 
                })
            ),
            // Left panel (Album, Info & Controls)
            isTwoColumn && !hideLeftPanel && react.createElement("div", { 
                className: `lyrics-fullscreen-left-panel ${!uiVisible && showControlsInLeftPanel ? 'controls-hidden' : ''}`
            },
                react.createElement("div", { className: "lyrics-fullscreen-left-content" },
                    // Album art
                    showAlbum && react.createElement("img", {
                        src: coverUrl || Spicetify.Player.data?.item?.metadata?.image_url,
                        className: `lyrics-fullscreen-album-art ${albumShadow ? 'with-shadow' : ''}`,
                        style: {
                            width: `${albumSize}px`,
                            height: `${albumSize}px`,
                            maxWidth: `${albumSize}px`,
                            borderRadius: `${albumRadius}px`
                        }
                    }),
                    // Track info
                    showInfo && react.createElement("div", { className: "lyrics-fullscreen-track-info" },
                        react.createElement("div", {
                            className: "lyrics-fullscreen-title",
                            style: { fontSize: `${titleSize}px` }
                        }, title || Spicetify.Player.data?.item?.metadata?.title),
                        react.createElement("div", {
                            className: "lyrics-fullscreen-artist",
                            style: { fontSize: `${artistSize}px` }
                        }, artist || Spicetify.Player.data?.item?.metadata?.artist_name)
                    ),
                    // Controls in left panel (under album)
                    showControlsInLeftPanel && react.createElement("div", {
                        className: `fullscreen-left-controls ${!uiVisible ? 'hidden' : ''}`
                    },
                        // Progress bar (독립적으로 표시)
                        showProgress && react.createElement(ProgressBar, { show: true }),
                        // Player controls
                        react.createElement(PlayerControls, { 
                            show: true, 
                            showVolume: showVolume,
                            buttonSize: controlButtonSize,
                            showBackground: controlsBackground
                        })
                    ),
                    // Progress bar only (컨트롤 없이 진행바만 표시)
                    !showControls && showProgress && react.createElement("div", {
                        className: `fullscreen-left-controls ${!uiVisible ? 'hidden' : ''}`
                    },
                        react.createElement(ProgressBar, { show: true })
                    )
                )
            ),
            // Bottom: Player controls (alternative position)
            showControlsInBottom && react.createElement("div", {
                className: `fullscreen-bottom ${!uiVisible ? 'hidden' : ''}`
            },
                showProgress && react.createElement(ProgressBar, { show: true }),
                react.createElement(PlayerControls, { 
                    show: true, 
                    showVolume: showVolume,
                    buttonSize: controlButtonSize,
                    showBackground: controlsBackground
                })
            ),
            // Progress bar only at bottom (컨트롤 없이 진행바만 표시, bottom 위치)
            !showControls && showProgress && controlsPosition === "bottom" && react.createElement("div", {
                className: `fullscreen-bottom ${!uiVisible ? 'hidden' : ''}`
            },
                react.createElement(ProgressBar, { show: true })
            ),
            // Lyrics progress (always at bottom right if enabled)
            showLyricsProgress && react.createElement("div", {
                className: `fullscreen-lyrics-progress-container ${!uiVisible ? 'hidden' : ''}`
            },
                react.createElement(LyricsProgress, {
                    show: true,
                    currentLine: currentLyricIndex,
                    totalLines: totalLyrics
                })
            )
        );
    };

    return Overlay;
})();

window.FullscreenOverlay = FullscreenOverlay;
