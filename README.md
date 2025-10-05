# Lyrics Plus (한국어 커스텀 버전)

Spicetify용 **Lyrics Plus** 커스텀 앱을 뼈대만 남기고 모조리 다 수정해버린 버전입니다. Google Gemini API를 활용하여 고품질 한국어 번역 기능을 제공합니다.

https://github.com/user-attachments/assets/c865affb-1a7b-405c-86ac-e1421f426c58

---

## ✨ 주요 기능

### 1. Gemini API를 활용한 가사 번역
Google의 LLM 모델을 사용하여 자연스럽고 정확한 가사 번역을 제공합니다.
- 🌐 **2가지 디스플레이 모드 동시 지원**: 일본어(로마지), 한국어(로마자), 중국어(병음) 표기와 **한국어** 번역을 동시에 표시
- 🎶 **고품질 번역**: 음악적 맥락에 최적화된 번역으로 곡의 의미와 감정을 보존

### 2. 현대적인 UI & 최적화된 사용자 경험
- 🖼️ **투명 배경**: Spicetify 테마와 조화로운 투명 배경
- 🖱️ **자동 숨김 컨트롤**: 마우스 호버 시에만 설정 버튼 표시
- 🎬 **부드러운 전환 효과**: 가사 라인 간 매끄러운 애니메이션

### 3. 번역 최적화
- **중복 방지**: 원문과 동일한 번역 자동 숨김 처리

### 4. API 비용 최적화
- **중앙 프록시 서버**: API 비용을 아낄 수 있도록, 프록시 서버를 통해 API를 처리합니다. 다른 확장 프로그램 사용자가 번역한 적 있다면, Gemini API 를 사용하지 않고, 캐시되어있는 데이터를 사용하여 API 비용을 아낍니다. (사실 일반적인 사용정도로는 무료로 사용할 수 있을 정도로 GEMINI 의 사용량 제한이 널널하기에, 무료로 사용 가능합니다.)

---

## 🚀 설치 방법

### 1. 사전 준비
- Spotify (웹 버전 설치 필요, Microsoft Store 버전 불가)
- Spicetify 설치: https://spicetify.app/docs/getting-started

### 2. 간단 설치
1. 이 프로젝트를 다운로드하여 압축 해제
2. `lyrics-plus` 폴더를 Spicetify CustomApps 디렉토리에 복사 (lyrics-plus-main 폴더 이름에서 -main을 지우십시오.)
   - Windows: `%LocalAppData%\spicetify\CustomApps`
   - MacOS/Linux: `~/.config/spicetify/CustomApps`
3. 터미널에서 실행:
   ```
   spicetify config custom_apps lyrics-plus
   spicetify apply
   ```

---

## 🛠️ 초기 설정

1. Spotify 실행 후 Lyrics Plus 앱 열기
2. 아바타 클릭 → **Lyrics Plus config** 선택
3. GEMINI API 키 입력 API 발급은 여기서 -> https://aistudio.google.com/apikey?hl=ko
4. 음악 재생 후 가사 영역에 마우스 호버 → 번역 버튼(⇄) 클릭하여 번역 모드 활성화

---

**(개발 중인 프로젝트입니다. 문제 발생 시 피드백 부탁드립니다)**
