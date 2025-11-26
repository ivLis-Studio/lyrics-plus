# Lyrics Plus (全新的)

<p align="center">
  <a href="README.md">한국어</a> |
  <a href="README_EN.md">English</a> |
  <a href="README_JA.md">日本語</a> |
  <a href="README_ZH_CN.md">简体中文</a> |
  <a href="README_ZH_TW.md">繁體中文</a>
</p>

這是一個針對Spicetify的**Lyrics Plus**自定義應用的深度修改版本，幾乎從頭重寫。它使用Google Gemini API提供發音和翻譯功能。

如果您覺得有用，請給個Star！歡迎PR。:D

如有任何錯誤或ivLyrics同步/翻譯問題，請在Discord上聯繫我們：https://discord.gg/2fu36fUzdE

# 支持
如果您有多餘的零錢...請請我喝杯咖啡...

<a href="https://www.buymeacoffee.com/ivlis" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


https://github.com/user-attachments/assets/c865affb-1a7b-405c-86ac-e1421f426c58

---

## 主要功能

### 1. 使用Gemini API翻譯歌詞
- 使用Google的LLM模型，為任何語言的歌詞提供發音和翻譯。

### 2. 現代化UI和優化的用戶體驗
- 與FullScreen擴展集成
- 流暢的卡拉OK效果（以前沒有）
- 全面改進

### 3. API成本優化
- **中央代理伺服器**：通過代理伺服器處理API請求以節省成本。如果其他擴展用戶已經翻譯過相同的歌詞，將使用緩存數據而不是調用Gemini API。（實際上，Gemini的使用限制對於正常使用來說足夠寬鬆，所以基本上是免費的。）

---

## 安裝指南

### 1. 安裝Spotify（如果最新版本有問題，請安裝舊版本）

如果您從官方網站安裝了Spotify，可能與Spicetify不兼容。
請使用以下命令安裝可打補丁的Spotify版本。此方法還會阻止自動更新。

如果已安裝Spotify，請先卸載。

Windows：
1. 點擊開始按鈕，運行"Windows PowerShell"。
2. 複製並貼上以下代碼：
```
iex "& { $(iwr -useb 'https://amd64fox.github.io/Rollback-Spotify/run.ps1') } -version 1.2.76.298-x64"
```
3. 按Enter。

MacOS：
1. 打開終端應用。
2. 複製並貼上以下代碼：
```
bash <(curl -sSL https://raw.githubusercontent.com/jetfir3/TBZify/main/tbzify.sh) -v 1.2.76.298
```
3. 按Enter。


或者您可以從以下連結手動下載：

Windows：https://loadspot.pages.dev/?os=win&build=release&search=1.2.76.298

Mac：https://loadspot.pages.dev/?os=mac&build=release&search=1.2.76.298


### 2. 安裝Spicetify（如果已安裝，請跳過！）

*警告*：請勿以管理員身份運行。

Windows：
1. 點擊開始按鈕，運行"Windows PowerShell"。
2. 複製並貼上以下代碼：
   ```
   iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
   ```
3. 按Enter。

MacOS：
1. 打開終端應用。
2. 複製並貼上以下代碼：
   ```
   curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
   ```
3. 按Enter。

安裝過程中會詢問是否要安裝Marketplace。
我們建議安裝，因為Marketplace中的FullScreen擴展與Lyrics-Plus配合得很好。
提示時按Enter或Y進行安裝。


### 3-1. 自動安裝和更新

**重要**：如果您剛安裝了Spicetify，請先重啟PowerShell。

安裝和更新都可以用一個命令完成：

Windows：
1. 點擊開始按鈕，運行"Windows PowerShell"。
2. 複製並貼上以下代碼：
    ```
   iwr -useb https://ivlis.kr/lyrics-plus/install.ps1 | iex
    ```
3. 按Enter。

MacOS：
1. 打開終端應用。
2. 複製並貼上以下代碼：
   ```
   curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh
   ```
3. 按Enter。

### 3-2. 手動安裝
1. 下載並解壓此項目
2. 將`lyrics-plus`資料夾複製到Spicetify CustomApps目錄（如果資料夾名為"lyrics-plus-main"，請刪除"-main"）
   - Windows：`%LocalAppData%\spicetify\CustomApps`
   - MacOS/Linux：`~/.config/spicetify/CustomApps`
3. 在終端運行：
   ```
   spicetify config custom_apps lyrics-plus
   spicetify apply
   ```

---

## 初始設置

1. 打開Spotify並進入Lyrics Plus應用
2. 設置按鈕（右下角）-> 進階 -> 輸入Gemini API密鑰
    - 在此獲取GEMINI API密鑰 -> https://aistudio.google.com/apikey
3. 播放音樂，將滑鼠懸停在歌詞區域 → 點擊轉換按鈕啟用發音和翻譯模式

---

## 緊急重置
似乎有些東西不能正常工作。
-> 讓我們重置！

1. 打開cmd或終端，輸入`spicetify enable-devtools`
2. 右鍵單擊Spotify視窗的任意位置，打開DevTools
3. 點擊Application -> Storage -> Clear site data
<img width="917" height="311" alt="image" src="https://github.com/user-attachments/assets/ed560e07-f39e-4bfb-b514-ddf70277fada" />
4. 點擊Spotify並按Ctrl(Cmd) + Shift + R
5. 完成！

---


**(此項目正在開發中。如遇到任何問題，請提供反饋)**
