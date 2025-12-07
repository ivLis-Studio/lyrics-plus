<img width="100%" alt="preview" src="https://github.com/user-attachments/assets/679830cb-2bad-485f-9b22-9fed6f2e1773" />

---

<p align="center">
  <a href="README.md">한국어</a> |
  <a href="README_EN.md">English</a>
</p>

---

<img src="https://api.star-history.com/svg?repos=ivLis-Studio/lyrics-plus&type=date" width="420px" align="right" style="display: inline-block;"/>

### Lyrics Plus - 당신의 언어로 즐기는, 그런 음악.


Spicetify용 가사 확장 프로그램입니다. Google Gemini API를 활용하여 다양한 언어의 발음 표기와 번역을 지원합니다.

버그 리포트 및 기능 제안은 GitHub Issues 또는 [Discord](https://discord.gg/2fu36fUzdE)를 통해 문의해주세요.

![preview](https://github.com/user-attachments/assets/0596a769-76aa-49c5-970c-85897fe8d260)

---

## 주요 기능

### 가사 번역 및 발음 표기
- Google Gemini API를 통한 실시간 가사 번역
- 일본어, 한국어, 중국어 등 다양한 언어의 로마자 발음 표기 지원
- 일본어 가사에 후리가나(ふりがな) 표시 기능

### 사용자 인터페이스
- 노래방 스타일 가사 표시 (단어별 하이라이트)
- 전체 화면 모드 지원
- 유튜브 뮤직비디오 배경 재생
- 가사별 싱크 오프셋 조정
- 커뮤니티 싱크 오프셋 공유 기능
- 다양한 폰트, 색상, 레이아웃 커스터마이징

### 지원 언어
한국어, 영어, 일본어, 중국어(간체/번체), 스페인어, 프랑스어, 독일어, 이탈리아어, 포르투갈어, 러시아어, 아랍어, 페르시아어, 힌디어, 벵골어, 태국어, 베트남어, 인도네시아어

---

## 설치 방법

### 1. Spotify 설치

Spotify 공식 홈페이지를 통해 설치한 최신 버전은 Spicetify와 호환되지 않을 수 있습니다. 아래 방법으로 호환 가능한 버전을 설치하세요.

기존에 Spotify가 설치되어 있다면 먼저 삭제해주세요.

#### Windows
PowerShell을 실행하고 다음 명령어를 입력합니다:
```powershell
iex "& { $(iwr -useb 'https://amd64fox.github.io/Rollback-Spotify/run.ps1') } -version 1.2.76.298-x64"
```

#### macOS
터미널을 실행하고 다음 명령어를 입력합니다:
```bash
bash <(curl -sSL https://raw.githubusercontent.com/jetfir3/TBZify/main/tbzify.sh) -v 1.2.76.298
```

#### 수동 다운로드
- Windows: https://loadspot.pages.dev/?os=win&build=release&search=1.2.76.298
- macOS: https://loadspot.pages.dev/?os=mac&build=release&search=1.2.76.298

### 2. Spicetify 설치

이미 Spicetify가 설치되어 있다면 이 단계를 건너뛰세요.

관리자 권한으로 실행하지 마세요.

#### Windows
PowerShell을 실행하고 다음 명령어를 입력합니다:
```powershell
iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
```

#### macOS / Linux
터미널을 실행하고 다음 명령어를 입력합니다:
```bash
curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
```

설치 과정에서 Marketplace 설치 여부를 묻는 질문이 나오면 Y를 입력하세요. Marketplace의 FullScreen 확장 프로그램과 함께 사용하면 더 나은 경험을 할 수 있습니다.

### 3. Lyrics Plus 설치

#### 자동 설치 (권장)

Spicetify 설치 직후라면 PowerShell 또는 터미널을 재시작한 후 진행하세요.

##### Windows
```powershell
iwr -useb https://ivlis.kr/lyrics-plus/install.ps1 | iex
```

##### macOS / Linux
```bash
curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh
```

업데이트도 동일한 명령어로 가능합니다.

#### 수동 설치

1. [GitHub Releases](https://github.com/ivLis-Studio/lyrics-plus/releases)에서 최신 버전을 다운로드합니다.
2. 압축을 해제하고 폴더 이름을 `lyrics-plus`로 변경합니다.
3. 해당 폴더를 Spicetify CustomApps 디렉토리에 복사합니다:
   - Windows: `%LocalAppData%\spicetify\CustomApps`
   - macOS/Linux: `~/.config/spicetify/CustomApps`
4. 터미널에서 다음 명령어를 실행합니다:
   ```
   spicetify config custom_apps lyrics-plus
   spicetify apply
   ```

---

## 초기 설정

1. Spotify를 실행하고 좌측 메뉴에서 Lyrics Plus를 선택합니다.
2. 우측 하단의 설정 버튼을 클릭합니다.
3. 고급 탭에서 Gemini API 키를 입력합니다.
   - API 키는 [Google AI Studio](https://aistudio.google.com/apikey?hl=ko)에서 무료로 발급받을 수 있습니다.
4. 음악을 재생하고 가사 영역에 마우스를 올리면 나타나는 변환 버튼을 클릭하여 번역/발음 모드를 활성화합니다.

---

## 문제 해결

### 초기화 방법

설정이나 가사 표시에 문제가 있는 경우:

1. 터미널에서 `spicetify enable-devtools` 명령어를 실행합니다.
2. Spotify 창에서 우클릭 후 "Inspect Element" 또는 "개발자 도구"를 선택합니다.
3. Application 탭 > Storage > "Clear site data"를 클릭합니다.
4. Spotify 창을 클릭하고 Ctrl+Shift+R (macOS: Cmd+Shift+R)을 눌러 새로고침합니다.

### 자주 발생하는 문제

- **가사가 표시되지 않음**: 설정에서 가사 제공자가 활성화되어 있는지 확인하세요.
- **번역이 작동하지 않음**: Gemini API 키가 올바르게 입력되었는지 확인하세요.
- **Spotify가 실행되지 않음**: `spicetify restore` 후 `spicetify apply`를 다시 실행하세요.

---

## 후원

개발을 지원해주시려면 커피 한 잔 사주세요.

<a href="https://www.buymeacoffee.com/ivlis" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


