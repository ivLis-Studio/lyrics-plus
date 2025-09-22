import os
from pathlib import Path

# Configuration settings
CACHE_DIR = Path(__file__).parent / "cache"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY_HERE")
CACHE_LIFETIME = 30 * 24 * 60 * 60  # 30 days in seconds
DEBUG_MODE = False
LOG_ENABLED = False
LOG_FILE = Path(__file__).parent / "logs" / "api.log"
MAX_LYRICS_LENGTH = 10000
GEMINI_TIMEOUT = 30

# CORS settings
ALLOWED_ORIGINS = ["https://xpui.app.spotify.com"]
ALLOWED_METHODS = ["POST", "GET", "OPTIONS"]
ALLOWED_HEADERS = ["Content-Type", "Accept", "Origin", "User-Agent", "X-Requested-With"]

# Server settings
HOST = "0.0.0.0"
PORT = 8000