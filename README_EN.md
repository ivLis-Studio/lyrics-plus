<img width="100%" alt="preview-eng" src="https://github.com/user-attachments/assets/f42d4732-4960-4f2b-99e6-a68973b00f7d" />

---

<p align="center">
  <a href="README.md">한국어</a> |
  <a href="README_EN.md">English</a>
</p>

---

### Lyrics Plus - Enjoy Music, with your Language.

A lyrics extension for Spicetify. Supports pronunciation display and translation for various languages using the Google Gemini API.

For bug reports and feature suggestions, please contact us via GitHub Issues or [Discord](https://discord.gg/2fu36fUzdE).

![preview](https://github.com/user-attachments/assets/0596a769-76aa-49c5-970c-85897fe8d260)

---

## Key Features

### Lyrics Translation & Pronunciation
- Real-time lyrics translation via Google Gemini API
- Romanization support for various languages including Japanese, Korean, and Chinese
- Furigana (ふりがな) display for Japanese lyrics

### User Interface
- Karaoke-style lyrics display (word-by-word highlighting)
- Fullscreen mode support
- YouTube music video background playback
- Per-song sync offset adjustment
- Community sync offset sharing
- Various font, color, and layout customization options

### Supported Languages
Korean, English, Japanese, Chinese (Simplified/Traditional), Spanish, French, German, Italian, Portuguese, Russian, Arabic, Hindi, Bengali, Thai, Vietnamese, Indonesian

---

## Installation

### 1. Install Spotify

The latest version installed from the official Spotify website may not be compatible with Spicetify. Install a compatible version using the methods below.

If you already have Spotify installed, please uninstall it first.

#### Windows
Open PowerShell and run the following command:
```powershell
iex "& { $(iwr -useb 'https://amd64fox.github.io/Rollback-Spotify/run.ps1') } -version 1.2.76.298-x64"
```

#### macOS
Open Terminal and run the following command:
```bash
bash <(curl -sSL https://raw.githubusercontent.com/jetfir3/TBZify/main/tbzify.sh) -v 1.2.76.298
```

#### Manual Download
- Windows: https://loadspot.pages.dev/?os=win&build=release&search=1.2.76.298
- macOS: https://loadspot.pages.dev/?os=mac&build=release&search=1.2.76.298

### 2. Install Spicetify

Skip this step if you already have Spicetify installed.

Do not run as administrator.

#### Windows
Open PowerShell and run the following command:
```powershell
iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
```

#### macOS / Linux
Open Terminal and run the following command:
```bash
curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
```

When prompted to install Marketplace during installation, enter Y. Using it with the FullScreen extension from Marketplace provides a better experience.

### 3. Install Lyrics Plus

#### Automatic Installation (Recommended)

If you just installed Spicetify, restart PowerShell or Terminal before proceeding.

##### Windows
```powershell
iwr -useb https://ivlis.kr/lyrics-plus/install.ps1 | iex
```

##### macOS / Linux
```bash
curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh
```

Updates can also be done with the same command.

#### Manual Installation

1. Download the latest version from [GitHub Releases](https://github.com/ivLis-Studio/lyrics-plus/releases).
2. Extract and rename the folder to `lyrics-plus`.
3. Copy the folder to the Spicetify CustomApps directory:
   - Windows: `%LocalAppData%\spicetify\CustomApps`
   - macOS/Linux: `~/.config/spicetify/CustomApps`
4. Run the following commands in the terminal:
   ```
   spicetify config custom_apps lyrics-plus
   spicetify apply
   ```

---

## Initial Setup

1. Launch Spotify and select Lyrics Plus from the left menu.
2. Click the settings button at the bottom right.
3. Enter your Gemini API key in the Advanced tab.
   - You can get an API key for free from [Google AI Studio](https://aistudio.google.com/apikey).
4. Play music and click the conversion button that appears when hovering over the lyrics area to enable translation/pronunciation mode.

---

## Troubleshooting

### How to Reset

If you experience issues with settings or lyrics display:

1. Run the `spicetify enable-devtools` command in the terminal.
2. Right-click in the Spotify window and select "Inspect Element" or "Developer Tools".
3. Go to Application tab > Storage > Click "Clear site data".
4. Click on the Spotify window and press Ctrl+Shift+R (macOS: Cmd+Shift+R) to refresh.

### Common Issues

- **Lyrics not displaying**: Check if lyrics providers are enabled in settings.
- **Translation not working**: Verify that your Gemini API key is entered correctly.
- **Spotify won't launch**: Run `spicetify restore` followed by `spicetify apply`.

---

## Support

If you'd like to support development, please buy me a coffee.

<a href="https://www.buymeacoffee.com/ivlis" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

