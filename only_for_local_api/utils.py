import json
import os
import re
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import uuid

from config import CACHE_DIR, CACHE_LIFETIME, LOG_ENABLED, LOG_FILE


def write_log(message: str, level: str = "INFO") -> None:
    """Write log message to file if logging is enabled."""
    if not LOG_ENABLED or not LOG_FILE:
        return

    # Create log directory if it doesn't exist
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_message = f"[{timestamp}] [{level}] {message}\n"

    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(log_message)


def sanitize_filename(filename: str) -> str:
    """Remove invalid characters from filename."""
    # Characters that can't be used in filenames
    invalid_chars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'] + [chr(i) for i in range(32)]

    for char in invalid_chars:
        filename = filename.replace(char, '')

    # Replace spaces with underscores
    filename = filename.replace(' ', '_')

    # Limit length to 200 characters
    if len(filename) > 200:
        filename = filename[:200]

    return filename


def get_cache_file_path(artist: str, title: str, want_smart_phonetic: bool = False, provider: str = "Spotify") -> Path:
    """Generate cache file path."""
    artist_dir = sanitize_filename(artist)
    title_dir = sanitize_filename(title)

    # Determine filename based on provider
    if provider == "Spotify":
        filename = "phonetic.json" if want_smart_phonetic else "translation.json"
    else:
        provider_suffix = sanitize_filename(provider)
        filename = f"phonetic_{provider_suffix}.json" if want_smart_phonetic else f"translation_{provider_suffix}.json"

    # Directory path: cache/artist/title/
    dir_path = CACHE_DIR / artist_dir / title_dir
    dir_path.mkdir(parents=True, exist_ok=True)

    return dir_path / filename


def get_lock_file_path(artist: str, title: str, want_smart_phonetic: bool = False, provider: str = "Spotify") -> Path:
    """Generate lock file path."""
    artist_dir = sanitize_filename(artist)
    title_dir = sanitize_filename(title)

    # Determine filename based on provider
    if provider == "Spotify":
        filename = "phonetic.lock" if want_smart_phonetic else "translation.lock"
    else:
        provider_suffix = sanitize_filename(provider)
        filename = f"phonetic_{provider_suffix}.lock" if want_smart_phonetic else f"translation_{provider_suffix}.lock"

    # Directory path: cache/artist/title/
    dir_path = CACHE_DIR / artist_dir / title_dir
    dir_path.mkdir(parents=True, exist_ok=True)

    return dir_path / filename


def check_and_create_lock(artist: str, title: str, want_smart_phonetic: bool = False, provider: str = "Spotify") -> Dict[str, Any]:
    """Check for existing lock and create new one if needed."""
    lock_file = get_lock_file_path(artist, title, want_smart_phonetic, provider)

    # Check if lock file already exists
    if lock_file.exists():
        lock_time = lock_file.stat().st_mtime
        current_time = time.time()

        # Remove stale lock files (older than 30 minutes)
        if current_time - lock_time > 1800:  # 30 minutes = 1800 seconds
            lock_file.unlink()
            write_log(f"Stale lock file removed for: {artist} - {title}", "WARNING")
        else:
            # Translation in progress
            try:
                with open(lock_file, 'r', encoding='utf-8') as f:
                    lock_data = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                lock_data = {}

            return {
                "locked": True,
                "started_at": lock_data.get("started_at", datetime.fromtimestamp(lock_time).strftime("%Y-%m-%d %H:%M:%S")),
                "request_id": lock_data.get("request_id", "unknown")
            }

    # Create lock file
    request_id = f"req_{uuid.uuid4().hex}"
    lock_data = {
        "artist": artist,
        "title": title,
        "type": "phonetic" if want_smart_phonetic else "translation",
        "provider": provider,
        "started_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "request_id": request_id,
        "process_id": os.getpid()
    }

    with open(lock_file, 'w', encoding='utf-8') as f:
        json.dump(lock_data, f, ensure_ascii=False, indent=2)

    return {
        "locked": False,
        "request_id": request_id
    }


def release_lock(artist: str, title: str, want_smart_phonetic: bool = False, provider: str = "Spotify") -> bool:
    """Release translation lock."""
    lock_file = get_lock_file_path(artist, title, want_smart_phonetic, provider)

    if lock_file.exists():
        lock_file.unlink()
        write_log(f"Lock released for: {artist} - {title}")
        return True

    return False


def get_from_cache(artist: str, title: str, want_smart_phonetic: bool = False, provider: str = "Spotify") -> Optional[Dict[str, Any]]:
    """Get translation from cache."""
    cache_file = get_cache_file_path(artist, title, want_smart_phonetic, provider)

    if cache_file.exists():
        cache_time = cache_file.stat().st_mtime

        # Check cache validity
        if time.time() - cache_time < CACHE_LIFETIME:
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                data["cached"] = True
                data["cache_time"] = datetime.fromtimestamp(cache_time).strftime("%Y-%m-%d %H:%M:%S")
                data["provider"] = provider
                return data
            except (json.JSONDecodeError, FileNotFoundError):
                pass

    return None


def save_to_cache(artist: str, title: str, data: Dict[str, Any], want_smart_phonetic: bool = False, provider: str = "Spotify") -> None:
    """Save translation to cache."""
    cache_file = get_cache_file_path(artist, title, want_smart_phonetic, provider)

    # Add metadata to cache data
    cache_data = {
        **data,
        "artist": artist,
        "title": title,
        "translated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "is_phonetic": want_smart_phonetic,
        "provider": provider
    }

    with open(cache_file, 'w', encoding='utf-8') as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)


def get_all_active_locks() -> List[Dict[str, Any]]:
    """Get all active lock files."""
    locks = []

    if not CACHE_DIR.exists():
        return locks

    # Recursively find all .lock files
    for lock_file in CACHE_DIR.rglob("*.lock"):
        if lock_file.is_file():
            lock_time = lock_file.stat().st_mtime
            current_time = time.time()

            # Check if lock is stale (older than 30 minutes)
            is_stale = (current_time - lock_time) > 1800

            try:
                with open(lock_file, 'r', encoding='utf-8') as f:
                    lock_data = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                lock_data = {}

            locks.append({
                "file_path": str(lock_file),
                "data": lock_data,
                "created_at": datetime.fromtimestamp(lock_time).strftime("%Y-%m-%d %H:%M:%S"),
                "duration": int(current_time - lock_time),
                "is_stale": is_stale
            })

    return locks


def cleanup_stale_locks() -> int:
    """Clean up stale lock files."""
    cleaned = 0
    locks = get_all_active_locks()

    for lock in locks:
        if lock["is_stale"]:
            try:
                Path(lock["file_path"]).unlink()
                cleaned += 1
                lock_data = lock["data"]
                write_log(f"Cleaned stale lock: {lock_data.get('artist', 'unknown')} - {lock_data.get('title', 'unknown')} (duration: {lock['duration']}s)", "INFO")
            except FileNotFoundError:
                pass

    return cleaned


def get_translation_status(artist: str, title: str, want_smart_phonetic: bool = False, provider: str = "Spotify") -> Dict[str, Any]:
    """Get translation status."""
    # Check cache
    cached = get_from_cache(artist, title, want_smart_phonetic, provider)
    if cached:
        return {
            "status": "completed",
            "message": "번역이 완료되었습니다.",
            "cached": True,
            "cached_at": cached.get("cache_time", "unknown")
        }

    # Check lock file
    lock_file = get_lock_file_path(artist, title, want_smart_phonetic, provider)
    if lock_file.exists():
        lock_time = lock_file.stat().st_mtime
        current_time = time.time()
        duration = int(current_time - lock_time)

        if duration > 1800:  # Older than 30 minutes
            lock_file.unlink()
            return {
                "status": "failed",
                "message": "번역이 타임아웃되었습니다. 다시 시도해주세요.",
                "duration": duration
            }

        try:
            with open(lock_file, 'r', encoding='utf-8') as f:
                lock_data = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            lock_data = {}

        return {
            "status": "in_progress",
            "message": "번역이 진행 중입니다.",
            "started_at": lock_data.get("started_at", datetime.fromtimestamp(lock_time).strftime("%Y-%m-%d %H:%M:%S")),
            "duration": duration,
            "request_id": lock_data.get("request_id", "unknown")
        }

    return {
        "status": "not_found",
        "message": "해당 번역을 찾을 수 없습니다."
    }


def get_cache_stats() -> Dict[str, Any]:
    """Get cache statistics."""
    stats = {
        "total_artists": 0,
        "total_songs": 0,
        "total_translations": 0,
        "total_phonetics": 0,
        "cache_size_mb": 0
    }

    if not CACHE_DIR.exists():
        return stats

    # Traverse artist directories
    for artist_dir in CACHE_DIR.iterdir():
        if not artist_dir.is_dir() or artist_dir.name.startswith('.'):
            continue

        stats["total_artists"] += 1

        # Traverse song directories
        for song_dir in artist_dir.iterdir():
            if not song_dir.is_dir() or song_dir.name.startswith('.'):
                continue

            stats["total_songs"] += 1

            # Check translation files
            translation_file = song_dir / "translation.json"
            phonetic_file = song_dir / "phonetic.json"

            if translation_file.exists():
                stats["total_translations"] += 1
                stats["cache_size_mb"] += translation_file.stat().st_size

            if phonetic_file.exists():
                stats["total_phonetics"] += 1
                stats["cache_size_mb"] += phonetic_file.stat().st_size

    # Convert to MB
    stats["cache_size_mb"] = round(stats["cache_size_mb"] / 1024 / 1024, 2)

    return stats


def decode_json_string(s: str) -> str:
    """Decode JSON string."""
    if not isinstance(s, str):
        return ""

    return s.replace("\\n", "\n").replace("\\t", "\t").replace('\\"', '"').replace("\\\\", "\\")


def extract_gemini_json(text: str) -> Dict[str, Any]:
    """Extract JSON from Gemini response."""
    # Remove code fences
    raw = text.strip()
    raw = re.sub(r'```[a-z]*\n?', '', raw, flags=re.IGNORECASE | re.MULTILINE)
    raw = re.sub(r'```', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'^\s*json\s*$', '', raw, flags=re.IGNORECASE | re.MULTILINE)

    # Try direct JSON parsing
    try:
        parsed = json.loads(raw)
        if parsed is not None:
            if isinstance(parsed, dict) and ("vi" in parsed or "phonetic" in parsed):
                result = {}

                if "vi" in parsed:
                    result["vi"] = parsed["vi"] if isinstance(parsed["vi"], list) else decode_json_string(str(parsed["vi"]))

                if "phonetic" in parsed:
                    result["phonetic"] = parsed["phonetic"] if isinstance(parsed["phonetic"], list) else decode_json_string(str(parsed["phonetic"]))

                if "detected_language" in parsed:
                    result["detected_language"] = parsed["detected_language"]

                return result
    except json.JSONDecodeError:
        pass

    # Try extracting {...} block
    try:
        start = raw.find('{')
        end = raw.rfind('}')

        if start != -1 and end != -1 and end > start:
            parsed = json.loads(raw[start:end + 1])
            if parsed is not None and isinstance(parsed, dict) and ("vi" in parsed or "phonetic" in parsed):
                result = {}

                if "vi" in parsed:
                    result["vi"] = parsed["vi"] if isinstance(parsed["vi"], list) else decode_json_string(str(parsed["vi"]))

                if "phonetic" in parsed:
                    result["phonetic"] = parsed["phonetic"] if isinstance(parsed["phonetic"], list) else decode_json_string(str(parsed["phonetic"]))

                if "detected_language" in parsed:
                    result["detected_language"] = parsed["detected_language"]

                return result
    except json.JSONDecodeError:
        pass

    # Try regex extraction
    vi_match = re.search(r'"vi"\s*:\s*"([\s\S]*?)"\s*[},]', raw)
    vi_array_match = re.search(r'"vi"\s*:\s*(\[[\s\S]*?\])\s*[},]', raw)
    phonetic_match = re.search(r'"phonetic"\s*:\s*"([\s\S]*?)"\s*[},]', raw)
    phonetic_array_match = re.search(r'"phonetic"\s*:\s*(\[[\s\S]*?\])\s*[},]', raw)

    if vi_match or phonetic_match or vi_array_match or phonetic_array_match:
        result = {}

        if vi_array_match:
            try:
                result["vi"] = json.loads(vi_array_match.group(1))
            except json.JSONDecodeError:
                result["vi"] = decode_json_string(vi_match.group(1) if vi_match else "")
        elif vi_match:
            result["vi"] = decode_json_string(vi_match.group(1))

        if phonetic_array_match:
            try:
                result["phonetic"] = json.loads(phonetic_array_match.group(1))
            except json.JSONDecodeError:
                result["phonetic"] = decode_json_string(phonetic_match.group(1) if phonetic_match else "")
        elif phonetic_match:
            result["phonetic"] = decode_json_string(phonetic_match.group(1))

        return result

    # Fallback
    return {"vi": text.replace("\\n", "\n")}