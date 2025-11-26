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

## 更新歷史

- [ ] 修復當發音/翻譯都禁用時，原歌詞顯示在發音字段的問題
- [ ] 與他人分享同步調整值以調整歌曲平均值的功能
- [ ] 防止伺服器在歌詞為純音樂/少於2行時響應
- [ ] 在卡拉OK和同步歌詞中啟用滾動
- [ ] 修復在FullScreen中跳過沒有歌詞的歌曲時歌詞無法正確重新載入的問題
- [ ] 修復同時啟用翻譯和發音時重新生成出現問題
- [ ] UI/UX英語和日語支持
- [ ] 緊急公告功能
- [ ] 根據翻譯和發音語言設置生成相應語言
- [ ] 在右側「正在播放」中添加歌詞（可能實現也可能不行）
- [x] ~~特定語言原文字體功能~~ 2.1.3更新（改進為支持2種以上字體）
- [x] ~~歌詞同步添加1000毫秒單位代替+-1~~ 2.1.2更新
- [x] ~~添加設置導出/導入功能~~ 2.0.8更新
- [x] ~~添加自定義歌詞頁面背景顏色選項~~ 2.0.6更新
- [x] ~~頂部欄模式鎖定功能~~ 2.0.5更新
- [x] ~~修復Spotify重啟後字體預覽標籤不顯示設置字體的問題~~ 2.0.4更新
- [x] ~~修復GitHub按鈕無法點擊的問題~~ 2.0.4更新
- [x] ~~為每個歌詞項目自定義字體~~ 2.0.3更新
- [x] ~~修復設置類別名稱問題~~ 2.0.2更新
- [x] ~~檢查更新版本和複製更新命令功能~~ 2.0.2更新
- [x] ~~修復啟用假名顯示時點擊歌詞按鈕導致播放列表重置的問題~~ 2.0.1更新
---

**(此項目正在開發中。如遇到任何問題，請提供反饋)**
