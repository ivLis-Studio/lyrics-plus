# Lyrics Plus (한국어 커스텀 버전)

Spicetify용 **Lyrics Plus** 커스텀 앱을 뼈대만 남기고 모조리 다 수정해버린 버전입니다. Google Gemini API를 활용하여 한국어 발음과 번역을 제공합니다.

관심있으시면 따봉(스타) 부탁드립니다. PR 환영합니다. :D



넘치는 재력이 있으시다면... 커피 한 잔만 사주십시오...

<a href="https://www.buymeacoffee.com/ivlis" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>


각종 오류 및 ivLyrics의 싱크, 번역 문제는 디스코드에서 문의해주세요. : https://discord.gg/2fu36fUzdE


https://github.com/user-attachments/assets/c865affb-1a7b-405c-86ac-e1421f426c58

---

## 주요 기능

### 1. Gemini API를 활용한 가사 번역
- Google의 LLM 모델을 사용하여, 원어에 대한 발음 및 번역을 제공합니다.

### 2. 현대적인 UI & 최적화된 사용자 경험
- Full Screen 확장 프로그램과 연동
- 기존에 없던 부드러운 노래방 효과
- 뜯어고침

### 3. API 비용 최적화
- **중앙 프록시 서버**: API 비용을 아낄 수 있도록, 프록시 서버를 통해 API를 처리합니다. 다른 확장 프로그램 사용자가 번역한 적 있다면, Gemini API 를 사용하지 않고, 캐시되어있는 데이터를 사용하여 API 비용을 아낍니다. (사실 일반적인 사용정도로는 무료로 사용할 수 있을 정도로 GEMINI 의 사용량 제한이 널널하기에, 무료로 사용 가능합니다.)

---

## 설치 방법 

### 1. 사전 준비
- Spotify (웹 버전 설치 필요, Microsoft Store 버전 불가)
- Spicetify 설치: https://spicetify.app/docs/getting-started

Lyrics-Plus 는 spicetify의 확장 프로그램으로, Spicetify 가 설치되어 있어야 사용할 수 있습니다.
Spicetify 설치 방법은 아래를 참고하십시오.

### 2. Spicetify 설치 (이미 설치 되어있다면, 다음 단계로!)

*주의* : 관리자 권한으로 실행하면 안됩니다.

Windows : 
1. 시작 버튼을 누르고 "Windows Powershell" 프로그램을 실행합니다.
2. 아래 코드를 복사해서 붙여넣기 합니다.
   ```
   iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
   ```
5. 엔터를 누릅니다.

Mac Os :
1. Terminal (터미널) 앱을 실행합니다.
2. 아래 코드를 복사해서 붙여넣기 합니다.
   ```
   curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
   ```
4. 엔터를 누릅니다

설치 과정에서 Marketplace를 설치할지 물어보는 질문이 있습니다.
Marketplace에서 다운로드 받을 수 있는 FullScreen 확장프로그램과 Lyrics-Plus의 궁합이 아주 좋으므로 설치를 권장합니다.
설치 과정에서 영어로 묻는 질문에 엔터 또는 Y 로 설치 가능합니다.


### 3-1. 자동 설치 & 업데이트

설치와 업데이트 모두 동일한 방법으로 아래 명령어 하나로 한 번에 가능합니다.

Windows : 
1. 시작 버튼을 누르고 "Windows Powershell" 프로그램을 실행합니다.
2. 아래 코드를 복사해서 붙여넣기 합니다.
    ```
   iwr -useb https://ivlis.kr/lyrics-plus/install.ps1 | iex
    ```
3. 엔터를 누릅니다.

Mac Os :
1. Terminal (터미널) 앱을 실행합니다.
2. 아래 코드를 복사해서 붙여넣기 합니다.
   ```
   curl -fsSL https://ivlis.kr/lyrics-plus/install.sh | sh
   ```
3. 엔터를 누릅니다

### 3-2. 수동 설치
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

## 초기 설정

1. Spotify 실행 후 Lyrics Plus 앱 열기
2. 우측 하단 설정 버튼 -> 고급 -> Gemini API 키 입력
    ㄴ GEMINI API 키 입력 API 발급은 여기서 -> https://aistudio.google.com/apikey?hl=ko
3. 음악 재생 후 가사 영역에 마우스 호버 → 변환 버튼클릭하여 발음 및 번역 모드 활성화

---

## 긴급 초기화 방법
뭔가 제대로 동작이 안되는 것 같아요.
-> 초기화해봅시다!

1. cmd 혹은 터미널을 열고, spicetify enable-devtools 를 입력해줍니다.
2. spotify 창 아무곳이나 우클릭 후 Devtools를 열어줍니다.
3. Application -> Storage -> Clear site data 를 눌러줍니다.
<img width="917" height="311" alt="image" src="https://github.com/user-attachments/assets/ed560e07-f39e-4bfb-b514-ddf70277fada" />
4. 스포티파이를 클릭하고 컨트롤(커맨드) + 쉬프트 + R
5. 끝! 

---

## 업데이트 내역

- [ ] 발음 / 번역 둘 다 꺼져있을 때, 발음칸에 원어가 표시되는 문제 수정
- [ ] Spotify 계정으로 설정 동기화 기능
- [ ] 싱크조절 값을 다른 사람과 공유하여, 곡의 평균 값을 조정하는 기능
- [ ] 서버측에서 가사가 instrument / 2줄 이하로 표시되는 경우, 응답하지 않도록 방지
- [ ] 노래방, 싱크 가사에서 스크롤 가능하도록 변경
- [ ] FullScreen 에서 가사가 없는 곡을 지나갈 때, 제대로 가사가 다시 불러와지지 않는 문제 수정
- [ ] 번역과 발음이 같이 활성화 되어 있는 경우, 재생성이 뭔가 이상한 문제 수정
- [x] ~~설정 내보내기, 가져오기 기능 추가~~ 2.0.8 Update
- [x] ~~가사페이지 배경 색을 커스텀 할 수 있는 옵션 추가~~ 2.0.6 Update
- [x] ~~상단바 모드 고정 기능~~ 2.0.5 Update
- [x] ~~글자 외관 미리보기 탭이 스포티파이 재실행 후에 설정한 폰트로 보이지 않는 문제 해결~~ 2.0.4 Update
- [x] ~~Github 버튼이 눌리지 않던 문제 수정~~ 2.0.4 Update
- [x] ~~가사의 항목 별 폰트를 지정할~~ 2.0.3 Update
- [x] ~~설정 카테고리 이름 문제 해결~~ 2.0.2 Update
- [x] ~~업데이트 버전을 확인 및 업데이트 커맨드 복사 기능~~ 2.0.2 Update
- [x] ~~후리가나 표시가 활성화된 상태에서, 가사 버튼 클릭 시 재생목록이 초기화되던 문제 수정~~ 2.0.1 Update
---

**(개발 중인 프로젝트입니다. 문제 발생 시 피드백 부탁드립니다)**
