const ProviderIvLyrics = (() => {
	async function findLyrics(info) {
		const trackId = info.uri.split(":")[2];

		// ApiTracker에 현재 트랙 설정
		if (window.ApiTracker) {
			window.ApiTracker.setCurrentTrack(trackId);
		}

		// 1. 로컬 캐시 먼저 확인 (API 호출 절약)
		try {
			const cached = await LyricsCache.getLyrics(trackId);
			if (cached) {
				console.log(`[ProviderIvLyrics] Using local cache for ${trackId}`);
				// 캐시 히트 로깅
				if (window.ApiTracker) {
					window.ApiTracker.logCacheHit('lyrics', `lyrics:${trackId}`, {
						provider: cached.provider,
						lyrics_type: cached.lyrics_type,
						lineCount: cached.synced?.length || cached.unsynced?.length || 0
					});
				}
				return cached;
			}
		} catch (e) {
			console.warn('[ProviderIvLyrics] Cache check failed:', e);
		}

		// 2. API 호출
		const userHash = Utils.getUserHash();
		const baseURL = `https://lyrics.api.ivl.is/lyrics?trackId=${trackId}&userHash=${userHash}`;

		// API 요청 로깅 시작
		let logId = null;
		if (window.ApiTracker) {
			logId = window.ApiTracker.logRequest('lyrics', baseURL, { trackId, userHash });
		}

		try {
			const body = await fetch(baseURL, {
				headers: {
					"User-Agent": `spicetify v${Spicetify.Config.version} (https://github.com/spicetify/cli)`,
				},
				cache: "no-cache",  // 브라우저 HTTP 캐시 우회
			});

			if (body.status !== 200) {
				const errorResult = {
					error: "Request error: Track wasn't found",
					uri: info.uri,
				};
				// 에러 로깅
				if (window.ApiTracker && logId) {
					window.ApiTracker.logResponse(logId, { status: body.status }, 'error', `HTTP ${body.status}`);
				}
				return errorResult;
			}

			const response = await body.json();

			if (response.error) {
				// API 에러 로깅
				if (window.ApiTracker && logId) {
					window.ApiTracker.logResponse(logId, response, 'error', response.error);
				}
				return {
					error: response.error,
					uri: info.uri,
				};
			}

			// 성공 로깅
			if (window.ApiTracker && logId) {
				window.ApiTracker.logResponse(logId, {
					provider: response.provider,
					lyrics_type: response.lyrics_type,
					source: response.source,
					lineCount: response.synced?.length || response.unsynced?.length || 0
				}, 'success');
			}

			// 3. 로컬 캐시에 저장 (백그라운드)
			LyricsCache.setLyrics(trackId, response).catch(() => { });

			return response;
		} catch (e) {
			// 네트워크 에러 로깅
			if (window.ApiTracker && logId) {
				window.ApiTracker.logResponse(logId, null, 'error', e.message);
			}
			throw e;
		}
	}

	function getUnsynced(body) {
		if (body.error) return null;

		if (body.lyrics_type === "synced") {
			const parsed = Utils.parseLocalLyrics(body.lyrics);
			return parsed.unsynced;
		} else if (body.lyrics_type === "unsynced") {
			return Utils.parseLocalLyrics(body.lyrics).unsynced;
		} else if (body.lyrics_type === "word_by_word") {
			const lyrics = JSON.parse(body.lyrics);
			return lyrics.map(line => ({
				text: line.x
			}));
		}

		return null;
	}

	function getSynced(body) {
		if (body.error) return null;

		if (body.lyrics_type === "synced") {
			const parsed = Utils.parseLocalLyrics(body.lyrics);
			return parsed.synced;
		} else if (body.lyrics_type === "word_by_word") {
			const lyrics = JSON.parse(body.lyrics);
			return lyrics.map(line => ({
				startTime: Math.round(line.ts * 1000),
				text: line.x
			}));
		}

		return null;
	}

	function getKaraoke(body) {
		if (body.error) return null;

		if (body.lyrics_type === "word_by_word") {
			const lyrics = JSON.parse(body.lyrics);
			const result = lyrics.map(line => {
				const lineStartTime = Math.round(line.ts * 1000);
				const lineEndTime = Math.round(line.te * 1000);

				if (!line.l || line.l.length === 0) {
					return {
						startTime: lineStartTime,
						endTime: lineEndTime,
						text: line.x,
						syllables: [{
							text: line.x,
							startTime: lineStartTime,
							endTime: lineEndTime
						}]
					};
				}

				// Separate vocals by timing groups
				const vocalGroups = [];
				let currentGroup = [];
				let lastEndTime = 0;

				line.l.forEach((syllable, index) => {
					const syllableStartTime = Math.round((line.ts + syllable.o) * 1000);
					const nextSyllable = line.l[index + 1];
					const syllableEndTime = nextSyllable
						? Math.round((line.ts + nextSyllable.o) * 1000)
						: lineEndTime;

					// Check if this syllable starts significantly after the last one ended
					const gap = syllableStartTime - lastEndTime;
					const isNewVocalGroup = gap > 500 && currentGroup.length > 0; // 500ms gap threshold

					if (isNewVocalGroup) {
						vocalGroups.push([...currentGroup]);
						currentGroup = [];
					}

					currentGroup.push({
						text: syllable.c,
						startTime: syllableStartTime,
						endTime: syllableEndTime
					});

					lastEndTime = syllableEndTime;
				});

				if (currentGroup.length > 0) {
					vocalGroups.push(currentGroup);
				}

				// If we have multiple vocal groups, structure them as lead + background
				if (vocalGroups.length > 1) {
					return {
						startTime: lineStartTime,
						endTime: lineEndTime,
						text: line.x,
						vocals: {
							lead: {
								startTime: vocalGroups[0][0].startTime,
								endTime: vocalGroups[0][vocalGroups[0].length - 1].endTime,
								syllables: vocalGroups[0]
							},
							background: vocalGroups.slice(1).map(group => ({
								startTime: group[0].startTime,
								endTime: group[group.length - 1].endTime,
								syllables: group
							}))
						}
					};
				} else {
					// Single vocal track
					return {
						startTime: lineStartTime,
						endTime: lineEndTime,
						text: line.x,
						syllables: vocalGroups[0] || [{
							text: line.x,
							startTime: lineStartTime,
							endTime: lineEndTime
						}]
					};
				}
			});

			return result;
		}

		return null;
	}

	return { findLyrics, getSynced, getUnsynced, getKaraoke };
})();