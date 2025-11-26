# Lyrics Plus (brand-new)

<p align="center">
  <a href="README.md">한국어</a> |
  <a href="README_EN.md">English</a> |
  <a href="README_JA.md">日本語</a> |
  <a href="README_ZH_CN.md">简体中文</a> |
  <a href="README_ZH_TW.md">繁體中文</a>
</p>

A heavily modified version of the **Lyrics Plus** custom app for Spicetify, rebuilt from the ground up. It provides pronunciation and translation using the Google Gemini API.

If you find this useful, please give it a star! PRs are welcome. :D

For any bugs or issues with ivLyrics sync/translation, please contact us on Discord: https://discord.gg/2fu36fUzdE

# Support
If you have some spare change... please buy me a coffee...

<a href="https://www.buymeacoffee.com/ivlis" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


https://github.com/user-attachments/assets/c865affb-1a7b-405c-86ac-e1421f426c58

---

## Key Features

### 1. Lyrics Translation with Gemini API
- Uses Google's LLM model to provide pronunciation and translation for lyrics in any language.

### 2. Modern UI & Optimized User Experience
- Integration with FullScreen extension
- Smooth karaoke effects (not available before)
- Complete overhaul

### 3. API Cost Optimization
- **Central Proxy Server**: API requests are processed through a proxy server to save costs. If another extension user has already translated the same lyrics, cached data is used instead of calling the Gemini API. (In fact, Gemini's usage limits are generous enough for regular use, so it's essentially free.)

---

## Installation Guide

### 1. Installing Spotify (For older version if you have issues with the latest)

If you installed Spotify from the official website, it may not be compatible with Spicetify.
Use the commands below to install a patchable version of Spotify. This method also blocks automatic updates.

If Spotify is already installed, please uninstall it first.

Windows:
1. Press the Start button and run "Windows PowerShell".
2. Copy and paste the following code:
```
iex "& { $(iwr -useb 'https://amd64fox.github.io/Rollback-Spotify/run.ps1') } -version 1.2.76.298-x64"
```
3. Press Enter.

MacOS:
1. Open the Terminal app.
2. Copy and paste the following code:
```
bash <(curl -sSL https://raw.githubusercontent.com/jetfir3/TBZify/main/tbzify.sh) -v 1.2.76.298
```
3. Press Enter.


Or you can download manually from the links below:

Windows: https://loadspot.pages.dev/?os=win&build=release&search=1.2.76.298

Mac: https://loadspot.pages.dev/?os=mac&build=release&search=1.2.76.298


### 2. Installing Spicetify (Skip if already installed!)

*Warning*: Do NOT run as administrator.

Windows:
1. Press the Start button and run "Windows PowerShell".
2. Copy and paste the following code:
   ```
   iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
   ```
3. Press Enter.

MacOS:
1. Open the Terminal app.
2. Copy and paste the following code:
   ```
   curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
   ```
3. Press Enter.

During installation, you'll be asked if you want to install Marketplace.
We recommend installing it since the FullScreen extension from Marketplace works great with Lyrics-Plus.
Press Enter or Y to install when prompted.


### 3-1. Automatic Installation & Update

**Important**: If you just installed Spicetify, please restart PowerShell first.

Both installation and updates can be done with a single command:

Windows:
1. Press the Start button and run "Windows PowerShell".
2. Copy and paste the following code:
    ```
   iwr -useb https://ivlis.kr/lyrics-plus/install.ps1 | iex
    ```
3. Press Enter.

MacOS:
1. Open the Terminal app.
2. Copy and paste the following code:
   ```
   curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh
   ```
3. Press Enter.

### 3-2. Manual Installation
1. Download and extract this project
2. Copy the `lyrics-plus` folder to the Spicetify CustomApps directory (Remove "-main" from the folder name if it's "lyrics-plus-main")
   - Windows: `%LocalAppData%\spicetify\CustomApps`
   - MacOS/Linux: `~/.config/spicetify/CustomApps`
3. Run in terminal:
   ```
   spicetify config custom_apps lyrics-plus
   spicetify apply
   ```

---

## Initial Setup

1. Open Spotify and go to the Lyrics Plus app
2. Settings button (bottom right) -> Advanced -> Enter Gemini API key
    - Get your GEMINI API key here -> https://aistudio.google.com/apikey
3. Play music, hover over the lyrics area → Click the convert button to enable pronunciation and translation mode

---

## Emergency Reset
Something doesn't seem to be working properly.
-> Let's reset!

1. Open cmd or terminal and type `spicetify enable-devtools`
2. Right-click anywhere in the Spotify window and open DevTools
3. Click Application -> Storage -> Clear site data
<img width="917" height="311" alt="image" src="https://github.com/user-attachments/assets/ed560e07-f39e-4bfb-b514-ddf70277fada" />
4. Click on Spotify and press Ctrl(Cmd) + Shift + R
5. Done!

---

## Update History

- [ ] Fix issue where original lyrics appear in pronunciation field when both pronunciation/translation are disabled
- [ ] Feature to share sync adjustment values with others to adjust the average value for songs
- [ ] Prevent server from responding when lyrics are instrumental / less than 2 lines
- [ ] Enable scrolling in karaoke and synced lyrics
- [ ] Fix issue where lyrics don't reload properly when passing songs without lyrics in FullScreen
- [ ] Fix regeneration issues when both translation and pronunciation are enabled
- [ ] UI/UX support for English and Japanese
- [ ] Emergency announcement feature
- [ ] Generate in the corresponding language based on translation and pronunciation language settings
- [ ] Add lyrics to "Now Playing" on the right side (may or may not be possible)
- [x] ~~Language-specific original font feature~~ 2.1.3 Update (Improved to support 2+ fonts)
- [x] ~~Add 1000ms unit instead of +-1 for lyrics sync~~ 2.1.2 Update
- [x] ~~Add settings export/import feature~~ 2.0.8 Update
- [x] ~~Add option to customize lyrics page background color~~ 2.0.6 Update
- [x] ~~Top bar mode lock feature~~ 2.0.5 Update
- [x] ~~Fix font preview tab not showing set font after Spotify restart~~ 2.0.4 Update
- [x] ~~Fix GitHub button not working~~ 2.0.4 Update
- [x] ~~Custom fonts for each lyrics item~~ 2.0.3 Update
- [x] ~~Fix settings category name issue~~ 2.0.2 Update
- [x] ~~Check update version & copy update command feature~~ 2.0.2 Update
- [x] ~~Fix playlist reset issue when clicking lyrics button with furigana enabled~~ 2.0.1 Update
---

**(This project is under development. Please provide feedback if you encounter any issues)**
