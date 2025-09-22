#!/usr/bin/env python3
"""
Start the Lyrics Translation API server
"""

import os
import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    # Set default environment variables if not set
    if not os.getenv("GEMINI_API_KEY"):
        print("Warning: GEMINI_API_KEY environment variable not set.")
        print("Please set it with: export GEMINI_API_KEY='your_api_key_here'")
        print("Using placeholder key for now...")

    from main import app
    import uvicorn
    from config import HOST, PORT

    print(f"Starting Lyrics Translation API server...")
    print(f"Server will run on: http://{HOST}:{PORT}")
    print(f"API documentation available at: http://{HOST}:{PORT}/docs")
    print("Press Ctrl+C to stop the server")

    uvicorn.run(app, host=HOST, port=PORT, reload=True)