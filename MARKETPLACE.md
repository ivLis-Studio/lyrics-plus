# How to install?

##### Windows
Run the following command in PowerShell.
```powershell
iwr -useb https://ivlis.kr/lyrics-plus/install.ps1 | iex
```

##### macOS / Linux
Run the following command in Terminal.
```bash
curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh
```


---



A lyrics extension for Spicetify. Supports pronunciation notation and translation for various languages using the Google Gemini API.

For bug reports and feature suggestions, please contact us via GitHub Issues or [Discord](https://discord.gg/2fu36fUzdE).

![preview](https://github.com/user-attachments/assets/0596a769-76aa-49c5-970c-85897fe8d260)

---

## Key Features

### Lyrics Translation and Pronunciation Notation
- Real-time lyrics translation via Google Gemini API
- Romanization support for various languages including Japanese, Korean, and Chinese
- Furigana (ふりがな) display for Japanese lyrics

### User Interface
- Karaoke-style lyrics display (word-by-word highlight)
- Fullscreen mode support
- YouTube music video background playback
- Sync offset adjustment per song
- Community sync offset sharing feature
- Various font, color, and layout customization options

### Supported Languages
Korean, English, Japanese, Chinese (Simplified/Traditional), Spanish, French, German, Italian, Portuguese, Russian, Arabic, Hindi, Bengali, Thai, Vietnamese, Indonesian

---

## Initial Setup

1. Launch Spotify and select Lyrics Plus from the left menu.
2. Click the settings button at the bottom right.
3. Enter your Gemini API key in the Advanced tab.
   - You can get a free API key from [Google AI Studio](https://aistudio.google.com/apikey).
4. Play music and click the convert button that appears when hovering over the lyrics area to activate translation/pronunciation mode.

---

## Troubleshooting

### How to Reset

If you experience issues with settings or lyrics display:

1. Run the `spicetify enable-devtools` command in Terminal.
2. Right-click on the Spotify window and select "Inspect Element" or "Developer Tools".
3. Go to Application tab > Storage > Click "Clear site data".
4. Click on the Spotify window and press Ctrl+Shift+R (macOS: Cmd+Shift+R) to refresh.

### Common Issues

- **Lyrics not displaying**: Check if the lyrics provider is enabled in settings.
- **Translation not working**: Make sure the Gemini API key is entered correctly.
- **Spotify not launching**: Run `spicetify restore` followed by `spicetify apply`.

---

## Support

If you'd like to support the development, please buy me a coffee.

<a href="https://www.buymeacoffee.com/ivlis" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
