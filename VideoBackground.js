const VideoBackground = ({ trackUri, firstLyricTime, brightness, blurAmount, coverMode }) => {
    const { useState, useEffect, useRef } = react;
    const [videoInfo, setVideoInfo] = useState(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(Spicetify.Player.isPlaying());
    const [trackOffsetMs, setTrackOffsetMs] = useState(0);
    const containerRef = useRef(null);
    const playerRef = useRef(null); // Use ref to hold player instance for reliable cleanup
    const brightnessValue = Math.min(Math.max(Number(brightness) || 0, 0), 100);
    const brightnessRatio = brightnessValue / 100;
    const blurValue = Math.min(Math.max(Number(blurAmount) || 0, 0), 80);
    const useCoverMode = coverMode === true;

    // Load YouTube IFrame API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }, []);

    // Monitor Spotify Playback State
    useEffect(() => {
        const updateState = () => setIsPlaying(Spicetify.Player.isPlaying());
        Spicetify.Player.addEventListener("onplaypause", updateState);
        return () => Spicetify.Player.removeEventListener("onplaypause", updateState);
    }, []);

    // Fetch Video Info & Manage Player Lifecycle
    useEffect(() => {
        if (!trackUri) return;

        // Cleanup previous player immediately when track changes
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch (e) { }
            playerRef.current = null;
        }

        const trackId = trackUri.split(":")[2];
        setStatusMessage(I18n.t("videoBackground.loading"));
        setVideoInfo(null);
        setIsPlayerReady(false);
        setIsLoading(true);

        let isMounted = true;

        // 프리페치된 비디오 정보가 있는지 먼저 확인
        const prefetchedInfo = typeof Prefetcher !== 'undefined' ? Prefetcher.getVideoInfo(trackUri) : null;
        
        if (prefetchedInfo) {
            // 프리페치된 데이터 사용
            console.log(`[VideoBackground] Using prefetched video info for trackId: ${trackId}`);
            setIsLoading(false);
            setVideoInfo(prefetchedInfo);
            setStatusMessage("");
        } else {
            // 프리페치된 데이터가 없으면 직접 fetch
            const userHash = Utils.getUserHash();
            fetch(`https://api.ivl.is/lyrics_youtube/?trackId=${trackId}&userHash=${userHash}`)
                .then((res) => res.json())
                .then((data) => {
                    if (!isMounted) return;
                    setIsLoading(false);
                    if (data.success) {
                        setVideoInfo(data.data);
                        setStatusMessage("");
                    } else {
                        setStatusMessage(I18n.t("videoBackground.notFound"));
                        setVideoInfo(null);
                    }
                })
                .catch((e) => {
                    if (!isMounted) return;
                    setIsLoading(false);
                    setStatusMessage(I18n.t("videoBackground.error"));
                    setVideoInfo(null);
                });
        }

        return () => {
            isMounted = false;
            // Cleanup on unmount or track change
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) { }
                playerRef.current = null;
            }
        };
    }, [trackUri]);

    // Track-specific sync offset handling
    useEffect(() => {
        if (!trackUri || typeof Utils === "undefined" || typeof Utils.getTrackSyncOffset !== "function") {
            setTrackOffsetMs(0);
            return undefined;
        }

        let isMounted = true;

        const loadOffset = async () => {
            try {
                const offset = (await Utils.getTrackSyncOffset(trackUri)) || 0;
                if (isMounted) {
                    setTrackOffsetMs(offset);
                }
            } catch (error) {
                if (isMounted) {
                    setTrackOffsetMs(0);
                }
            }
        };

        loadOffset();

        const handleOffsetChange = (event) => {
            if (event?.detail?.trackUri === trackUri) {
                setTrackOffsetMs(event.detail.offset || 0);
            }
        };

        window.addEventListener('lyrics-plus:offset-changed', handleOffsetChange);

        return () => {
            isMounted = false;
            window.removeEventListener('lyrics-plus:offset-changed', handleOffsetChange);
        };
    }, [trackUri]);

    // Initialize Player when videoInfo is available
    useEffect(() => {
        if (!videoInfo || !videoInfo.youtubeVideoId || !containerRef.current) return;

        // Double check cleanup
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
            } catch (e) { }
            playerRef.current = null;
        }

        const initPlayer = () => {
            if (!window.YT || !window.YT.Player) {
                setTimeout(initPlayer, 100);
                return;
            }

            // Ensure container is empty before creating new player
            // containerRef.current.innerHTML = ""; // YT.Player replaces the element, so we need a wrapper or let it replace a child. 
            // Actually YT.Player replaces the target element. If we use a ref to a div, that div gets replaced by the iframe.
            // If we destroy the player, does it restore the div? No.
            // So we need to ensure we have a fresh target element.
            // The easiest way is to let React handle the DOM node. 
            // If we destroy the player, the iframe is removed. We might need to recreate the container div?
            // Actually, YT.Player(id|element) replaces the element. 
            // If we use a ref, we should probably use a wrapper and append a child to it, or handle the ref carefully.

            // Better approach: Create a temporary div inside the container
            const playerDiv = document.createElement('div');
            containerRef.current.innerHTML = ''; // Clear container
            containerRef.current.appendChild(playerDiv);

            const newPlayer = new window.YT.Player(playerDiv, {
                height: "100%",
                width: "100%",
                videoId: videoInfo.youtubeVideoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    rel: 0,
                    iv_load_policy: 3,
                    mute: 1,
                    origin: window.location.origin,
                },
                events: {
                    onReady: (event) => {
                        playerRef.current = event.target;
                        setIsPlayerReady(true);
                        event.target.mute();
                        event.target.playVideo();
                    },
                },
            });
            // Note: playerRef.current is set in onReady, but we can also set it here if newPlayer returns the instance immediately.
            // YT.Player returns the object immediately.
            playerRef.current = newPlayer;
        };

        initPlayer();

    }, [videoInfo]);

    // Sync Logic
    useEffect(() => {
        // We use playerRef.current here
        const syncInterval = setInterval(() => {
            const player = playerRef.current;
            if (!player || !isPlayerReady || !videoInfo) return;
            // Check if player has methods (sometimes it's not fully ready even if object exists)
            if (typeof player.getPlayerState !== 'function') return;

            const spotifyIsPlaying = Spicetify.Player.isPlaying();

            if (spotifyIsPlaying !== isPlaying) {
                setIsPlaying(spotifyIsPlaying);
            }

            if (!spotifyIsPlaying) {
                if (player.getPlayerState() === 1) { // Playing
                    player.pauseVideo();
                }
                return;
            } else {
                if (player.getPlayerState() !== 1) {
                    player.playVideo();
                }
            }

            const spotifyTime = Spicetify.Player.getProgress() / 1000;
            const lyricsStartTime = (firstLyricTime || 0) / 1000;
            const captionStartTime = videoInfo.captionStartTime || 0;

            const offset = captionStartTime - lyricsStartTime;
            const globalDelayMs = typeof CONFIG !== "undefined" && CONFIG.visual ? Number(CONFIG.visual.delay || 0) : 0;
            const additionalDelaySeconds = (trackOffsetMs + globalDelayMs) / 1000;
            let targetVideoTime = spotifyTime + offset + additionalDelaySeconds;

            // 영상 길이보다 음악이 길 경우, 영상을 처음부터 반복 재생
            // getDuration()은 영상의 총 길이(초)를 반환
            if (targetVideoTime >= 0 && typeof player.getDuration === 'function') {
                const videoDuration = player.getDuration();
                // 영상 길이가 0보다 크고, 목표 시간이 영상 길이를 초과하면 모듈로 연산
                if (videoDuration > 0 && targetVideoTime >= videoDuration) {
                    targetVideoTime = targetVideoTime % videoDuration;
                }
            }

            if (targetVideoTime >= 0) {
                const currentVideoTime = player.getCurrentTime();
                if (Math.abs(currentVideoTime - targetVideoTime) > 0.5) {
                    player.seekTo(targetVideoTime, true);
                }
            }
        }, 500);

        return () => clearInterval(syncInterval);
    }, [isPlayerReady, videoInfo, firstLyricTime, isPlaying, trackOffsetMs]);

    // Render Album Art Background (Fallback)
    const renderFallback = () => {
        const albumArtUrl =
            Spicetify.Player.data?.item?.metadata?.image_xlarge_url ||
            Spicetify.Player.data?.item?.metadata?.image_large_url ||
            Spicetify.Player.data?.item?.metadata?.image_url;

        return react.createElement("div", {
            style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundImage: albumArtUrl ? `url(${albumArtUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: `brightness(${brightnessRatio}) blur(${blurValue}px)`,
                transform: "scale(1.1)",
                zIndex: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            },
        }, statusMessage ? react.createElement("div", {
            style: {
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                zIndex: 10,
                background: "rgba(0,0,0,0.3)",
                padding: "20px",
                borderRadius: "10px",
                backdropFilter: "blur(10px)"
            }
        }, statusMessage) : null);
    };

    return react.createElement("div", {
        style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            zIndex: 0,
        }
    },
        // Loading indicator (top-left corner)
        isLoading && react.createElement("div", {
            style: {
                position: "absolute",
                top: "20px",
                left: "20px",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "rgba(0, 0, 0, 0.7)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                padding: "12px 18px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                animation: "fadeIn 0.3s ease",
            }
        },
            // Spinner
            react.createElement("div", {
                style: {
                    width: "18px",
                    height: "18px",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    borderTopColor: "#1DB954",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                }
            }),
            react.createElement("span", {
                style: {
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "500",
                    fontFamily: "Pretendard Variable, -apple-system, sans-serif",
                }
            }, I18n.t("videoBackground.loadingMessage"))
        ),
        // CSS animation keyframes
        isLoading && react.createElement("style", {
            dangerouslySetInnerHTML: {
                __html: `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `
            }
        }),
        renderFallback(),
        react.createElement("div", {
            ref: containerRef,
            style: {
                position: "absolute",
                top: useCoverMode ? "50%" : 0,
                left: useCoverMode ? "50%" : 0,
                width: useCoverMode ? "177.78vh" : "100%", // 16:9 aspect ratio: 100vh * 16/9
                height: useCoverMode ? "56.25vw" : "100%", // 16:9 aspect ratio: 100vw * 9/16
                minWidth: useCoverMode ? "100%" : undefined,
                minHeight: useCoverMode ? "100%" : undefined,
                transform: useCoverMode 
                    ? `translate(-50%, -50%)${blurValue ? " scale(1.05)" : ""}` 
                    : (blurValue ? "scale(1.05)" : undefined),
                opacity: isPlayerReady && isPlaying ? 1 : 0, // Hide when paused or not ready
                transition: "opacity 0.5s ease",
                zIndex: 1,
                pointerEvents: "none",
                filter: blurValue ? `blur(${blurValue}px)` : "none",
            }
        }),
        react.createElement("div", {
            style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "black",
                opacity: 1 - brightnessRatio,
                zIndex: 2,
                pointerEvents: "none"
            }
        })
    );
};

window.VideoBackground = VideoBackground;
