# Lyrics Plus (韓国語カスタムバージョン)

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

## アップデート履歴

- [ ] 発音/翻訳が両方オフの時、発音欄に原語が表示される問題を修正
- [ ] 同期調整値を他のユーザーと共有して、曲の平均値を調整する機能
- [ ] サーバー側で歌詞がinstrumental/2行以下の場合、応答しないように防止
- [ ] カラオケ・同期歌詞でスクロール可能に変更
- [ ] FullScreenで歌詞のない曲を通過する時、歌詞が正しく再読み込みされない問題を修正
- [ ] 翻訳と発音が同時に有効な場合、再生成がおかしくなる問題を修正
- [ ] UI/UX 英語・日本語サポート
- [ ] 緊急告知機能
- [ ] 翻訳・発音言語設定に応じて該当言語で生成する機能
- [ ] 右側の「再生中」に歌詞を追加（可能かどうか不明）
- [x] ~~言語別原語フォント機能~~ 2.1.3 アップデート（2つ以上のフォントをサポートするように改善）
- [x] ~~歌詞同期 +-1 の代わりに1000単位を追加~~ 2.1.2 アップデート
- [x] ~~設定エクスポート・インポート機能を追加~~ 2.0.8 アップデート
- [x] ~~歌詞ページの背景色をカスタマイズできるオプションを追加~~ 2.0.6 アップデート
- [x] ~~トップバーモード固定機能~~ 2.0.5 アップデート
- [x] ~~Spotify再起動後、フォントプレビュータブで設定したフォントが表示されない問題を解決~~ 2.0.4 アップデート
- [x] ~~GitHubボタンが押せなかった問題を修正~~ 2.0.4 アップデート
- [x] ~~歌詞項目ごとのフォントを指定可能に~~ 2.0.3 アップデート
- [x] ~~設定カテゴリ名の問題を解決~~ 2.0.2 アップデート
- [x] ~~アップデートバージョン確認＆アップデートコマンドコピー機能~~ 2.0.2 アップデート
- [x] ~~ふりがな表示が有効な状態で、歌詞ボタンクリック時にプレイリストがリセットされる問題を修正~~ 2.0.1 アップデート
---

**(開発中のプロジェクトです。問題が発生した場合はフィードバックをお願いします)**
