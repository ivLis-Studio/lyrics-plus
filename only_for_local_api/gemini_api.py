import json
import requests
from typing import Dict, Any
from urllib.parse import urlencode

from config import GEMINI_API_KEY, GEMINI_TIMEOUT
from utils import extract_gemini_json


def call_gemini_api(artist: str, title: str, text: str, want_smart_phonetic: bool = False) -> Dict[str, Any]:
    """Call Gemini API for translation or phonetic transcription."""
    line_count = len(text.split('\n'))

    # Generate prompt
    if want_smart_phonetic:
        prompt = f"""You are a linguistics expert specializing in CJK phonetic transcription. Your task is to detect the language of the lyrics and transcribe them to the correct phonetic system.

**Instructions**:

1.  **Line Integrity**: The output MUST contain exactly {line_count} lines. Each transcribed line must correspond to the original line's position. Do not add, merge, or remove lines.

2.  **Language Detection & Transcription**:
    - **If Japanese**: Transcribe to **Hepburn Romaji**.
        - Use macrons for long vowels (e.g., とうきょう → Tōkyō).
        - Particles: は→wa, へ→e, を→o.
        - Syllabic 'ん' before vowel/y -> n' (e.g., しんや → shin'ya).
    - **If Korean**: Transcribe to **Revised Romanization (Romaja)**.
    - **If Chinese**: Transcribe to **Hanyu Pinyin** with tone marks.

3.  **Preserve Content**:
    - Leave all non-CJK text (English, numbers) and punctuation unchanged.
    - Preserve empty lines.

**Verification**:
- [ ] Output has exactly {line_count} lines.
- [ ] Language correctly identified and transcribed.
- [ ] Non-CJK text and punctuation are preserved.

**Song Info**:
- Artist: {artist}
- Title: {title}

**Output Format**:
- Respond with ONLY a single, raw JSON object.
- Do NOT use markdown code fences.
- Translate to Korean!!
- Translate to Korean!!
- JSON schema: {{"phonetic": "transcribed_lyrics_with_\\n_for_newlines", "detected_language": "ja|ko|zh"}}

**Input Lyrics**:
----
{text}
----"""
    else:
        # Korean translation prompt
        prompt = f"""You are a professional lyrics translator and musical storyteller. Your task is to translate the provided song lyrics into natural, artistic, and emotionally resonant Korean. Your translation should capture both the artistic sensibility and accuracy of the original, conveying the song's flow and emotions naturally.

**--- Rules you MUST follow ---**

**1. Line Count MUST Match (Very Important):**
- The output must have exactly the same number of lines ({line_count}) as the input.
- If a line is empty in the input, the corresponding output line must also be empty.
- If a line contains only a single word, translate it as a single line.
- Do not merge, split, or omit any lines.
- Never split lines. Never merge lines. (Very Important)
- To maintain the natural flow, never split or merge lines arbitrarily during translation.
- Do not miss the line.
- Double-check that you have not skipped any lines or left any part untranslated.

**2. Prioritize Artistry and Emotion:**
- Go beyond literal translation; express the original mood and emotion in beautiful, natural Korean.
- Ensure the translation flows naturally and can be sung as Korean lyrics.
- Avoid stiff or unnatural expressions; use poetic and musical language.

**3. Respect Nuance and Cultural Elements:**
- Properly adapt metaphors, idioms, and cultural elements into Korean.
- The original emotion (e.g., joy, sadness, anger) should be clearly reflected in the translation.

**4. Final Check:**
- Make sure the result array has exactly {line_count} elements. If not, revise it.
- Do not miss the line.
- Double-check that you have not skipped any lines or left any part untranslated or blank (except when the original line is also empty).

**--- Example ---**

**Input (5 lines):**
Hello world

How are you?
♪
(Yeah)

**Output (5 lines, structure preserved):**
["안녕 세상아", "", "잘 지내?", "♪", "(Yeah)"]

**--- Song Info ---**
- Artist: {artist}
- Title: {title}

**--- Output Format ---**
- Return ONLY a single JSON object.
- Do NOT use markdown, code blocks, or any extra text—just pure JSON.
- JSON structure: {{"vi": ["1st translated line", "2nd line", ...]}}

**--- Lyrics to Translate ---**
----
{text}
----"""

    endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={urlencode(GEMINI_API_KEY)}"

    body = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 1,  # Consistent translation with low temperature
            "maxOutputTokens": 20000  # Enhanced token limit for Gemini 2.5 Flash
        }
    }

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Spicetify-LyricsPlus-Server/1.0"
    }

    try:
        response = requests.post(
            endpoint,
            json=body,
            headers=headers,
            timeout=GEMINI_TIMEOUT
        )

        if response.status_code != 200:
            error_msg = "API 오류"
            if response.status_code == 401:
                error_msg = "잘못된 API 키입니다. Gemini API 키를 확인하세요."
            elif response.status_code == 403:
                error_msg = "API 접근이 금지되었습니다. API 키 권한을 확인하세요."
            elif response.status_code == 429:
                error_msg = "요청 한도를 초과했습니다. 잠시 후 다시 시도하세요."
            elif response.status_code in [500, 502, 503]:
                error_msg = "Gemini 서비스를 일시적으로 사용할 수 없습니다. 나중에 다시 시도하세요."

            raise Exception(f"{error_msg} (HTTP {response.status_code})")

        data = response.json()

        if "candidates" not in data or not data["candidates"] or \
           "content" not in data["candidates"][0] or \
           "parts" not in data["candidates"][0]["content"] or \
           not data["candidates"][0]["content"]["parts"] or \
           "text" not in data["candidates"][0]["content"]["parts"][0]:
            raise Exception("API에서 번역 결과를 받지 못했습니다.")

        raw_text = data["candidates"][0]["content"]["parts"][0]["text"]

        # Extract and parse JSON
        return extract_gemini_json(raw_text)

    except requests.exceptions.RequestException as e:
        raise Exception(f"API 요청 실패: {str(e)}")