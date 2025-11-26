# Lyrics Plus (全新的)

<p align="center">
  <a href="README.md">한국어</a> |
  <a href="README_EN.md">English</a> |
  <a href="README_JA.md">日本語</a> |
  <a href="README_ZH_CN.md">简体中文</a> |
  <a href="README_ZH_TW.md">繁體中文</a>
</p>

这是一个针对Spicetify的**Lyrics Plus**自定义应用的深度修改版本，几乎从头重写。它使用Google Gemini API提供发音和翻译功能。

如果您觉得有用，请给个Star！欢迎PR。:D

如有任何错误或ivLyrics同步/翻译问题，请在Discord上联系我们：https://discord.gg/2fu36fUzdE

# 支持
如果您有多余的零钱...请请我喝杯咖啡...

<a href="https://www.buymeacoffee.com/ivlis" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


https://github.com/user-attachments/assets/c865affb-1a7b-405c-86ac-e1421f426c58

---

## 主要功能

### 1. 使用Gemini API翻译歌词
- 使用Google的LLM模型，为任何语言的歌词提供发音和翻译。

### 2. 现代化UI和优化的用户体验
- 与FullScreen扩展集成
- 流畅的卡拉OK效果（以前没有）
- 全面改进

### 3. API成本优化
- **中央代理服务器**：通过代理服务器处理API请求以节省成本。如果其他扩展用户已经翻译过相同的歌词，将使用缓存数据而不是调用Gemini API。（实际上，Gemini的使用限制对于正常使用来说足够宽松，所以基本上是免费的。）

---

## 安装指南

### 1. 安装Spotify（如果最新版本有问题，请安装旧版本）

如果您从官方网站安装了Spotify，可能与Spicetify不兼容。
请使用以下命令安装可打补丁的Spotify版本。此方法还会阻止自动更新。

如果已安装Spotify，请先卸载。

Windows：
1. 点击开始按钮，运行"Windows PowerShell"。
2. 复制并粘贴以下代码：
```
iex "& { $(iwr -useb 'https://amd64fox.github.io/Rollback-Spotify/run.ps1') } -version 1.2.76.298-x64"
```
3. 按Enter。

MacOS：
1. 打开终端应用。
2. 复制并粘贴以下代码：
```
bash <(curl -sSL https://raw.githubusercontent.com/jetfir3/TBZify/main/tbzify.sh) -v 1.2.76.298
```
3. 按Enter。


或者您可以从以下链接手动下载：

Windows：https://loadspot.pages.dev/?os=win&build=release&search=1.2.76.298

Mac：https://loadspot.pages.dev/?os=mac&build=release&search=1.2.76.298


### 2. 安装Spicetify（如果已安装，请跳过！）

*警告*：请勿以管理员身份运行。

Windows：
1. 点击开始按钮，运行"Windows PowerShell"。
2. 复制并粘贴以下代码：
   ```
   iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
   ```
3. 按Enter。

MacOS：
1. 打开终端应用。
2. 复制并粘贴以下代码：
   ```
   curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
   ```
3. 按Enter。

安装过程中会询问是否要安装Marketplace。
我们建议安装，因为Marketplace中的FullScreen扩展与Lyrics-Plus配合得很好。
提示时按Enter或Y进行安装。


### 3-1. 自动安装和更新

**重要**：如果您刚安装了Spicetify，请先重启PowerShell。

安装和更新都可以用一个命令完成：

Windows：
1. 点击开始按钮，运行"Windows PowerShell"。
2. 复制并粘贴以下代码：
    ```
   iwr -useb https://ivlis.kr/lyrics-plus/install.ps1 | iex
    ```
3. 按Enter。

MacOS：
1. 打开终端应用。
2. 复制并粘贴以下代码：
   ```
   curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh
   ```
3. 按Enter。

### 3-2. 手动安装
1. 下载并解压此项目
2. 将`lyrics-plus`文件夹复制到Spicetify CustomApps目录（如果文件夹名为"lyrics-plus-main"，请删除"-main"）
   - Windows：`%LocalAppData%\spicetify\CustomApps`
   - MacOS/Linux：`~/.config/spicetify/CustomApps`
3. 在终端运行：
   ```
   spicetify config custom_apps lyrics-plus
   spicetify apply
   ```

---

## 初始设置

1. 打开Spotify并进入Lyrics Plus应用
2. 设置按钮（右下角）-> 高级 -> 输入Gemini API密钥
    - 在此获取GEMINI API密钥 -> https://aistudio.google.com/apikey
3. 播放音乐，将鼠标悬停在歌词区域 → 点击转换按钮启用发音和翻译模式

---

## 紧急重置
似乎有些东西不能正常工作。
-> 让我们重置！

1. 打开cmd或终端，输入`spicetify enable-devtools`
2. 右键单击Spotify窗口的任意位置，打开DevTools
3. 点击Application -> Storage -> Clear site data
<img width="917" height="311" alt="image" src="https://github.com/user-attachments/assets/ed560e07-f39e-4bfb-b514-ddf70277fada" />
4. 点击Spotify并按Ctrl(Cmd) + Shift + R
5. 完成！

---
