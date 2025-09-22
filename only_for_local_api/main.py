from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uvicorn

from config import ALLOWED_ORIGINS, ALLOWED_METHODS, ALLOWED_HEADERS, HOST, PORT, MAX_LYRICS_LENGTH
from utils import (
    write_log, get_from_cache, save_to_cache, check_and_create_lock, release_lock,
    get_translation_status, get_all_active_locks, cleanup_stale_locks, get_cache_stats
)
from gemini_api import call_gemini_api

app = FastAPI(
    title="Lyrics Translation API",
    description="Lyrics Translation API with Caching and Duplicate Prevention",
    version="1.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS + ["*"],  # Allow all for OPTIONS requests
    allow_credentials=True,
    allow_methods=ALLOWED_METHODS,
    allow_headers=ALLOWED_HEADERS,
)


class TranslationRequest(BaseModel):
    artist: str
    title: str
    text: str
    wantSmartPhonetic: Optional[bool] = False
    provider: Optional[str] = "Spotify"


@app.options("/{path:path}")
async def options_handler(path: str):
    """Handle CORS preflight requests."""
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Accept, Origin, User-Agent, X-Requested-With",
            "Access-Control-Max-Age": "3600"
        }
    )


@app.get("/")
async def root(
    action: Optional[str] = None,
    artist: Optional[str] = None,
    title: Optional[str] = None,
    wantSmartPhonetic: Optional[bool] = False,
    provider: Optional[str] = "Spotify"
):
    """Handle GET requests for status and management functions."""

    if action == "status":
        # Check specific translation status
        if not artist or not title:
            raise HTTPException(status_code=400, detail="artist와 title 파라미터가 필요합니다.")

        status = get_translation_status(artist, title, wantSmartPhonetic, provider)
        return status

    elif action == "locks":
        # Get active locks list
        locks = get_all_active_locks()
        return {
            "total_locks": len(locks),
            "locks": locks
        }

    elif action == "cleanup":
        # Clean up stale lock files
        cleaned = cleanup_stale_locks()
        return {
            "message": f"오래된 Lock 파일 {cleaned}개가 정리되었습니다.",
            "cleaned_count": cleaned
        }

    elif action == "stats":
        # System statistics
        locks = get_all_active_locks()
        cache_stats = get_cache_stats()
        return {
            "active_translations": len(locks),
            "cache_stats": cache_stats,
            "locks": [
                {
                    "artist": lock["data"].get("artist", "unknown"),
                    "title": lock["data"].get("title", "unknown"),
                    "type": lock["data"].get("type", "unknown"),
                    "duration": lock["duration"],
                    "is_stale": lock["is_stale"]
                }
                for lock in locks
            ]
        }

    else:
        # Default API info
        return {
            "message": "Lyrics Translation API with Duplicate Prevention",
            "version": "1.1.0",
            "available_actions": {
                "POST /": "번역 요청",
                "GET /?action=status&artist=...&title=...": "번역 상태 확인",
                "GET /?action=locks": "활성 Lock 목록",
                "GET /?action=cleanup": "오래된 Lock 정리",
                "GET /?action=stats": "시스템 통계"
            },
            "features": {
                "duplicate_prevention": True,
                "caching": True,
                "lock_timeout": "30 minutes",
                "supported_types": ["translation", "phonetic"]
            }
        }


@app.post("/")
async def translate_lyrics(request: TranslationRequest):
    """Handle translation requests."""

    # Validate input
    artist = request.artist.strip()
    title = request.title.strip()
    text = request.text.strip()
    want_smart_phonetic = request.wantSmartPhonetic
    provider = request.provider.strip()

    if not artist or not title or not text:
        raise HTTPException(status_code=400, detail="artist, title, text는 비어있을 수 없습니다.")

    # Validate lyrics length
    if len(text) > MAX_LYRICS_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"가사가 너무 깁니다. 최대 {MAX_LYRICS_LENGTH}자까지 가능합니다."
        )

    # Logging
    write_log(f"Translation requested for: {artist} - {title} (provider: {provider})")

    # Check cache
    cached = get_from_cache(artist, title, want_smart_phonetic, provider)

    if cached:
        cache_type = "phonetic" if want_smart_phonetic else "translation"
        write_log(f"Cache hit for {cache_type}: {artist} - {title} (provider: {provider})")
        return cached

    # Check for duplicate requests and create lock
    lock_result = check_and_create_lock(artist, title, want_smart_phonetic, provider)

    if lock_result["locked"]:
        # Translation already in progress
        request_type = "phonetic" if want_smart_phonetic else "translation"
        write_log(f"Duplicate translation request blocked for {request_type}: {artist} - {title} (provider: {provider})", "WARNING")

        return JSONResponse(
            status_code=202,
            content={
                "error": False,
                "message": "현재 해당 노래의 번역이 진행 중입니다. 잠시 후 다시 시도해주세요.",
                "status": "translation_in_progress",
                "started_at": lock_result["started_at"],
                "request_id": lock_result["request_id"],
                "retry_after": 30,
                "artist": artist,
                "title": title,
                "type": "phonetic" if want_smart_phonetic else "translation",
                "provider": provider
            }
        )

    request_id = lock_result["request_id"]
    request_type = "phonetic" if want_smart_phonetic else "translation"

    try:
        # Call Gemini API
        write_log(f"Calling Gemini 2.5 Flash API for {request_type}: {artist} - {title} (provider: {provider}, request_id: {request_id})")
        result = call_gemini_api(artist, title, text, want_smart_phonetic)

        # Save to cache
        save_to_cache(artist, title, result, want_smart_phonetic, provider)
        write_log(f"Translation cached for {request_type}: {artist} - {title} (provider: {provider}, request_id: {request_id})")

        # Release lock
        release_lock(artist, title, want_smart_phonetic, provider)

        # Return result
        result["cached"] = False
        result["request_id"] = request_id
        return result

    except Exception as e:
        # Release lock on error
        release_lock(artist, title, want_smart_phonetic, provider)
        write_log(f"Translation failed for {request_type}: {artist} - {title} (provider: {provider}, request_id: {request_id}) - {str(e)}", "ERROR")
        raise HTTPException(status_code=500, detail=str(e))


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    write_log(f"Error: {str(exc)}", "ERROR")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": str(exc)
        }
    )


if __name__ == "__main__":
    # Create cache directory
    from config import CACHE_DIR
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Starting Lyrics Translation API server on {HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT)