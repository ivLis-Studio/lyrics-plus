# Lyrics Translation API (Python)

A Python port of the PHP Lyrics Translation API that uses Google's Gemini AI for translating song lyrics to Korean with caching and duplicate request prevention.

## Features

- **AI-Powered Translation**: Uses Google Gemini 2.5 Flash for high-quality Korean translations
- **Phonetic Transcription**: Support for CJK phonetic transcription (Romaji, Pinyin, etc.)
- **Smart Caching**: File-based caching system to avoid redundant API calls
- **Duplicate Prevention**: Lock mechanism to prevent multiple simultaneous translations
- **CORS Support**: Ready for integration with Spotify web player
- **FastAPI**: Modern, fast web framework with automatic API documentation

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set your Gemini API key:**
   ```bash
   export GEMINI_API_KEY="your_gemini_api_key_here"
   ```

3. **Run the server:**
   ```bash
   python run_server.py
   ```

   Or directly:
   ```bash
   python main.py
   ```

The server will start on `http://localhost:8000` by default.

## API Endpoints

### POST / (Translation Request)

Translate lyrics to Korean or get phonetic transcription.

**Request body:**
```json
{
  "artist": "Artist Name",
  "title": "Song Title",
  "text": "Lyrics text to translate",
  "wantSmartPhonetic": false,
  "provider": "Spotify"
}
```

**Response:**
```json
{
  "vi": ["Translated line 1", "Translated line 2", "..."],
  "cached": false,
  "request_id": "req_12345"
}
```

### GET /?action=status&artist=...&title=...

Check translation status for a specific song.

### GET /?action=locks

View all active translation locks.

### GET /?action=cleanup

Clean up stale lock files (older than 30 minutes).

### GET /?action=stats

Get system statistics including cache usage and active translations.

### GET / (Default)

Get API information and available endpoints.

## Configuration

Edit `config.py` to customize:

- `CACHE_DIR`: Cache directory location
- `CACHE_LIFETIME`: Cache validity period (default: 30 days)
- `MAX_LYRICS_LENGTH`: Maximum lyrics length (default: 10,000 chars)
- `GEMINI_TIMEOUT`: API request timeout (default: 30 seconds)
- `HOST`/`PORT`: Server host and port settings

## Directory Structure

```
├── main.py              # FastAPI application
├── config.py            # Configuration settings
├── utils.py             # Cache and lock management utilities
├── gemini_api.py        # Gemini API integration
├── run_server.py        # Server startup script
├── requirements.txt     # Python dependencies
├── cache/              # Cache directory (created automatically)
└── logs/               # Log directory (if logging enabled)
```

## Testing

Test the API with curl:

```bash
# Test translation
curl -X POST "http://localhost:8000/" \
  -H "Content-Type: application/json" \
  -d '{
    "artist": "Test Artist",
    "title": "Test Song",
    "text": "Hello world\nHow are you?"
  }'

# Check status
curl "http://localhost:8000/?action=status&artist=Test%20Artist&title=Test%20Song"

# View statistics
curl "http://localhost:8000/?action=stats"
```

## API Documentation

When the server is running, visit `http://localhost:8000/docs` for interactive API documentation powered by FastAPI.

## Migration from PHP

This Python version maintains full compatibility with the original PHP API:

- Same request/response format
- Same caching structure
- Same lock mechanism
- Same CORS headers for Spotify integration

You can simply replace the PHP server with this Python version without changing client code.