// LRU Cache implementation for better cache performance (최적화 #10)
class LRUCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  get size() {
    return this.cache.size;
  }
}

// ============================================
// API 요청/응답 추적 시스템 (Debug용)
// ============================================
const ApiTracker = {
  _logs: [],
  _maxLogs: 100,
  _currentTrackId: null,
  _listeners: [],
  
  /**
   * 현재 트랙 설정 (새 트랙 재생 시 로그 초기화)
   */
  setCurrentTrack(trackId) {
    if (this._currentTrackId !== trackId) {
      this._logs = [];
      this._currentTrackId = trackId;
      this._notifyListeners();
    }
  },
  
  /**
   * API 요청 로그 추가
   */
  logRequest(category, endpoint, request = null) {
    const logEntry = {
      id: Date.now() + Math.random(),
      category,
      endpoint,
      request,
      response: null,
      status: 'pending',
      startTime: Date.now(),
      endTime: null,
      duration: null,
      error: null,
      cached: false
    };
    
    this._logs.push(logEntry);
    
    // 최대 로그 수 유지
    if (this._logs.length > this._maxLogs) {
      this._logs.shift();
    }
    
    this._notifyListeners();
    return logEntry.id;
  },
  
  /**
   * API 응답 로그 업데이트
   */
  logResponse(logId, response, status = 'success', error = null, cached = false) {
    const entry = this._logs.find(l => l.id === logId);
    if (entry) {
      entry.response = response;
      entry.status = status;
      entry.error = error;
      entry.cached = cached;
      entry.endTime = Date.now();
      entry.duration = entry.endTime - entry.startTime;
      this._notifyListeners();
    }
  },
  
  /**
   * 캐시 히트 로그 (API 호출 없이 캐시에서 가져온 경우)
   */
  logCacheHit(category, cacheKey, data) {
    const logEntry = {
      id: Date.now() + Math.random(),
      category,
      endpoint: `[CACHE] ${cacheKey}`,
      request: null,
      response: data,
      status: 'cached',
      startTime: Date.now(),
      endTime: Date.now(),
      duration: 0,
      error: null,
      cached: true
    };
    
    this._logs.push(logEntry);
    
    if (this._logs.length > this._maxLogs) {
      this._logs.shift();
    }
    
    this._notifyListeners();
  },
  
  /**
   * 현재 트랙의 모든 로그 가져오기
   */
  getLogs() {
    return [...this._logs];
  },
  
  /**
   * 카테고리별 로그 가져오기
   */
  getLogsByCategory(category) {
    return this._logs.filter(l => l.category === category);
  },
  
  /**
   * 로그 초기화
   */
  clear() {
    this._logs = [];
    this._notifyListeners();
  },
  
  /**
   * 리스너 등록
   */
  addListener(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  },
  
  /**
   * 리스너들에게 변경 알림
   */
  _notifyListeners() {
    this._listeners.forEach(cb => {
      try { cb(this._logs); } catch(e) {}
    });
  },
  
  /**
   * 요약 정보 가져오기
   */
  getSummary() {
    const summary = {
      total: this._logs.length,
      pending: 0,
      success: 0,
      error: 0,
      cached: 0,
      byCategory: {}
    };
    
    this._logs.forEach(log => {
      if (log.status === 'pending') summary.pending++;
      else if (log.status === 'success') summary.success++;
      else if (log.status === 'error') summary.error++;
      if (log.cached) summary.cached++;
      
      if (!summary.byCategory[log.category]) {
        summary.byCategory[log.category] = { total: 0, success: 0, error: 0, cached: 0 };
      }
      summary.byCategory[log.category].total++;
      if (log.status === 'success') summary.byCategory[log.category].success++;
      if (log.status === 'error') summary.byCategory[log.category].error++;
      if (log.cached) summary.byCategory[log.category].cached++;
    });
    
    return summary;
  }
};

// 전역 접근 가능하도록 window에 등록
window.ApiTracker = ApiTracker;

// ============================================
// IndexedDB 기반 로컬 캐시 시스템
// API 호출 횟수를 90% 이상 줄여 비용 절감
// ============================================
const LyricsCache = {
  DB_NAME: 'LyricsPlusCache',
  DB_VERSION: 3,  // sync 스토어 추가
  
  // 캐시 만료 시간 (일 단위)
  EXPIRY: {
    lyrics: 7,        // 가사: 7일
    translation: 30,  // 번역: 30일
    phonetic: 30,     // 발음: 30일
    metadata: 30,     // 메타데이터: 30일
    sync: 7,          // 싱크 오프셋: 7일
    youtube: 7        // YouTube 정보: 7일
  },
  
  _db: null,
  _dbPromise: null,
  
  /**
   * IndexedDB 열기
   */
  async _openDB() {
    if (this._db) return this._db;
    if (this._dbPromise) return this._dbPromise;
    
    this._dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => {
        console.error('[LyricsCache] Failed to open database:', request.error);
        this._dbPromise = null;
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this._db = request.result;
        resolve(this._db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 가사 캐시 스토어
        if (!db.objectStoreNames.contains('lyrics')) {
          const lyricsStore = db.createObjectStore('lyrics', { keyPath: 'trackId' });
          lyricsStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
        
        // 번역 캐시 스토어
        if (!db.objectStoreNames.contains('translations')) {
          const transStore = db.createObjectStore('translations', { keyPath: 'cacheKey' });
          transStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
        
        // YouTube 정보 캐시 스토어
        if (!db.objectStoreNames.contains('youtube')) {
          const ytStore = db.createObjectStore('youtube', { keyPath: 'trackId' });
          ytStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
        
        // 메타데이터 번역 캐시 스토어
        if (!db.objectStoreNames.contains('metadata')) {
          const metaStore = db.createObjectStore('metadata', { keyPath: 'cacheKey' });
          metaStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
        
        // 커뮤니티 싱크 오프셋 캐시 스토어
        if (!db.objectStoreNames.contains('sync')) {
          const syncStore = db.createObjectStore('sync', { keyPath: 'trackId' });
          syncStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }
      };
    });
    
    return this._dbPromise;
  },
  
  /**
   * 만료 여부 확인
   */
  _isExpired(cachedAt, type) {
    if (!cachedAt) return true;
    const expiryDays = this.EXPIRY[type] || 7;
    const expiryMs = expiryDays * 24 * 60 * 60 * 1000;
    return Date.now() - cachedAt > expiryMs;
  },
  
  /**
   * 가사 캐시 조회
   */
  async getLyrics(trackId) {
    try {
      const db = await this._openDB();
      const tx = db.transaction('lyrics', 'readonly');
      const store = tx.objectStore('lyrics');
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(trackId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (result && !this._isExpired(result.cachedAt, 'lyrics')) {
        console.log(`[LyricsCache] Lyrics cache hit for ${trackId}`);
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('[LyricsCache] getLyrics error:', error);
      return null;
    }
  },
  
  /**
   * 가사 캐시 저장
   */
  async setLyrics(trackId, data) {
    try {
      const db = await this._openDB();
      const tx = db.transaction('lyrics', 'readwrite');
      const store = tx.objectStore('lyrics');
      
      store.put({
        trackId,
        data,
        cachedAt: Date.now()
      });
      
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      console.log(`[LyricsCache] Lyrics cached for ${trackId}`);
      return true;
    } catch (error) {
      console.error('[LyricsCache] setLyrics error:', error);
      return false;
    }
  },
  
  /**
   * 번역 캐시 키 생성
   */
  _getTranslationKey(trackId, lang, isPhonetic) {
    return `${trackId}:${lang}:${isPhonetic ? 'phonetic' : 'translation'}`;
  },
  
  /**
   * 번역 캐시 조회
   */
  async getTranslation(trackId, lang, isPhonetic = false) {
    try {
      const db = await this._openDB();
      const tx = db.transaction('translations', 'readonly');
      const store = tx.objectStore('translations');
      const cacheKey = this._getTranslationKey(trackId, lang, isPhonetic);
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(cacheKey);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const type = isPhonetic ? 'phonetic' : 'translation';
      if (result && !this._isExpired(result.cachedAt, type)) {
        console.log(`[LyricsCache] Translation cache hit for ${cacheKey}`);
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('[LyricsCache] getTranslation error:', error);
      return null;
    }
  },
  
  /**
   * 번역 캐시 저장
   */
  async setTranslation(trackId, lang, isPhonetic, data) {
    try {
      const db = await this._openDB();
      const tx = db.transaction('translations', 'readwrite');
      const store = tx.objectStore('translations');
      const cacheKey = this._getTranslationKey(trackId, lang, isPhonetic);
      
      store.put({
        cacheKey,
        trackId,
        lang,
        isPhonetic,
        data,
        cachedAt: Date.now()
      });
      
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      console.log(`[LyricsCache] Translation cached for ${cacheKey}`);
      return true;
    } catch (error) {
      console.error('[LyricsCache] setTranslation error:', error);
      return false;
    }
  },
  
  /**
   * 메타데이터 번역 캐시 조회
   */
  async getMetadata(trackId, lang) {
    try {
      const db = await this._openDB();
      const tx = db.transaction('metadata', 'readonly');
      const store = tx.objectStore('metadata');
      const cacheKey = `${trackId}:${lang}`;
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(cacheKey);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (result && !this._isExpired(result.cachedAt, 'metadata')) {
        console.log(`[LyricsCache] Metadata cache hit for ${cacheKey}`);
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('[LyricsCache] getMetadata error:', error);
      return null;
    }
  },
  
  /**
   * 메타데이터 번역 캐시 저장
   */
  async setMetadata(trackId, lang, data) {
    try {
      const db = await this._openDB();
      const tx = db.transaction('metadata', 'readwrite');
      const store = tx.objectStore('metadata');
      const cacheKey = `${trackId}:${lang}`;
      
      store.put({
        cacheKey,
        trackId,
        lang,
        data,
        cachedAt: Date.now()
      });
      
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      console.log(`[LyricsCache] Metadata cached for ${cacheKey}`);
      return true;
    } catch (error) {
      console.error('[LyricsCache] setMetadata error:', error);
      return false;
    }
  },
  
  /**
   * YouTube 정보 캐시 조회
   */
  async getYouTube(trackId) {
    try {
      const db = await this._openDB();
      const tx = db.transaction('youtube', 'readonly');
      const store = tx.objectStore('youtube');
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(trackId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (result && !this._isExpired(result.cachedAt, 'youtube')) {
        console.log(`[LyricsCache] YouTube cache hit for ${trackId}`);
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('[LyricsCache] getYouTube error:', error);
      return null;
    }
  },
  
  /**
   * YouTube 정보 캐시 저장
   */
  async setYouTube(trackId, data) {
    try {
      const db = await this._openDB();
      const tx = db.transaction('youtube', 'readwrite');
      const store = tx.objectStore('youtube');
      
      store.put({
        trackId,
        data,
        cachedAt: Date.now()
      });
      
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      console.log(`[LyricsCache] YouTube cached for ${trackId}`);
      return true;
    } catch (error) {
      console.error('[LyricsCache] setYouTube error:', error);
      return false;
    }
  },
  
  /**
   * 커뮤니티 싱크 오프셋 캐시 조회
   */
  async getSync(trackId) {
    try {
      const db = await this._openDB();
      
      // sync 스토어가 없으면 null 반환 (DB 마이그레이션 전)
      if (!db.objectStoreNames.contains('sync')) {
        return null;
      }
      
      const tx = db.transaction('sync', 'readonly');
      const store = tx.objectStore('sync');
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(trackId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      if (result && !this._isExpired(result.cachedAt, 'sync')) {
        console.log(`[LyricsCache] Sync cache hit for ${trackId}`);
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('[LyricsCache] getSync error:', error);
      return null;
    }
  },
  
  /**
   * 커뮤니티 싱크 오프셋 캐시 저장
   */
  async setSync(trackId, data) {
    try {
      const db = await this._openDB();
      
      // sync 스토어가 없으면 스킵 (DB 마이그레이션 전)
      if (!db.objectStoreNames.contains('sync')) {
        return false;
      }
      
      const tx = db.transaction('sync', 'readwrite');
      const store = tx.objectStore('sync');
      
      store.put({
        trackId,
        data,
        cachedAt: Date.now()
      });
      
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      console.log(`[LyricsCache] Sync cached for ${trackId}`);
      return true;
    } catch (error) {
      console.error('[LyricsCache] setSync error:', error);
      return false;
    }
  },
  
  /**
   * 만료된 캐시 정리 (백그라운드에서 실행)
   */
  async cleanup() {
    try {
      const db = await this._openDB();
      const stores = ['lyrics', 'translations', 'youtube', 'metadata', 'sync'];
      
      for (const storeName of stores) {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const type = storeName === 'translations' 
              ? (cursor.value.isPhonetic ? 'phonetic' : 'translation')
              : storeName;
            
            if (this._isExpired(cursor.value.cachedAt, type)) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
      }
      
      console.log('[LyricsCache] Cleanup completed');
    } catch (error) {
      console.error('[LyricsCache] cleanup error:', error);
    }
  },
  
  /**
   * 특정 트랙의 번역 캐시만 삭제 (발음 + 번역)
   */
  async clearTranslationForTrack(trackId) {
    try {
      const db = await this._openDB();
      
      // 번역 스토어에서 해당 트랙의 모든 번역 삭제
      return new Promise((resolve, reject) => {
        const transTx = db.transaction('translations', 'readwrite');
        const transStore = transTx.objectStore('translations');
        const transRequest = transStore.openCursor();
        
        transRequest.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.value.trackId === trackId) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
        
        transTx.oncomplete = () => {
          console.log(`[LyricsCache] Cleared translation cache for ${trackId}`);
          resolve(true);
        };
        transTx.onerror = () => reject(transTx.error);
      });
    } catch (error) {
      console.error('[LyricsCache] clearTranslationForTrack error:', error);
      return false;
    }
  },
  
  /**
   * 특정 트랙의 캐시 삭제
   */
  async clearTrack(trackId) {
    try {
      const db = await this._openDB();
      
      // 모든 삭제 작업을 Promise로 관리
      const deletePromises = [];
      
      // 가사 삭제
      deletePromises.push(new Promise((resolve, reject) => {
        const lyricsTx = db.transaction('lyrics', 'readwrite');
        lyricsTx.objectStore('lyrics').delete(trackId);
        lyricsTx.oncomplete = () => resolve();
        lyricsTx.onerror = () => reject(lyricsTx.error);
      }));
      
      // 번역 삭제 (모든 언어)
      deletePromises.push(new Promise((resolve, reject) => {
        const transTx = db.transaction('translations', 'readwrite');
        const transStore = transTx.objectStore('translations');
        const transRequest = transStore.openCursor();
        transRequest.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.value.trackId === trackId) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
        transTx.oncomplete = () => resolve();
        transTx.onerror = () => reject(transTx.error);
      }));
      
      // YouTube 삭제
      deletePromises.push(new Promise((resolve, reject) => {
        const ytTx = db.transaction('youtube', 'readwrite');
        ytTx.objectStore('youtube').delete(trackId);
        ytTx.oncomplete = () => resolve();
        ytTx.onerror = () => reject(ytTx.error);
      }));
      
      // 메타데이터 삭제
      deletePromises.push(new Promise((resolve, reject) => {
        const metaTx = db.transaction('metadata', 'readwrite');
        const metaStore = metaTx.objectStore('metadata');
        const metaRequest = metaStore.openCursor();
        metaRequest.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.value.trackId === trackId) {
              cursor.delete();
            }
            cursor.continue();
          }
        };
        metaTx.oncomplete = () => resolve();
        metaTx.onerror = () => reject(metaTx.error);
      }));
      
      // 모든 삭제 작업이 완료될 때까지 대기
      await Promise.all(deletePromises);
      
      console.log(`[LyricsCache] Cleared cache for ${trackId}`);
      return true;
    } catch (error) {
      console.error('[LyricsCache] clearTrack error:', error);
      return false;
    }
  },
  
  /**
   * 전체 캐시 삭제
   */
  async clearAll() {
    try {
      const db = await this._openDB();
      const stores = ['lyrics', 'translations', 'youtube', 'metadata'];
      
      // 모든 스토어의 삭제를 병렬로 처리하고 완료 대기
      const clearPromises = stores.map(storeName => {
        return new Promise((resolve, reject) => {
          const tx = db.transaction(storeName, 'readwrite');
          tx.objectStore(storeName).clear();
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      });
      
      await Promise.all(clearPromises);
      
      console.log('[LyricsCache] All cache cleared');
      return true;
    } catch (error) {
      console.error('[LyricsCache] clearAll error:', error);
      return false;
    }
  },
  
  /**
   * 캐시 통계 조회
   */
  async getStats() {
    try {
      const db = await this._openDB();
      const stores = ['lyrics', 'translations', 'youtube', 'metadata'];
      const stats = {};
      
      for (const storeName of stores) {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        
        stats[storeName] = await new Promise((resolve, reject) => {
          const request = store.count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      }
      
      return stats;
    } catch (error) {
      console.error('[LyricsCache] getStats error:', error);
      return null;
    }
  }
};

// 시작 시 만료된 캐시 정리 (5초 후 백그라운드에서)
setTimeout(() => LyricsCache.cleanup(), 5000);

// Optimized Utils with performance improvements and caching
const Utils = {
  // LRU caches for frequently used operations (최적화 #10 - LRU 캐시 적용)
  _colorCache: new LRUCache(100),
  _normalizeCache: new LRUCache(200),
  _langDetectCache: new LRUCache(100),

  // Common cache size limiter (최적화 #1)
  _limitCacheSize(cache, maxSize) {
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
  },

  addQueueListener(callback) {
    Spicetify.Player.origin._events.addListener("queue_update", callback);
  },

  removeQueueListener(callback) {
    Spicetify.Player.origin._events.removeListener("queue_update", callback);
  },

  convertIntToRGB(colorInt, div = 1) {
    const cacheKey = `${colorInt}_${div}`;

    if (this._colorCache.has(cacheKey)) {
      return this._colorCache.get(cacheKey);
    }

    // Use bit operations for faster calculations
    const r = Math.round(((colorInt >>> 16) & 0xff) / div);
    const g = Math.round(((colorInt >>> 8) & 0xff) / div);
    const b = Math.round((colorInt & 0xff) / div);

    const result = `rgb(${r},${g},${b})`;

    // Cache result (limit cache size)
    this._limitCacheSize(this._colorCache, 100);
    this._colorCache.set(cacheKey, result);

    return result;
  },
  // 최적화 #11 - Character map for faster string normalization
  _charNormalizeMap: {
    '（': '(', '）': ')', '【': '[', '】': ']',
    '。': '. ', '；': '; ', '：': ': ', '？': '? ',
    '！': '! ', '、': ', ', '，': ', ', '\u2018': "'",
    '\u2019': "'", '′': "'", '＇': "'", '\u201c': '"',
    '\u201d': '"', '〜': '~', '·': '•', '・': '•'
  },
  _charNormalizePattern: null,

  /**
   * @param {string} s
   * @param {boolean} emptySymbol
   * @returns {string}
   */
  normalize(s, emptySymbol = true) {
    const cacheKey = `${s}_${emptySymbol}`;

    if (this._normalizeCache.has(cacheKey)) {
      return this._normalizeCache.get(cacheKey);
    }

    // Lazy compile the pattern (최적화 #11 - 정규식 사전 컴파일)
    if (!this._charNormalizePattern) {
      const chars = Object.keys(this._charNormalizeMap).join('|').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      this._charNormalizePattern = new RegExp(chars, 'g');
    }

    // Single pass with character map (최적화 #11 - 단일 패스로 변경)
    let result = s.replace(this._charNormalizePattern, match => this._charNormalizeMap[match] || match);

    if (emptySymbol) {
      result = result.replace(/[-/]/g, " ");
    }

    result = result.replace(/\s+/g, " ").trim();

    // LRU cache automatically handles size
    this._normalizeCache.set(cacheKey, result);

    return result;
  },
  /**
   * Check if the specified string contains Han character.
   *
   * @param {string} s
   * @returns {boolean}
   */
  containsHanCharacter(s) {
    const hanRegex = /\p{Script=Han}/u;
    return hanRegex.test(s);
  },
  /**
   * Singleton Translator instance for {@link toSimplifiedChinese}.
   *
   * @type {Translator | null}
   */
  set translator(translator) {
    this._translatorInstance = translator;
  },
  _translatorInstance: null,
  /**
   * Convert all Han characters to Simplified Chinese.
   *
   * Choosing Simplified Chinese makes the converted result more accurate,
   * as the conversion from SC to TC may have multiple possibilities,
   * while the conversion from TC to SC usually has only one possibility.
   *
   * @param {string} s
   * @returns {Promise<string>}
   */
  async toSimplifiedChinese(s) {
    // create a singleton Translator instance
    if (!this._translatorInstance) this.translator = new Translator("zh", true);

    // translate to Simplified Chinese
    // as Traditional Chinese differs between HK and TW, forcing to use OpenCC standard
    return this._translatorInstance.convertChinese(s, "t", "cn");
  },
  removeSongFeat(s) {
    return (
      s
        .replace(/-\s+(feat|with|prod).*/i, "")
        .replace(/(\(|\[)(feat|with|prod)\.?\s+.*(\)|\])$/i, "")
        .trim() || s
    );
  },
  removeExtraInfo(s) {
    return s.replace(/\s-\s.*/, "");
  },
  capitalize(s) {
    return s.replace(/^(\w)/, ($1) => $1.toUpperCase());
  },

  _cacheLanguageResult(cacheKey, result) {
    this._limitCacheSize(this._langDetectCache, 100);
    this._langDetectCache.set(cacheKey, result);
  },

  /**
   * 섹션 헤더를 감지하는 함수 (예: [Verse 1], [Chorus], [Bridge] 등)
   * @param {string} text - 검사할 텍스트
   * @returns {boolean} 섹션 헤더인지 여부
   */
  isSectionHeader(text) {
    if (!text || typeof text !== "string") return false;

    const normalizedText = text.trim();

    // 대괄호로 시작하고 끝나는 패턴 체크
    const bracketPattern = /^\s*\[.*\]\s*$/;
    if (!bracketPattern.test(normalizedText)) return false;

    // 일반적인 섹션 헤더 패턴들
    const sectionPatterns = [
      /^\s*\[\s*(verse|chorus|bridge|intro|outro|pre-?chorus|hook|refrain)\s*(\d+)?\s*(:|：)?\s*.*\]\s*$/i,
      /^\s*\[\s*(절|후렴|브릿지|인트로|아웃트로|간주|부분)\s*(\d+)?\s*(:|：)?\s*.*\]\s*$/i,
      /^\s*\[\s*(ヴァース|コーラス|ブリッジ|イントロ|アウトロ)\s*(\d+)?\s*(:|：)?\s*.*\]\s*$/i,
      /^\s*\[\s*(verse|chorus|bridge|intro|outro)\s*(\d+)?\s*(:|：)?\s*[^,\[\]]*\]\s*$/i,
    ];

    // 패턴 중 하나라도 매칭되면 섹션 헤더로 판단
    return sectionPatterns.some((pattern) => pattern.test(normalizedText));
  },

  detectLanguage(lyrics) {
    // Safe array check
    if (!lyrics || !Array.isArray(lyrics) || lyrics.length === 0) {
      return null;
    }

    // Safe text extraction
    const extractTextSafely = (line) => {
      if (!line) return "";
      if (typeof line === "string") return line;
      if (typeof line === "object") {
        // Avoid React elements and other complex objects
        if (line.$$typeof) return ""; // React element
        return line.originalText || line.text || "";
      }
      return String(line || "");
    };

    // Create cache key from lyrics text with safe extraction
    const rawLyrics = lyrics.map(extractTextSafely).join(" ");

    // 최적화 #14 - Early return for empty lyrics
    if (!rawLyrics || rawLyrics.length === 0) {
      return null;
    }

    const cacheKey = rawLyrics.substring(0, 200); // Use first 200 chars as cache key

    // 최적화 #14 - Early return from cache
    if (this._langDetectCache.has(cacheKey)) {
      return this._langDetectCache.get(cacheKey);
    }

    // Language detection regex patterns
    const kanaRegex =
      /[\u3001-\u3003]|[\u3005\u3007]|[\u301d-\u301f]|[\u3021-\u3035]|[\u3038-\u303a]|[\u3040-\u30ff]|[\uff66-\uff9f]/gu;
    const hangulRegex = /(\S*[\u3131-\u314e|\u314f-\u3163|\uac00-\ud7a3]+\S*)/g;
    const simpRegex =
      /[万与丑专业丛东丝丢两严丧个丬丰临为丽举么义乌乐乔习乡书买乱争于亏云亘亚产亩亲亵亸亿仅从仑仓仪们价众优伙会伛伞伟传伤伥伦伧伪伫体余佣佥侠侣侥侦侧侨侩侪侬俣俦俨俩俪俭债倾偬偻偾偿傥傧储傩儿兑兖党兰关兴兹养兽冁内冈册写军农冢冯冲决况冻净凄凉凌减凑凛几凤凫凭凯击凼凿刍划刘则刚创删别刬刭刽刿剀剂剐剑剥剧劝办务劢动励劲劳势勋勐勚匀匦匮区医华协单卖卢卤卧卫却卺厂厅历厉压厌厍厕厢厣厦厨厩厮县参叆叇双发变叙叠叶号叹叽吁后吓吕吗吣吨听启吴呒呓呕呖呗员呙呛呜咏咔咙咛咝咤咴咸哌响哑哒哓哔哕哗哙哜哝哟唛唝唠唡唢唣唤唿啧啬啭啮啰啴啸喷喽喾嗫呵嗳嘘嘤嘱噜噼嚣嚯团园囱围囵国图圆圣圹场坂坏块坚坛坜坝坞坟坠垄垅垆垒垦垧垩垫垭垯垱垲垴埘埙埚埝埯堑堕塆墙壮声壳壶壸处备复够头夸夹夺奁奂奋奖奥妆妇妈妩妪妫姗姜娄娅娆娇娈娱娲娴婳婴婵婶媪嫒嫔嫱嬷孙学孪宁宝实宠审宪宫宽宾寝对寻导寿将尔尘尧尴尸尽层屃屉届属屡屦屿岁岂岖岗岘岙岚岛岭岳岽岿峃峄峡峣峤峥峦崂崃崄崭嵘嵚嵛嵝嵴巅巩巯币帅师帏帐帘帜带帧帮帱帻帼幂幞干并广庄庆庐庑库应庙庞废庼廪开异弃张弥弪弯弹强归当录彟彦彻径徕御忆忏忧忾怀态怂怃怄怅怆怜总怼怿恋恳恶恸恹恺恻恼恽悦悫悬悭悯惊惧惨惩惫惬惭惮惯愍愠愤愦愿慑慭憷懑懒懔戆戋戏戗战戬户扎扑扦执扩扪扫扬扰抚抛抟抠抡抢护报担拟拢拣拥拦拧拨择挂挚挛挜挝挞挟挠挡挢挣挤挥挦捞损捡换捣据捻掳掴掷掸掺掼揸揽揿搀搁搂搅携摄摅摆摇摈摊撄撑撵撷撸撺擞攒敌敛数斋斓斗斩断无旧时旷旸昙昼昽显晋晒晓晔晕晖暂暧札术朴机杀杂权条来杨杩杰极构枞枢枣枥枧枨枪枫枭柜柠柽栀栅标栈栉栊栋栌栎栏树栖样栾桊桠桡桢档桤桥桦桧桨桩梦梼梾检棂椁椟椠椤椭楼榄榇榈榉槚槛槟槠横樯樱橥橱橹橼檐檩欢欤欧歼殁殇残殒殓殚殡殴毁毂毕毙毡毵氇气氢氩氲汇汉污汤汹沓沟没沣沤沥沦沧沨沩沪沵泞泪泶泷泸泺泻泼泽泾洁洒洼浃浅浆浇浈浉浊测浍济浏浐浑浒浓浔浕涂涌涛涝涞涟涠涡涢涣涤润涧涨涩淀渊渌渍渎渐渑渔渖渗温游湾湿溃溅溆溇滗滚滞滟滠满滢滤滥滦滨滩滪漤潆潇潋潍潜潴澜濑濒灏灭灯灵灾灿炀炉炖炜炝点炼炽烁烂烃烛烟烦烧烨烩烫烬热焕焖焘煅煳熘爱爷牍牦牵牺犊犟状犷犸犹狈狍狝狞独狭狮狯狰狱狲猃猎猕猡猪猫猬献獭玑玙玚玛玮环现玱玺珉珏珐珑珰珲琎琏琐琼瑶瑷璇璎瓒瓮瓯电画畅畲畴疖疗疟疠疡疬疮疯疱疴痈痉痒痖痨痪痫痴瘅瘆瘗瘘瘪瘫瘾瘿癞癣癫癯皑皱皲盏盐监盖盗盘眍眦眬着睁睐睑瞒瞩矫矶矾矿砀码砖砗砚砜砺砻砾础硁硅硕硖硗硙硚确硷碍碛碜碱碹磙礼祎祢祯祷祸禀禄禅离秃秆种积称秽秾稆税稣稳穑穷窃窍窑窜窝窥窦窭竖竞笃笋笔笕笺笼笾筑筚筛筜筝筹签简箓箦箧箨箩箪箫篑篓篮篱簖籁籴类籼粜粝粤粪粮糁糇紧絷纟纠纡红纣纤纥约级纨纩纪纫纬纭纮纯纰纱纲纳纴纵纶纷纸纹纺纻纼纽纾线绀绁绂练组绅细织终绉绊绋绌绍绎经绐绑绒结绔绕绖绗绘给绚绛络绝绞统绠绡绢绣绤绥绦继绨绩绪绫绬续绮绯绰绱绲绳维绵绶绷绸绹绺绻综绽绾绿缀缁缂缃缄缅缆缇缈缉缊缋缌缍缎缏缐缑缒缓缔缕编缗缘缙缚缛缜缝缞缟缠缡缢缣缤缥缦缧缨缩缪缫缬缭缮缯缰缱缲缳缴缵罂网罗罚罢罴羁羟羡翘翙翚耢耧耸耻聂聋职聍联聵聽聰肅腸膚膁腎腫脹脅膽勝朧腖臚脛膠脈膾髒臍腦膿臠腳脫腡臉臘醃膕齶膩靦膃騰臏臢輿艤艦艙艫艱豔艸藝節羋薌蕪蘆蓯葦藶莧萇蒼苧蘇檾蘋莖蘢蔦塋煢繭荊薦薘莢蕘蓽蕎薈薺蕩榮葷滎犖熒蕁藎蓀蔭蕒葒葤藥蒞蓧萊蓮蒔萵薟獲蕕瑩鶯蓴蘀蘿螢營縈蕭薩蔥蕆蕢蔣蔞藍薊蘺蕷鎣驀薔蘞藺藹蘄蘊藪槁蘚虜慮虛蟲虯虮雖蝦蠆蝕蟻螞蠶蠔蜆蠱蠣蟶蠻蟄蛺蟯螄蠐蛻蝸蠟蠅蟈蟬蠍螻蠑螿蟎蠨釁銜補襯袞襖嫋褘襪襲襏裝襠褌褳襝褲襇褸襤繈襴見觀覎規覓視覘覽覺覬覡覿覥覦覯覲覷觴觸觶讋譽謄訁計訂訃認譏訐訌討讓訕訖訓議訊記訒講諱謳詎訝訥許訛論訩訟諷設訪訣證詁訶評詛識詗詐訴診詆謅詞詘詔詖譯詒誆誄試詿詩詰詼誠誅詵話誕詬詮詭詢詣諍該詳詫諢詡譸誡誣語誚誤誥誘誨誑說誦誒請諸諏諾讀諑誹課諉諛誰諗調諂諒諄誶談誼謀諶諜謊諫諧謔謁謂諤諭諼讒諮諳諺諦謎諞諝謨讜謖謝謠謗諡謙謐謹謾謫譾謬譚譖譙讕譜譎讞譴譫讖穀豶貝貞負貟貢財責賢敗賬貨質販貪貧貶購貯貫貳賤賁貰貼貴貺貸貿費賀貽賊贄賈賄貲賃賂贓資賅贐賕賑賚賒賦賭齎贖賞賜贔賙賡賠賧賴賵贅賻賺賽賾贗讚贇贈贍贏贛赬趙趕趨趲躉躍蹌蹠躒踐躂蹺蹕躚躋踴躊蹤躓躑躡蹣躕躥躪躦軀車軋軌軑軔轉軛輪軟轟軲軻轤軸軹軼軤軫轢軺輕軾載輊轎輈輇輅較輒輔輛輦輩輝輥輞輬輟輜輳輻輯轀輸轡轅轄輾轆轍轔辯辮邊遼達遷過邁運還這進遠違連遲邇逕跡適選遜遞邐邏遺遙鄧鄺鄔郵鄒鄴鄰鬱郤郟鄶鄭鄆酈鄖鄲醞醱醬釅釃釀釋裏钜鑒鑾鏨釓釔針釘釗釙釕釷釺釧釤鈒釩釣鍆釹鍚釵鈃鈣鈈鈦鈍鈔鍾鈉鋇鋼鈑鈐鑰欽鈞鎢鉤鈧鈁鈥鈄鈕鈀鈺錢鉦鉗鈷缽鈳鉕鈽鈸鉞鑽鉬鉭鉀鈿鈾鐵鉑鈴鑠鉛鉚鈰鉉鉈鉍鈹鐸鉶銬銠鉺銪鋏鋣鐃銍鐺銅鋁銱銦鎧鍘銖銑鋌銩銛鏵銓鉿銚鉻銘錚銫鉸銥鏟銃鐋銨銀銣鑄鐒鋪鋙錸鋱鏈鏗銷鎖鋰鋥鋤鍋鋯鋨鏽銼鋝鋒鋅鋶鐦鐧銳銻鋃鋟鋦錒錆鍺錯錨錡錁錕錩錫錮鑼錘錐錦鍁錈錇錟錠鍵鋸錳錙鍥鍈鍇鏘鍶鍔鍤鍬鍾鍛鎪鍠鍰鎄鍍鎂鏤鎡鏌鎮鎛鎘鑷鐫鎳鎿鎦鎬鎊鎰鎔鏢鏜鏍鏰鏞鏡鏑鏃鏇鏐鐔钁鐐鏷鑥鐓鑭鐠鑹鏹鐙鑊鐳鐶鐲鐮鐿鑔鑣鑞鑲長門閂閃閆閈閉問闖閏闈閑閎間閔閌悶閘鬧閨聞闼閩閭闓閥閣閡閫鬮閱閬闍閾閹閶鬩閿閽閻閼闡闌闃闠闊闋闔闐闒闕闞闤隊陽陰陣階際陸隴陳陘陝隉隕險隨隱隸雋難雛讎靂霧霽黴靄靚靜靨韃鞽韉韝韋韌韍韓韙韞韜韻页顶顷顸项顺须顼顽顾顿颀颁颂颃预颅领颇颈颉颊颋颌颍颎颏颐频颒颓颔颕颖颗题颙颚颛颜额颞颟颠颡颢颣颤颥颦颧风飏飐飑飒飓飔飕飖飗飘飙飚飞飨餍饤饥饦饧饨饩饪饫饬饭饮饯饰饱饲饳饴饵饶饷饸饹饺饻饼饽饾饿馀馁馂馃馄馅馆馇馈馉馊馋馌馍馎馏馐馑馒馓馔馕马驭驮驯驰驱驲驳驴驵驶驷驸驹驺驻驼驽驾驿骀骁骂骃骄骅骆骇骈骉骊骋验骍骎骏骐骑骒骓骔骕骖骗骘骙骚骛骜骝骞骟骠骡骢骣骤骥骦骧髅髋髌鬓魇魉鱼鱽鱾鱿鲀鲁鲂鲄鲅鲆鲇鲈鲉鲊鲋鲌鲍鲎鲏鲐鲑鲒鲓鲔鲕鲖鲗鲘鲙鲚鲛鲜鲝鲞鲟鲠鲡鲢鲣鲤鲥鲦鲧鲨鲩鲪鲫鲬鲭鲮鲯鲰鲱鲲鲳鲴鲵鲶鲷鲸鲹鲺鲻鲼鲽鲾鲿鳀鳁鳂鳃鳄鳅鳆鳇鳈鳉鳊鳋鳌鳍鳎鳏鳐鳑鳒鳓鳔鳕鳖鳗鳘鳙鳛鳜鳝鳞鳟鳠鳡鳢鳣鸟鸠鸡鸢鸣鸤鸥鸦鸧鸨鸩鸪鸫鸬鸭鸮鸯鸰鸱鸲鸳鸴鸵鸶鸷鸸鸹鸺鸻鸼鸽鸾鸿鹀鹁鹂鹃鹄鹅鹆鹇鹈鹉鹊鹋鹌鹍鹎鹏鹐鹑鹒鹓鹔鹕鹖鹗鹘鹚鹛鹜鹝鹞鹟鹠鹡鹢鹣鹤鹥鹦鹧鹨鹩鹪鹫鹬鹭鹯鹰鹱鹲鹳鹴鹾麦麸黄黉黡黩黪黾鼋鼌鼍鼗鼹齄齐齑齿龀龁龂龃龄龅龆龇龈龉龊龋龌龙龚龛龟志制咨只里系范松没尝尝闹面准钟别闲干尽脏拼]/gu;
    const tradRegex =
      /[萬與醜專業叢東絲丟兩嚴喪個爿豐臨為麗舉麼義烏樂喬習鄉書買亂爭於虧雲亙亞產畝親褻嚲億僅從侖倉儀們價眾優夥會傴傘偉傳傷倀倫傖偽佇體餘傭僉俠侶僥偵側僑儈儕儂俁儔儼倆儷儉債傾傯僂僨償儻儐儲儺兒兌兗黨蘭關興茲養獸囅內岡冊寫軍農塚馮衝決況凍淨淒涼淩減湊凜幾鳳鳧憑凱擊氹鑿芻劃劉則剛創刪別剗剄劊劌剴劑剮劍剝劇勸辦務勱動勵勁勞勣勳猛勩勻匭匱區醫華協單賣盧鹵臥衛卻巹廠廳曆厲壓厭厙廁廂厴廈廚廄廝縣參靉靆雙發變敘疊葉號歎嘰籲後嚇呂嗎唚噸聽啟吳嘸囈嘔嚦唄員咼嗆嗚詠哢嚨嚀噝吒噅鹹呱響啞噠嘵嗶噦嘩噲嚌噥喲嘜嗊嘮啢嗩唕喚呼嘖嗇囀齧囉嘽嘯噴嘍嚳囁嗬噯噓嚶囑嚕劈囂謔團園囪圍圇國圖圓聖壙場阪壞塊堅壇壢壩塢墳墜壟壟壚壘墾坰堊墊埡墶壋塏堖塒塤堝墊垵塹墮壪牆壯聲殼壺壼處備複夠頭誇夾奪奩奐奮獎奧妝婦媽嫵嫗媯姍薑婁婭嬈嬌孌娛媧嫻嫿嬰嬋嬸媼嬡嬪嬙嬤孫學孿寧寶實寵審憲宮寬賓寢對尋導壽將爾塵堯尷屍盡層屭屜屆屬屢屨嶼歲豈嶇崗峴嶴嵐島嶺嶽崠巋嶨嶧峽嶢嶠崢巒嶗崍嶮嶄嶸嶔崳嶁脊巔鞏巰幣帥師幃帳簾幟帶幀幫幬幘幗冪襆幹並廣莊慶廬廡庫應廟龐廢廎廩開異棄張彌弳彎彈強歸當錄彠彥徹徑徠禦憶懺憂愾懷態慫憮慪悵愴憐總懟懌戀懇惡慟懨愷惻惱惲悅愨懸慳憫驚懼慘懲憊愜慚憚慣湣慍憤憒願懾憖怵懣懶懍戇戔戲戧戰戬戶紮撲扡執擴捫掃揚擾撫拋摶摳掄搶護報擔擬攏揀擁攔擰撥擇掛摯攣掗撾撻挾撓擋撟掙擠揮撏撈損撿換搗據撚擄摑擲撣摻摜摣攬撳攙擱摟攪攜攝攄擺搖擯攤攖撐攆擷擼攛擻攢敵斂數齋斕鬥斬斷無舊時曠暘曇晝曨顯晉曬曉曄暈暉暫曖劄術樸機殺雜權條來楊榪傑極構樅樞棗櫪梘棖槍楓梟櫃檸檉梔柵標棧櫛櫳棟櫨櫟欄樹棲樣欒棬椏橈楨檔榿橋樺檜槳樁夢檮棶檢欞槨櫝槧欏橢樓欖櫬櫚櫸檟檻檳櫧橫檣櫻櫫櫥櫓櫞簷檁歡歟歐殲歿殤殘殞殮殫殯毆毀轂畢斃氈毿氌氣氫氬氲彙漢汙湯洶遝溝沒灃漚瀝淪滄渢溈滬濔濘淚澩瀧瀘濼瀉潑澤涇潔灑窪浹淺漿澆湞溮濁測澮濟瀏滻渾滸濃潯濜塗湧濤澇淶漣潿渦溳渙滌潤澗漲澀澱淵淥漬瀆漸澠漁瀋滲溫遊灣濕潰濺漵漊潷滾滯灩灄滿瀅濾濫灤濱灘澦濫瀠瀟瀲濰潛瀦瀾瀨瀕灝滅燈靈災燦煬爐燉煒熗點煉熾爍爛烴燭煙煩燒燁燴燙燼熱煥燜燾煆糊溜愛爺牘犛牽犧犢強狀獷獁猶狽麅獮獰獨狹獅獪猙獄猻獫獵獼玀豬貓蝟獻獺璣璵瑒瑪瑋環現瑲璽瑉玨琺瓏璫琿璡璉瑣瓊瑤璦璿瓔瓚甕甌電畫暢佘疇癤療瘧癘瘍鬁瘡瘋皰屙癰痙癢瘂癆瘓癇癡癉瘮瘞瘺癟癱癮癭癩癬癲臒皚皺皸盞鹽監蓋盜盤瞘眥矓著睜睞瞼瞞矚矯磯礬礦碭碼磚硨硯碸礪礱礫礎硜矽碩硤磽磑礄確鹼礙磧磣堿镟滾禮禕禰禎禱禍稟祿禪離禿稈種積稱穢穠穭稅穌穩穡窮竊竅窯竄窩窺竇窶豎競篤筍筆筧箋籠籩築篳篩簹箏籌簽簡籙簀篋籜籮簞簫簣簍籃籬籪籟糴類秈糶糲粵糞糧糝餱緊縶糸糾紆紅紂纖紇約級紈纊紀紉緯紜紘純紕紗綱納紝縱綸紛紙紋紡紵紖紐紓線紺絏紱練組紳細織終縐絆紼絀紹繹經紿綁絨結絝繞絰絎繪給絢絳絡絕絞統綆綃絹繡綌綏絛繼綈績緒綾緓續綺緋綽緔緄繩維綿綬繃綢綯綹綣綜綻綰綠綴緇緙緗緘緬纜緹緲緝縕繢緦綞緞緶線緱縋緩締縷編緡緣縉縛縟縝縫縗縞纏縭縊縑繽縹縵縲纓縮繆繅纈繚繕繒韁繾繰繯繳纘罌網羅罰罷羆羈羥羨翹翽翬耮耬聳恥聶聾職聹聯聵聽聰肅腸膚膁腎腫脹脅膽勝朧腖臚脛膠脈膾髒臍腦膿臠腳脫腡臉臘醃膕齶膩靦膃騰臏臢輿艤艦艙艫艱豔艸藝節羋薌蕪蘆蓯葦藶莧萇蒼苧蘇檾蘋莖蘢蔦塋煢繭荊薦薘莢蕘蓽蕎薈薺蕩榮葷滎犖熒蕁藎蓀蔭蕒葒葤藥蒞蓧萊蓮蒔萵薟獲蕕瑩鶯蓴蘀蘿螢營縈蕭薩蔥蕆蕢蔣蔞藍薊蘺蕷鎣驀薔蘞藺藹蘄蘊藪槁蘚虜慮虛蟲虯虮雖蝦蠆蝕蟻螞蠶蠔蜆蠱蠣蟶蠻蟄蛺蟯螄蠐蛻蝸蠟蠅蟈蟬蠍螻蠑螿蟎蠨釁銜補襯袞襖嫋褘襪襲襏裝襠褌褳襝褲襇褸襤繈襴見觀覎規覓視覘覽覺覬覡覿覥覦覯覲覷觴觸觶讋譽謄訁計訂訃認譏訐訌討讓訕訖訓議訊記訒講諱謳詎訝訥許訛論訩訟諷設訪訣證詁訶評詛識詗詐訴診詆謅詞詘詔詖譯詒誆誄試詿詩詰詼誠誅詵話誕詬詮詭詢詣諍該詳詫諢詡譸誡誣語誚誤誥誘誨誑說誦誒請諸諏諾讀諑誹課諉諛誰諗調諂諒諄誶談誼謀諶諜謊諫諧謔謁謂諤諭諼讒諮諳諺諦謎諞諝謨讜謖謝謠謗諡謙謐謹謾謫譾謬譚譖譙讕譜譎讞譴譫讖穀豶貝貞負貟貢財責賢敗賬貨質販貪貧貶購貯貫貳賤賁貰貼貴貺貸貿費賀貽賊贄賈賄貲賃賂贓資賅贐賕賑賚賒賦賭齎贖賞賜贔賙賡賠賧賴賵贅賻賺賽賾贗讚贇贈贍贏贛赬趙趕趨趲躉躍蹌蹠躒踐躂蹺蹕躚躋踴躊蹤躓躑躡蹣躕躥躪躦軀車軋軌軑軔轉軛輪軟轟軲軻轤軸軹軼軤軫轢軺輕軾載輊轎輈輇輅較輒輔輛輦輩輝輥輞輬輟輜輳輻輯轀輸轡轅轄輾轆轍轔辯辮邊遼達遷過邁運還這進遠違連遲邇逕跡適選遜遞邐邏遺遙鄧鄺鄔郵鄒鄴鄰鬱郤郟鄶鄭鄆酈鄖鄲醞醱醬釅釃釀釋裏钜鑒鑾鏨釓釔針釘釗釙釕釷釺釧釤鈒釩釣鍆釹鍚釵鈃鈣鈈鈦鈍鈔鍾鈉鋇鋼鈑鈐鑰欽鈞鎢鉤鈧鈁鈥鈄鈕鈀鈺錢鉦鉗鈷缽鈳鉕鈽鈸鉞鑽鉬鉭鉀鈿鈾鐵鉑鈴鑠鉛鉚鈰鉉鉈鉍鈹鐸鉶銬銠鉺銪鋏鋣鐃銍鐺銅鋁銱銦鎧鍘銖銑鋌銩銛鏵銓鉿銚鉻銘錚銫鉸銥鏟銃鐋銨銀銣鑄鐒鋪鋙錸鋱鏈鏗銷鎖鋰鋥鋤鍋鋯鋨鏽銼鋝鋒鋅鋶鐦鐧銳銻鋃鋟鋦錒錆鍺錯錨錡錁錕錩錫錮鑼錘錐錦鍁錈錇錟錠鍵鋸錳錙鍥鍈鍇鏘鍶鍔鍤鍬鍾鍛鎪鍠鍰鎄鍍鎂鏤鎡鏌鎮鎛鎘鑷鐫鎳鎿鎦鎬鎊鎰鎔鏢鏜鏍鏰鏞鏡鏑鏃鏇鏐鐔钁鐐鏷鑥鐓鑭鐠鑹鏹鐙鑊鐳鐶鐲鐮鐿鑔鑣鑞鑲長門閂閃閆閈閉問闖閏闈閑閎間閔閌悶閘鬧閨聞闼閩閭闓閥閣閡閫鬮閱閬闍閾閹閶鬩閿閽閻閼闡闌闃闠闊闋闔闐闒闕闞闤隊陽陰陣階際陸隴陳陘陝隉隕險隨隱隸雋難雛讎靂霧霽黴靄靚靜靨韃鞽韉韝韋韌韍韓韙韞韜韻页顶顷顸项顺须顼顽顾顿颀颁颂颃预颅领颇颈颉颊颋颌颍颎颏颐频颒颓颔颕颖颗题颙颚颛颜额颞颟颠颡颢颣颤颥颦颧风飏飐飑飒飓飔飕飖飗飘飙飚飞飨餍饤饥饦饧饨饩饪饫饬饭饮饯饰饱饲饳饴饵饶饷饸饹饺饻饼饽饾饿馀馁馂馃馄馅馆馇馈馉馊馋馌馍馎馏馐馑馒馓馔馕马驭驮驯驰驱驲驳驴驵驶驷驸驹驺驻驼驽驾驿骀骁骂骃骄骅骆骇骈骉骊骋验骍骎骏骐骑骒骓骔骕骖骗骘骙骚骛骜骝骞骟骠骡骢骣骤骥骦骧髅髋髌鬓魇魉鱼鱽鱾鱿鲀鲁鲂鲄鲅鲆鲇鲈鲉鲊鲋鲌鲍鲎鲏鲐鲑鲒鲓鲔鲕鲖鲗鲘鲙鲚鲛鲜鲝鲞鲟鲠鲡鲢鲣鲤鲥鲦鲧鲨鲩鲪鲫鲬鲭鲮鲯鲰鲱鲲鲳鲴鲵鲶鲷鲸鲹鲺鲻鲼鲽鲾鲿鳀鳁鳂鳃鳄鳅鳆鳇鳈鳉鳊鳋鳌鳍鳎鳏鳐鳑鳒鳓鳔鳕鳖鳗鳘鳙鳛鳜鳝鳞鳟鳠鳡鳢鳣鸟鸠鸡鸢鸣鸤鸥鸦鸧鸨鸩鸪鸫鸬鸭鸮鸯鸰鸱鸲鸳鸴鸵鸶鸷鸸鸹鸺鸻鸼鸽鸾鸿鹀鹁鹂鹃鹄鹅鹆鹇鹈鹉鹊鹋鹌鹍鹎鹏鹐鹑鹒鹓鹔鹕鹖鹗鹘鹚鹛鹜鹝鹞鹟鹠鹡鹢鹣鹤鹥鹦鹧鹨鹩鹪鹫鹬鹭鹯鹰鹱鹲鹳鹴鹾麦麸黄黉黡黩黪黾鼋鼌鼍鼗鼹齄齐齑齿龀龁龂龃龄龅龆龇龈龉龊龋龌龙龚龛龟志制咨只里系范松没尝尝闹面准钟别闲干尽脏拼]/gu;
    const hanziRegex = /\p{Script=Han}/gu;
    const cyrillicRegex = /[\u0400-\u04FF]/gu; // Cyrillic (Russian, etc.)
    const vietnameseRegex =
      /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gu;
    const germanCharsRegex = /[äöüßÄÖÜ]/gu;
    const spanishRegex = /[áéíóúüñÁÉÍÓÚÜÑ¿¡]/gu;
    const frenchRegex = /[àâæçéèêëïîôùûüÿœÀÂÆÇÉÈÊËÏÎÔÙÛÜŸŒ]/gu;
    const portugueseRegex = /[ãõáàâéêíóôõúüçÃÕÁÀÂÉÊÍÓÔÕÚÜÇ]/gu;
    const turkishRegex = /[çğıöşüÇĞİÖŞÜ]/gu;
    const polishRegex = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/gu;
    const arabicRegex = /[\u0600-\u06FF]/gu;
    const thaiRegex = /[\u0E00-\u0E7F]/gu;
    const devanagariRegex = /[\u0900-\u097F]/gu; // Hindi
    const latinExtendedRegex = /[a-zA-ZÀ-ÿ]/gu; // Latin alphabet with diacritics

    const cjkMatch = rawLyrics.match(
      new RegExp(
        `${kanaRegex.source}|${hanziRegex.source}|${hangulRegex.source}`,
        "gu"
      )
    );

    const cyrillicMatch = rawLyrics.match(cyrillicRegex);
    const vietnameseMatch = rawLyrics.match(vietnameseRegex);
    const germanMatch = rawLyrics.match(germanCharsRegex);
    const spanishMatch = rawLyrics.match(spanishRegex);
    const frenchMatch = rawLyrics.match(frenchRegex);
    const portugueseMatch = rawLyrics.match(portugueseRegex);
    const turkishMatch = rawLyrics.match(turkishRegex);
    const polishMatch = rawLyrics.match(polishRegex);
    const arabicMatch = rawLyrics.match(arabicRegex);
    const thaiMatch = rawLyrics.match(thaiRegex);
    const hindiMatch = rawLyrics.match(devanagariRegex);
    const latinMatch = rawLyrics.match(latinExtendedRegex);

    // Priority 1: Check for specific language scripts
    // Arabic
    if (arabicMatch && arabicMatch.length > 5) {
      const result = "ar";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Thai
    if (thaiMatch && thaiMatch.length > 5) {
      const result = "th";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Hindi (Devanagari)
    if (hindiMatch && hindiMatch.length > 5) {
      const result = "hi";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Russian (Cyrillic)
    if (cyrillicMatch && cyrillicMatch.length > 10) {
      const result = "ru";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Vietnamese (distinct diacritics)
    if (vietnameseMatch && vietnameseMatch.length > 5) {
      const result = "vi";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Turkish (special characters)
    if (turkishMatch && turkishMatch.length > 3) {
      const result = "tr";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Polish (special characters)
    if (polishMatch && polishMatch.length > 3) {
      const result = "pl";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // German (special characters)
    if (germanMatch && germanMatch.length > 2) {
      const result = "de";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Spanish (special characters and punctuation)
    if (spanishMatch && spanishMatch.length > 3) {
      const result = "es";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // French (special diacritics)
    if (frenchMatch && frenchMatch.length > 3) {
      const result = "fr";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Portuguese (special diacritics with tilde)
    if (portugueseMatch && portugueseMatch.length > 3) {
      const result = "pt";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Priority 2: CJK languages (최적화 #6 - 단일 순회로 변경)
    if (cjkMatch) {
      const counts = { kana: 0, hanzi: 0, simp: 0, trad: 0, hangul: 0 };

      // 최적화 #13 - Character code 체크로 성능 향상 (regex보다 빠름)
      cjkMatch.forEach((glyph) => {
        const code = glyph.charCodeAt(0);

        // Korean (Hangul): U+AC00–U+D7A3
        if (code >= 0xAC00 && code <= 0xD7A3) {
          counts.hangul++;
        }
        // Japanese Hiragana: U+3040–U+309F, Katakana: U+30A0–U+30FF
        else if ((code >= 0x3040 && code <= 0x309F) || (code >= 0x30A0 && code <= 0x30FF)) {
          counts.kana++;
        }
        // Chinese characters - use regex for complex ranges
        else if (hanziRegex.test(glyph)) {
          counts.hanzi++;
          if (simpRegex.test(glyph)) counts.simp++;
          if (tradRegex.test(glyph)) counts.trad++;
        }
      });

      const totalLength = cjkMatch.length;
      const kanaPercentage = counts.kana / totalLength;
      const hanziPercentage = counts.hanzi / totalLength;
      const simpPercentage = counts.simp / totalLength;
      const tradPercentage = counts.trad / totalLength;

      // Korean (Hangul) - 이미 계산된 hangul 카운트 사용
      if (counts.hangul !== 0) {
        const result = "ko";
        this._cacheLanguageResult(cacheKey, result);
        return result;
      }

      // Japanese
      if (
        ((kanaPercentage - hanziPercentage + 1) / 2) * 100 >=
        CONFIG.visual["ja-detect-threshold"]
      ) {
        const result = "ja";
        this._cacheLanguageResult(cacheKey, result);
        return result;
      }

      // Chinese (Simplified vs Traditional)
      const result =
        ((simpPercentage - tradPercentage + 1) / 2) * 100 >=
          CONFIG.visual["hans-detect-threshold"]
          ? "zh-hans"
          : "zh-hant";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // Priority 3: Latin-based languages (English or other European languages)
    if (latinMatch) {
      // Default to English for Latin script
      const result = "en";
      this._cacheLanguageResult(cacheKey, result);
      return result;
    }

    // No language detected
    this._cacheLanguageResult(cacheKey, null);
    return null;
  },
  processTranslatedLyrics(translated, original) {
    // Ensure both inputs are arrays
    if (!Array.isArray(original) || !Array.isArray(translated)) {
      return Array.isArray(original) ? original : [];
    }

    return original.map((lyric, index) => {
      // Safe property extraction
      const startTime =
        lyric && typeof lyric === "object" ? lyric.startTime || 0 : 0;
      const originalText =
        lyric && typeof lyric === "object"
          ? lyric.text || ""
          : String(lyric || "");
      const translatedText = translated[index];

      // Safe text conversion
      let safeTranslatedText = "";
      if (translatedText !== null && translatedText !== undefined) {
        if (typeof translatedText === "object" && translatedText.$$typeof) {
          // React element - extract text content
          safeTranslatedText = translatedText.props?.children || "";
        } else {
          safeTranslatedText = String(translatedText);
        }
      }

      return {
        startTime,
        // Keep as string so Pages can inject as HTML (furigana) or plain text
        text: safeTranslatedText,
        originalText,
      };
    });
  },
  /** It seems that this function is not being used, but I'll keep it just in case it's needed in the future.*/
  processTranslatedOriginalLyrics(lyrics, synced) {
    const data = [];
    const dataSouce = {};

    for (const item of lyrics) {
      if (item && typeof item.startTime !== "undefined") {
        dataSouce[item.startTime] = { translate: item.text || "" };
      }
    }

    for (const time in synced) {
      const syncedItem = synced[time];
      if (syncedItem && typeof time !== "undefined") {
        dataSouce[time] = {
          ...dataSouce[time],
          text: syncedItem.text || "",
        };
      }
    }

    for (const time in dataSouce) {
      const item = dataSouce[time];
      const lyric = {
        startTime: time || 0,
        text: this.rubyTextToOriginalReact(
          item.translate || item.text,
          item.text || item.translate
        ),
      };
      data.push(lyric);
    }

    return data;
  },
  rubyTextToOriginalReact(translated, syncedText) {
    const react = Spicetify.React;
    return react.createElement("p1", null, [
      react.createElement(
        "ruby",
        {},
        syncedText,
        react.createElement("rt", null, translated)
      ),
    ]);
  },
  rubyTextToReact(s) {
    const react = Spicetify.React;
    const rubyElems = s.split("<ruby>");
    const reactChildren = [];

    reactChildren.push(rubyElems[0]);
    for (let i = 1; i < rubyElems.length; i++) {
      const kanji = rubyElems[i].split("<rp>")[0];
      const furigana = rubyElems[i].split("<rt>")[1].split("</rt>")[0];
      reactChildren.push(
        react.createElement(
          "ruby",
          null,
          kanji,
          react.createElement("rt", null, furigana)
        )
      );

      reactChildren.push(rubyElems[i].split("</ruby>")[1]);
    }
    return react.createElement("p1", null, reactChildren);
  },
  rubyTextToHTML(s) {
    // React 310 방지: null/undefined/빈 문자열 체크
    if (!s || typeof s !== "string" || s.trim() === "") {
      return "";
    }
    // Allow only ruby-related tags we generate; escape others
    let out = s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Re-enable allowed ruby tags
    out = out
      .replace(/&lt;ruby&gt;/g, "<ruby>")
      .replace(/&lt;\/ruby&gt;/g, "</ruby>")
      .replace(/&lt;rt&gt;/g, "<rt>")
      .replace(/&lt;\/rt&gt;/g, "</rt>")
      .replace(/&lt;rp&gt;/g, "<rp>")
      .replace(/&lt;\/rp&gt;/g, "</rp>");
    return out;
  },

  /**
   * 최적화 #9 - HTML props 생성 헬퍼 함수
   * @param {string} text - HTML로 렌더링할 텍스트
   * @returns {object} - dangerouslySetInnerHTML props 또는 빈 객체
   */
  createHTMLProps(text) {
    return typeof text === "string" && text
      ? { dangerouslySetInnerHTML: { __html: this.rubyTextToHTML(text) } }
      : {};
  },
  /**
   * Parse furigana HTML to extract readings for each kanji (최적화 #3)
   * @param {string} processedText - HTML text with ruby tags
   * @returns {Map<number, string>} - Map of position to reading
   */
  parseFuriganaMapping(processedText) {
    const furiganaMap = new Map();
    if (!processedText || typeof processedText !== "string") return furiganaMap;

    const rubyRegex = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g;

    // Build clean text from processedText (removing all HTML tags)
    const cleanText = processedText.replace(/<ruby>([^<]+)<rt>[^<]+<\/rt><\/ruby>/g, '$1');

    // Now parse the HTML and map positions
    let currentPos = 0;
    let lastMatchEnd = 0;
    let match;

    rubyRegex.lastIndex = 0;

    while ((match = rubyRegex.exec(processedText)) !== null) {
      const kanjiSequence = match[1];
      const reading = match[2];

      // Calculate position by counting plain text before this match
      const beforeMatch = processedText.substring(lastMatchEnd, match.index);
      const plainTextBefore = beforeMatch.replace(/<[^>]+>/g, '');
      currentPos += plainTextBefore.length;

      // Map each kanji to its reading
      if (kanjiSequence.length === 1) {
        furiganaMap.set(currentPos, reading);
      } else {
        // Multiple kanji - split the reading
        const kanjiChars = Array.from(kanjiSequence);
        const readingChars = Array.from(reading);
        const charsPerKanji = Math.floor(readingChars.length / kanjiChars.length);

        kanjiChars.forEach((kanji, idx) => {
          let kanjiReading;
          if (idx === kanjiChars.length - 1) {
            // Last kanji gets all remaining reading
            kanjiReading = readingChars.slice(idx * charsPerKanji).join('');
          } else {
            kanjiReading = readingChars.slice(idx * charsPerKanji, (idx + 1) * charsPerKanji).join('');
          }
          furiganaMap.set(currentPos + idx, kanjiReading);
        });
      }

      // Move position forward by the number of kanji
      currentPos += kanjiSequence.length;
      lastMatchEnd = match.index + match[0].length;
    }

    return furiganaMap;
  },

  /**
   * Apply furigana to Japanese text if enabled in settings
   * @param {string} text - The text to process
   * @returns {string} - Text with furigana HTML tags if applicable
   */
  applyFuriganaIfEnabled(text) {
    // Check if furigana is enabled and if the text contains Japanese
    if (!CONFIG?.visual?.["furigana-enabled"]) {
      return text;
    }

    if (!text || typeof text !== "string") {
      return text;
    }

    // Check if text contains kanji
    const kanjiRegex = /[\u4E00-\u9FAF\u3400-\u4DBF]/;
    if (!kanjiRegex.test(text)) {
      return text;
    }

    try {
      // Use FuriganaConverter if available

      if (typeof window.FuriganaConverter !== "undefined") {
        // Try to convert even if not fully initialized - it will return original text if not ready
        const result = window.FuriganaConverter.convertToFurigana(text);
        return result || text;
      } else {
      }
      return text;
    } catch (error) {
      return text;
    }
  },
  formatTime(timestamp) {
    if (Number.isNaN(timestamp)) return timestamp.toString();
    let minutes = Math.trunc(timestamp / 60000);
    let seconds = ((timestamp - minutes * 60000) / 1000).toFixed(2);

    if (minutes < 10) minutes = `0${minutes}`;
    if (seconds < 10) seconds = `0${seconds}`;

    return `${minutes}:${seconds}`;
  },
  formatTextWithTimestamps(text, startTime = 0) {
    if (text.props?.children) {
      return text.props.children
        .map((child) => {
          if (typeof child === "string") {
            return child;
          }
          if (child.props?.children) {
            return child.props?.children[0];
          }
        })
        .join("");
    }
    if (Array.isArray(text)) {
      let wordTime = startTime;
      return text
        .map((word) => {
          wordTime += word.time;
          return `${word.word}<${this.formatTime(wordTime)}>`;
        })
        .join("");
    }
    return text;
  },

  /**
   * 해당 줄의 활성화된 항목들만 복사하기 위한 텍스트 생성
   * @param {string|object} mainText - 메인 텍스트 (후리가나 HTML 포함 가능, 또는 객체)
   * @param {string} subText - 발음 (로마지 등)
   * @param {string} subText2 - 번역
   * @param {string} originalText - 원문 가사 (원본)
   * @returns {string} 복사할 텍스트
   */
  formatLyricLineToCopy(mainText, subText, subText2, originalText) {
    const lines = [];
    
    // HTML 태그 제거 헬퍼
    const cleanHtml = (text) => {
      if (!text || typeof text !== "string") return "";
      return text
        .replace(/<rt[^>]*>.*?<\/rt>/gi, "") // rt 태그 제거
        .replace(/<\/?ruby[^>]*>/gi, "") // ruby 태그 제거
        .replace(/<[^>]+>/g, "") // 기타 HTML 태그 제거
        .trim();
    };
    
    // 원문 처리 - originalText가 있으면 우선 사용, 없으면 mainText 사용
    let originalClean = "";
    if (originalText && typeof originalText === "string") {
      originalClean = cleanHtml(originalText);
    } else if (mainText && typeof mainText === "string") {
      originalClean = cleanHtml(mainText);
    } else if (mainText && typeof mainText === "object" && mainText.text) {
      // 카라오케 모드에서 line 객체인 경우
      originalClean = cleanHtml(mainText.text);
    }
    
    if (originalClean) {
      lines.push(originalClean);
    }
    
    // subText 처리 (발음)
    const subClean = cleanHtml(subText);
    if (subClean) {
      lines.push(subClean);
    }
    
    // subText2 처리 (번역)
    const sub2Clean = cleanHtml(subText2);
    if (sub2Clean) {
      lines.push(sub2Clean);
    }
    
    return lines.join("\n");
  },

  convertParsedToLRC(lyrics, isBelow) {
    let original = "";
    let conver = "";

    if (isBelow) {
      for (const line of lyrics) {
        if (line) {
          const startTime = line.startTime || 0;
          original += `[${this.formatTime(
            startTime
          )}]${this.formatTextWithTimestamps(
            line.originalText || "",
            startTime
          )}\n`;
          conver += `[${this.formatTime(
            startTime
          )}]${this.formatTextWithTimestamps(line.text || "", startTime)}\n`;
        }
      }
    } else {
      for (const line of lyrics) {
        if (line) {
          const startTime = line.startTime || 0;
          original += `[${this.formatTime(
            startTime
          )}]${this.formatTextWithTimestamps(line.text || "", startTime)}\n`;
        }
      }
    }

    return {
      original,
      conver,
    };
  },
  convertParsedToUnsynced(lyrics, isBelow) {
    let original = "";
    let conver = "";

    if (isBelow) {
      for (const line of lyrics) {
        if (typeof line.originalText === "object") {
          original += `${line.originalText?.props?.children?.[0]}\n`;
        } else {
          original += `${line.originalText}\n`;
        }

        if (typeof line.text === "object") {
          conver += `${line.text?.props?.children?.[0]}\n`;
        } else {
          conver += `${line.text}\n`;
        }
      }
    } else {
      for (const line of lyrics) {
        if (typeof line.text === "object") {
          original += `${line.text?.props?.children?.[0]}\n`;
        } else {
          original += `${line.text}\n`;
        }
      }
    }

    return {
      original,
      conver,
    };
  },
  parseLocalLyrics(lyrics) {
    // Preprocess lyrics by removing [tags] and empty lines
    const lines = lyrics
      .replaceAll(/\[[a-zA-Z]+:.+\]/g, "")
      .trim()
      .split("\n");

    const syncedTimestamp = /\[([0-9:.]+)\]/;
    const karaokeTimestamp = /<([0-9:.]+)>/;

    const unsynced = [];

    const isSynced = lines[0].match(syncedTimestamp);
    const synced = isSynced ? [] : null;

    const isKaraoke = lines[0].match(karaokeTimestamp);
    const karaoke = isKaraoke ? [] : null;

    function timestampToMs(timestamp) {
      const [minutes, seconds] = timestamp.replace(/\[\]<>/, "").split(":");
      return Number(minutes) * 60 * 1000 + Number(seconds) * 1000;
    }

    function parseKaraokeLine(line, startTime) {
      let wordTime = timestampToMs(startTime);
      const karaokeLine = [];
      const karaoke = line.matchAll(/(\S+ ?)<([0-9:.]+)>/g);
      for (const match of karaoke) {
        const word = match[1];
        const time = match[2];
        karaokeLine.push({ word, time: timestampToMs(time) - wordTime });
        wordTime = timestampToMs(time);
      }
      return karaokeLine;
    }

    for (const [i, line] of lines.entries()) {
      const time = line.match(syncedTimestamp)?.[1];
      let lyricContent = line.replace(syncedTimestamp, "").trim();
      const lyric = lyricContent.replaceAll(/<([0-9:.]+)>/g, "").trim();

      if (line.trim() !== "") {
        if (isKaraoke) {
          if (!lyricContent.endsWith(">")) {
            // For some reason there are a variety of formats for karaoke lyrics, Wikipedia is also inconsisent in their examples
            const endTime =
              lines[i + 1]?.match(syncedTimestamp)?.[1] ||
              this.formatTime(
                Number(Spicetify.Player.data.item.metadata.duration)
              );
            lyricContent += `<${endTime}>`;
          }
          const karaokeLine = parseKaraokeLine(lyricContent, time);
          karaoke.push({ text: karaokeLine, startTime: timestampToMs(time) });
        }
        isSynced &&
          time &&
          synced.push({ text: lyric || "♪", startTime: timestampToMs(time) });
        unsynced.push({ text: lyric || "♪" });
      }
    }

    return { synced, unsynced, karaoke };
  },
  processLyrics(lyrics) {
    return lyrics
      .replace(/　| /g, "") // Remove space
      .replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~？！，。、《》【】「」]/g, ""); // Remove punctuation
  },
  /**
   * Determines if a color is light or dark.
   * @param {string} color - The color in "rgb(r,g,b)" format.
   * @returns {boolean} - True if the color is light, false if dark.
   */
  isColorLight(color) {
    const [r, g, b] = color.match(/\d+/g).map(Number);
    // Using the luminance formula
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128;
  },

  /**
   * Current version of the lyrics-plus app
   */
  currentVersion: "2.3.2",

  /**
   * Check for updates from remote repository
   * @returns {Promise<{hasUpdate: boolean, currentVersion: string, latestVersion: string}>}
   */
  async checkForUpdates() {
    try {
      // Try multiple CDN URLs to avoid CORS issues
      const urls = [
        "https://raw.githubusercontent.com/ivLis-Studio/lyrics-plus/main/version.txt",
        "https://cdn.jsdelivr.net/gh/ivLis-Studio/lyrics-plus@main/version.txt",
        //https://ghproxy.link/
        "https://ghfast.top/https://raw.githubusercontent.com/ivLis-Studio/lyrics-plus/main/version.txt",
        "https://corsproxy.io/?url=https://raw.githubusercontent.com/ivLis-Studio/lyrics-plus/main/version.txt",
      ];

      let latestVersion = null;
      let lastError = null;

      for (const url of urls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per attempt

          const response = await fetch(url, {
            signal: controller.signal,
            cache: "no-cache",
            headers: {
              Accept: "text/plain, */*",
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          latestVersion = (await response.text()).trim();

          // If we successfully got a version, break the loop
          if (latestVersion && /^\d+\.\d+\.\d+$/.test(latestVersion)) {
            break;
          }
        } catch (error) {
          lastError = error;
          // Continue to next URL
          continue;
        }
      }

      if (!latestVersion) {
        throw (
          lastError || new Error(I18n.t("utils.allUrlsFailed"))
        );
      }

      // Validate version format (should be like "1.2.3")
      if (!/^\d+\.\d+\.\d+$/.test(latestVersion)) {
        throw new Error(`${I18n.t("utils.invalidVersionFormat")}: ${latestVersion}`);
      }

      const hasUpdate =
        this.compareVersions(latestVersion, this.currentVersion) > 0;

      return {
        hasUpdate,
        currentVersion: this.currentVersion,
        latestVersion,
      };
    } catch (error) {
      let errorMessage = I18n.t("utils.unknownError");
      if (error.name === "AbortError") {
        errorMessage = I18n.t("utils.requestTimeout");
      } else if (
        error.message.includes("fetch") ||
        error.message.includes("NetworkError")
      ) {
        errorMessage = I18n.t("utils.networkError");
      } else if (error.message.includes("CORS")) {
        errorMessage = I18n.t("utils.securityRestriction");
      } else if (error.message.includes("HTTP")) {
        errorMessage = I18n.t("utils.serverError");
      } else if (error.message.includes("URL") || error.message.includes("version")) {
        errorMessage = error.message;
      } else {
        errorMessage = error.message;
      }

      return {
        hasUpdate: false,
        currentVersion: this.currentVersion,
        latestVersion: this.currentVersion,
        error: errorMessage,
      };
    }
  },

  /**
   * Compare two version strings
   * @param {string} a - First version (e.g., "1.1.0")
   * @param {string} b - Second version (e.g., "1.0.9")
   * @returns {number} - 1 if a > b, -1 if a < b, 0 if equal
   */
  compareVersions(a, b) {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }

    return 0;
  },

  /**
   * Show update notification if available
   */
  async showUpdateNotificationIfAvailable() {
    try {
      const updateInfo = await this.checkForUpdates();

      console.log("[Lyrics Plus] Update check result:", updateInfo);

      // Don't show notification if there was an error
      if (updateInfo.error) {
        console.log("[Lyrics Plus] Update check error:", updateInfo.error);
        return updateInfo;
      }

      if (updateInfo.hasUpdate) {
        const updateKey = `lyrics-plus:update-dismissed:${updateInfo.latestVersion}`;
        const isDismissed = StorageManager.getItem(updateKey);

        console.log(
          "[Lyrics Plus] Update available:",
          updateInfo.latestVersion,
          "Dismissed:",
          isDismissed
        );

        if (!isDismissed) {
          // Store update info for the banner component
          window.lyricsPlus_updateInfo = {
            available: true,
            currentVersion: updateInfo.currentVersion,
            latestVersion: updateInfo.latestVersion,
            releaseUrl: `https://github.com/ivLis-Studio/lyrics-plus/releases/tag/v${updateInfo.latestVersion}`,
          };

          console.log(
            "[Lyrics Plus] Update banner info stored:",
            window.lyricsPlus_updateInfo
          );

          // Trigger re-render if lyrics container exists
          if (window.lyricContainer) {
            try {
              console.log("[Lyrics Plus] Triggering lyricContainer re-render");
              window.lyricContainer.forceUpdate();
            } catch (e) {
              console.error("[Lyrics Plus] Failed to trigger re-render:", e);
            }
          } else {
            console.warn("[Lyrics Plus] lyricContainer not found");
          }
        }
      } else {
        console.log("[Lyrics Plus] Already up to date");
      }

      return updateInfo;
    } catch (error) {
      // Silently fail for automatic update checks to avoid spam
      return {
        hasUpdate: false,
        currentVersion: this.currentVersion,
        latestVersion: this.currentVersion,
        error: error.message,
      };
    }
  },

  /**
   * Dismiss update notification
   */
  dismissUpdate(version) {
    const updateKey = `lyrics-plus:update-dismissed:${version}`;
    StorageManager.setItem(updateKey, "dismissed");
    window.lyricsPlus_updateInfo = null;

    // Trigger re-render
    if (window.lyricContainer) {
      try {
        window.lyricContainer.forceUpdate();
      } catch (e) { }
    }
  },

  /**
   * Copy to clipboard using Spicetify API
   */
  async copyToClipboard(text) {
    try {
      if (Spicetify?.Platform?.ClipboardAPI?.copy) {
        await Spicetify.Platform.ClipboardAPI.copy(text);
        return true;
      }
      // Fallback
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      return false;
    } catch (error) {
      console.error("[Utils] Copy failed:", error);
      return false;
    }
  },

  /**
   * Detect platform
   */
  detectPlatform() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("win")) return "windows";
    if (userAgent.includes("mac")) return "mac";
    return "linux";
  },

  /**
   * Get install command for current platform
   */
  getInstallCommand() {
    const commands = {
      windows: "iwr -useb https://ivlis.kr/lyrics-plus/install.ps1 | iex",
      mac: "curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh",
      linux: "curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh",
    };
    return commands[this.detectPlatform()];
  },

  /**
   * Get platform name in Korean
   */
  getPlatformName() {
    const names = {
      windows: "Windows PowerShell",
      mac: I18n.t("utils.terminalMac"),
      linux: "Terminal",
    };
    return names[this.detectPlatform()];
  },

  // Track-specific sync offset management (using IndexedDB)
  async getTrackSyncOffset(trackUri) {
    if (!trackUri) return 0;
    try {
      return await TrackSyncDB.getOffset(trackUri);
    } catch (error) {
      console.error("[Lyrics Plus] Failed to get track sync offset:", error);
      return 0;
    }
  },

  async setTrackSyncOffset(trackUri, offset) {
    if (!trackUri) return;
    try {
      await TrackSyncDB.setOffset(trackUri, offset);
      // Dispatch custom event to notify offset change
      window.dispatchEvent(new CustomEvent('lyrics-plus:offset-changed', {
        detail: { trackUri, offset }
      }));
    } catch (error) {
      console.error("[Lyrics Plus] Failed to set track sync offset:", error);
    }
  },

  async clearTrackSyncOffset(trackUri) {
    if (!trackUri) return;
    try {
      await TrackSyncDB.clearOffset(trackUri);
    } catch (error) {
      console.error("[Lyrics Plus] Failed to clear track sync offset:", error);
    }
  },

  // ==========================================
  // 커뮤니티 싱크 오프셋 시스템
  // ==========================================

  /**
   * 사용자 해시 가져오기 (없으면 생성)
   */
  getUserHash() {
    let hash = StorageManager.getPersisted("lyrics-plus:user-hash");
    if (!hash) {
      hash = crypto.randomUUID ? crypto.randomUUID() : 
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      StorageManager.setPersisted("lyrics-plus:user-hash", hash);
    }
    return hash;
  },

  /**
   * Track ID 추출 (spotify:track:xxx -> xxx)
   */
  extractTrackId(uri) {
    if (!uri) return null;
    const parts = uri.split(':');
    return parts.length >= 3 ? parts[2] : null;
  },

  /**
   * 커뮤니티 싱크 오프셋 조회
   */
  async getCommunityOffset(trackUri) {
    const trackId = this.extractTrackId(trackUri);
    if (!trackId) return null;

    // 1. 로컬 캐시 먼저 확인
    try {
      const cached = await LyricsCache.getSync(trackId);
      if (cached !== null) {
        console.log(`[Lyrics Plus] Using cached community offset for ${trackId}`);
        // 캐시 히트 로깅
        if (window.ApiTracker) {
          window.ApiTracker.logCacheHit('sync', `sync:${trackId}`, {
            offsetMs: cached.offsetMs,
            voteCount: cached.voteCount
          });
        }
        return cached;
      }
    } catch (e) {
      console.warn('[Lyrics Plus] Sync cache check failed:', e);
    }

    // 2. API 호출
    const userHash = this.getUserHash();
    const syncUrl = `https://lyrics.api.ivl.is/lyrics/sync?trackId=${trackId}&userHash=${userHash}`;

    // API 요청 로깅
    let logId = null;
    if (window.ApiTracker) {
      logId = window.ApiTracker.logRequest('sync', syncUrl, { trackId, userHash });
    }

    try {
      const response = await fetch(syncUrl);
      const data = await response.json();
      
      if (data.success && data.data) {
        if (window.ApiTracker && logId) {
          window.ApiTracker.logResponse(logId, { 
            offsetMs: data.data.offsetMs,
            voteCount: data.data.voteCount
          }, 'success');
        }
        // 로컬 캐시에 저장
        LyricsCache.setSync(trackId, data.data).catch(() => {});
        return data.data;
      }
      if (window.ApiTracker && logId) {
        window.ApiTracker.logResponse(logId, null, 'success', 'No offset found');
      }
      // 오프셋이 없는 경우도 캐시 (null 표시를 위한 빈 객체)
      LyricsCache.setSync(trackId, { offsetMs: null, voteCount: 0 }).catch(() => {});
      return null;
    } catch (error) {
      if (window.ApiTracker && logId) {
        window.ApiTracker.logResponse(logId, null, 'error', error.message);
      }
      console.error("[Lyrics Plus] Failed to get community offset:", error);
      return null;
    }
  },

  /**
   * 커뮤니티 싱크 오프셋 제출
   */
  async submitCommunityOffset(trackUri, offsetMs) {
    const trackId = this.extractTrackId(trackUri);
    if (!trackId) return null;

    const userHash = this.getUserHash();
    const syncUrl = 'https://lyrics.api.ivl.is/lyrics/sync';

    // API 요청 로깅
    let logId = null;
    if (window.ApiTracker) {
      logId = window.ApiTracker.logRequest('sync', syncUrl, { trackId, offsetMs, userHash, method: 'POST' });
    }

    try {
      const response = await fetch(syncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId,
          offsetMs,
          userHash
        })
      });
      const data = await response.json();
      
      if (data.success) {
        if (window.ApiTracker && logId) {
          window.ApiTracker.logResponse(logId, { submitted: true }, 'success');
        }
        console.log(`[Lyrics Plus] Community offset submitted: ${offsetMs}ms`);
        return data;
      }
      if (window.ApiTracker && logId) {
        window.ApiTracker.logResponse(logId, null, 'error', 'Submit failed');
      }
      return null;
    } catch (error) {
      if (window.ApiTracker && logId) {
        window.ApiTracker.logResponse(logId, null, 'error', error.message);
      }
      console.error("[Lyrics Plus] Failed to submit community offset:", error);
      return null;
    }
  },

  /**
   * 커뮤니티 싱크 피드백 제출
   */
  async submitCommunityFeedback(trackUri, isPositive) {
    const trackId = this.extractTrackId(trackUri);
    if (!trackId) return null;

    const userHash = this.getUserHash();

    try {
      const response = await fetch('https://lyrics.api.ivl.is/lyrics/sync/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackId,
          userHash,
          isPositive
        })
      });
      const data = await response.json();
      
      if (data.success) {
        console.log(`[Lyrics Plus] Community feedback submitted: ${isPositive ? '👍' : '👎'}`);
        return data;
      }
      return null;
    } catch (error) {
      console.error("[Lyrics Plus] Failed to submit community feedback:", error);
      return null;
    }
  },

  // ==========================================
  // 커뮤니티 영상 추천 시스템
  // ==========================================

  /**
   * 커뮤니티 영상 목록 조회
   */
  async getCommunityVideos(trackUri) {
    const trackId = this.extractTrackId(trackUri);
    if (!trackId) return null;

    const userHash = this.getUserHash();

    try {
      const response = await fetch(
        `https://lyrics.api.ivl.is/lyrics/youtube/community?trackId=${trackId}&userId=${userHash}`
      );
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error("[Lyrics Plus] Failed to get community videos:", error);
      return null;
    }
  },

  /**
   * 커뮤니티 영상 등록
   */
  async submitCommunityVideo(trackUri, videoId, videoTitle, startTime = 0) {
    const trackId = this.extractTrackId(trackUri);
    if (!trackId) return null;

    const userHash = this.getUserHash();
    const userName = Spicetify.Platform?.UserAPI?._currentUser?.displayName || 
                     Spicetify.User?.displayName || 
                     'Anonymous';

    try {
      const response = await fetch('https://lyrics.api.ivl.is/lyrics/youtube/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit',
          trackId,
          videoId,
          videoTitle,
          startTime,
          submitterId: userHash,
          submitterName: userName
        })
      });
      const data = await response.json();
      
      if (data.success) {
        console.log(`[Lyrics Plus] Community video submitted: ${videoId}`);
        return data;
      }
      return null;
    } catch (error) {
      console.error("[Lyrics Plus] Failed to submit community video:", error);
      return null;
    }
  },

  /**
   * 커뮤니티 영상 투표
   */
  async voteCommunityVideo(videoEntryId, voteType) {
    const userHash = this.getUserHash();

    try {
      const response = await fetch('https://lyrics.api.ivl.is/lyrics/youtube/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'vote',
          videoEntryId,
          voterId: userHash,
          voteType // 1=like, -1=dislike, 0=remove
        })
      });
      const data = await response.json();
      
      if (data.success) {
        console.log(`[Lyrics Plus] Community vote submitted: ${voteType > 0 ? '👍' : voteType < 0 ? '👎' : '취소'}`);
        return data;
      }
      return null;
    } catch (error) {
      console.error("[Lyrics Plus] Failed to vote community video:", error);
      return null;
    }
  },

  /**
   * 커뮤니티 영상 삭제 (본인만 가능)
   */
  async deleteCommunityVideo(videoEntryId) {
    const userHash = this.getUserHash();

    try {
      const response = await fetch(
        `https://lyrics.api.ivl.is/lyrics/youtube/community`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'delete',
            id: videoEntryId,
            submitterId: userHash
          })
        }
      );
      const data = await response.json();
      
      if (data.success) {
        console.log(`[Lyrics Plus] Community video deleted: ${videoEntryId}`);
        return data;
      }
      return null;
    } catch (error) {
      console.error("[Lyrics Plus] Failed to delete community video:", error);
      return null;
    }
  },

  /**
   * 현재 사용자의 해시 ID 가져오기
   */
  getCurrentUserHash() {
    return this.getUserHash();
  },

  // =========================================================================
  // IndexedDB 기반 선택한 커뮤니티 영상 저장/로드
  // =========================================================================
  
  /**
   * IndexedDB 데이터베이스 열기
   */
  async _openSelectedVideoDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LyricsPlusSelectedVideos', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('selectedVideos')) {
          db.createObjectStore('selectedVideos', { keyPath: 'trackUri' });
        }
      };
    });
  },
  
  /**
   * 선택한 영상 정보 저장 (IndexedDB)
   * @param {string} trackUri - 트랙 URI
   * @param {object} videoInfo - 영상 정보 (youtubeVideoId, youtubeTitle, captionStartTime 등)
   */
  async saveSelectedVideo(trackUri, videoInfo) {
    try {
      const db = await this._openSelectedVideoDB();
      const tx = db.transaction('selectedVideos', 'readwrite');
      const store = tx.objectStore('selectedVideos');
      
      // 저장
      store.put({
        trackUri,
        ...videoInfo,
        savedAt: Date.now()
      });
      
      // 트랜잭션 완료 대기
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      
      // 오래된 항목 정리 (30일 이상)
      this._cleanupOldSelectedVideos(db).catch(() => {});
      
      db.close();
      console.log(`[Lyrics Plus] Saved selected video for ${trackUri}:`, videoInfo.youtubeVideoId);
      return true;
    } catch (error) {
      console.error('[Lyrics Plus] Failed to save selected video:', error);
      return false;
    }
  },
  
  /**
   * 오래된 선택 영상 정리 (30일 이상)
   */
  async _cleanupOldSelectedVideos(db) {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const tx = db.transaction('selectedVideos', 'readwrite');
    const store = tx.objectStore('selectedVideos');
    
    const request = store.openCursor();
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.savedAt && cursor.value.savedAt < thirtyDaysAgo) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
  },
  
  /**
   * 저장된 선택 영상 정보 로드 (IndexedDB)
   * @param {string} trackUri - 트랙 URI
   * @returns {object|null} 저장된 영상 정보 또는 null
   */
  async getSelectedVideo(trackUri) {
    try {
      const db = await this._openSelectedVideoDB();
      const tx = db.transaction('selectedVideos', 'readonly');
      const store = tx.objectStore('selectedVideos');
      
      const result = await new Promise((resolve, reject) => {
        const request = store.get(trackUri);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      db.close();
      
      if (result) {
        console.log(`[Lyrics Plus] Loaded selected video for ${trackUri}:`, result.youtubeVideoId);
        return result;
      }
      return null;
    } catch (error) {
      console.error('[Lyrics Plus] Failed to load selected video:', error);
      return null;
    }
  },
  
  /**
   * 저장된 선택 영상 삭제 (기본 영상으로 되돌릴 때)
   * @param {string} trackUri - 트랙 URI
   */
  async removeSelectedVideo(trackUri) {
    try {
      const db = await this._openSelectedVideoDB();
      const tx = db.transaction('selectedVideos', 'readwrite');
      const store = tx.objectStore('selectedVideos');
      
      await new Promise((resolve, reject) => {
        const request = store.delete(trackUri);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
      db.close();
      console.log(`[Lyrics Plus] Removed selected video for ${trackUri}`);
      return true;
    } catch (error) {
      console.error('[Lyrics Plus] Failed to remove selected video:', error);
      return false;
    }
  },

  /**
   * YouTube URL에서 Video ID 추출
   */
  extractYouTubeVideoId(url) {
    if (!url) return null;
    
    // 이미 Video ID 형식인 경우 (11자리)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  },

  /**
   * YouTube 영상 제목 가져오기 (oEmbed API 사용)
   * @returns {Promise<string|null>} 영상 제목 또는 null (존재하지 않는 영상)
   */
  async getYouTubeVideoTitle(videoId) {
    if (!videoId) return null;
    
    try {
      // YouTube oEmbed API는 API 키 없이도 사용 가능
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      
      // 404 = 영상이 존재하지 않음, 401 = 비공개 영상
      if (response.status === 404 || response.status === 401) {
        console.log("[Lyrics Plus] YouTube video not found or private:", videoId);
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.title || null;
    } catch (error) {
      console.error("[Lyrics Plus] Failed to get YouTube title:", error);
      
      // 백업: noembed.com 사용
      try {
        const backupResponse = await fetch(
          `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
        );
        
        if (backupResponse.ok) {
          const backupData = await backupResponse.json();
          // noembed은 존재하지 않는 영상에 대해 error 필드를 반환함
          if (backupData.error) {
            console.log("[Lyrics Plus] Video not found via noembed:", videoId);
            return null;
          }
          return backupData.title || null;
        }
      } catch (backupError) {
        console.error("[Lyrics Plus] Backup title fetch also failed:", backupError);
      }
      
      return null;
    }
  },

  /**
   * YouTube 영상이 실제로 존재하고 재생 가능한지 확인
   * @returns {Promise<{valid: boolean, title: string|null, error: string|null}>}
   */
  async validateYouTubeVideo(videoId) {
    if (!videoId) {
      return { valid: false, title: null, error: 'invalidId' };
    }
    
    // 기본적인 ID 형식 검증 (11자리, 영숫자 + 특수문자)
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return { valid: false, title: null, error: 'invalidFormat' };
    }
    
    try {
      // oEmbed API로 영상 존재 여부 확인
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      
      // 404 = 영상이 존재하지 않음
      if (response.status === 404) {
        return { valid: false, title: null, error: 'notFound' };
      }
      
      // 401 = 비공개 영상
      if (response.status === 401) {
        return { valid: false, title: null, error: 'private' };
      }
      
      if (!response.ok) {
        return { valid: false, title: null, error: 'httpError' };
      }
      
      const data = await response.json();
      
      if (!data.title) {
        return { valid: false, title: null, error: 'noTitle' };
      }
      
      return { valid: true, title: data.title, error: null };
    } catch (error) {
      console.error("[Lyrics Plus] YouTube validation error:", error);
      return { valid: false, title: null, error: 'networkError' };
    }
  },
};
