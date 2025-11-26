# Lyrics Plus (全く新しい)

<p align="center">
  <a href="README.md">한국어</a> |
  <a href="README_EN.md">English</a> |
  <a href="README_JA.md">日本語</a> |
  <a href="README_ZH_CN.md">简体中文</a> |
  <a href="README_ZH_TW.md">繁體中文</a>
</p>

Spicetify用の**Lyrics Plus**カスタムアプリを、骨組みだけ残して全面的に改修したバージョンです。Google Gemini APIを活用して、発音と翻訳を提供します。

興味があれば、スターをお願いします！PRも歓迎です。:D

各種エラーやivLyricsの同期・翻訳問題については、Discordでお問い合わせください：https://discord.gg/2fu36fUzdE

# サポート
もし余裕があれば...コーヒーを一杯おごってください...

<a href="https://www.buymeacoffee.com/ivlis" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


https://github.com/user-attachments/assets/c865affb-1a7b-405c-86ac-e1421f426c58

---

## 主な機能

### 1. Gemini APIを活用した歌詞翻訳
- GoogleのLLMモデルを使用して、原語の発音と翻訳を提供します。

### 2. モダンなUI＆最適化されたユーザー体験
- FullScreen拡張機能との連携
- 今までにない滑らかなカラオケエフェクト
- 全面的な改善

### 3. APIコスト最適化
- **中央プロキシサーバー**：APIコストを節約するため、プロキシサーバーを通じてAPIを処理します。他の拡張機能ユーザーが既に翻訳したことがあれば、Gemini APIを使用せずにキャッシュされたデータを使用してAPIコストを節約します。（実際、通常の使用量ではGeminiの使用制限が十分に余裕があるため、無料で使用できます。）

---

## インストール方法

### 1. Spotifyのインストール（最新バージョンで問題がある場合、旧バージョンのインストール方法）

Spotify公式サイトからSpotifyをインストールした場合、Spicetifyと互換性がない可能性があります。
以下のコマンドでパッチ可能なバージョンのSpotifyをインストールしてください。この方法でSpotifyをインストールすると、自動更新がブロックされます。

Spotifyが既にインストールされている場合は、アンインストールしてから進めてください。

Windows：
1. スタートボタンを押して「Windows PowerShell」を実行します。
2. 以下のコードをコピーして貼り付けます：
```
iex "& { $(iwr -useb 'https://amd64fox.github.io/Rollback-Spotify/run.ps1') } -version 1.2.76.298-x64"
```
3. Enterを押します。

MacOS：
1. ターミナルアプリを開きます。
2. 以下のコードをコピーして貼り付けます：
```
bash <(curl -sSL https://raw.githubusercontent.com/jetfir3/TBZify/main/tbzify.sh) -v 1.2.76.298
```
3. Enterを押します。


または、以下のリンクから手動でダウンロードできます：

Windows：https://loadspot.pages.dev/?os=win&build=release&search=1.2.76.298

Mac：https://loadspot.pages.dev/?os=mac&build=release&search=1.2.76.298


### 2. Spicetifyのインストール（既にインストール済みの場合は次のステップへ！）

*注意*：管理者権限で実行しないでください。

Windows：
1. スタートボタンを押して「Windows PowerShell」を実行します。
2. 以下のコードをコピーして貼り付けます：
   ```
   iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
   ```
3. Enterを押します。

MacOS：
1. ターミナルアプリを開きます。
2. 以下のコードをコピーして貼り付けます：
   ```
   curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
   ```
3. Enterを押します。

インストール中にMarketplaceをインストールするかどうか尋ねられます。
MarketplaceからダウンロードできるFullScreen拡張機能とLyrics-Plusの相性が非常に良いため、インストールをお勧めします。
英語の質問にはEnterまたはYでインストールできます。


### 3-1. 自動インストール＆アップデート

**重要**：Spicetifyをインストールした直後の場合は、PowerShellを再起動してください。

インストールとアップデートは同じ方法で、以下のコマンド一つで可能です：

Windows：
1. スタートボタンを押して「Windows PowerShell」を実行します。
2. 以下のコードをコピーして貼り付けます：
    ```
   iwr -useb https://ivlis.kr/lyrics-plus/install.ps1 | iex
    ```
3. Enterを押します。

MacOS：
1. ターミナルアプリを開きます。
2. 以下のコードをコピーして貼り付けます：
   ```
   curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh
   ```
3. Enterを押します。

### 3-2. 手動インストール
1. このプロジェクトをダウンロードして解凍
2. `lyrics-plus`フォルダをSpicetify CustomAppsディレクトリにコピー（フォルダ名が「lyrics-plus-main」の場合は「-main」を削除してください）
   - Windows：`%LocalAppData%\spicetify\CustomApps`
   - MacOS/Linux：`~/.config/spicetify/CustomApps`
3. ターミナルで実行：
   ```
   spicetify config custom_apps lyrics-plus
   spicetify apply
   ```

---

## 初期設定

1. Spotifyを起動してLyrics Plusアプリを開く
2. 右下の設定ボタン -> 詳細設定 -> Gemini APIキーを入力
    - GEMINI APIキーはこちらで取得 -> https://aistudio.google.com/apikey
3. 音楽を再生し、歌詞エリアにマウスをホバー → 変換ボタンをクリックして発音・翻訳モードを有効化

---

## 緊急リセット方法
何かがうまく動作していないようです。
-> リセットしましょう！

1. cmdまたはターミナルを開き、`spicetify enable-devtools`を入力
2. Spotifyウィンドウの任意の場所を右クリックしてDevToolsを開く
3. Application -> Storage -> Clear site dataをクリック
<img width="917" height="311" alt="image" src="https://github.com/user-attachments/assets/ed560e07-f39e-4bfb-b514-ddf70277fada" />
4. Spotifyをクリックして Ctrl(Cmd) + Shift + R を押す
5. 完了！

---
