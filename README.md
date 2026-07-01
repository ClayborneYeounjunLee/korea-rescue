# ⛑ Korea Rescue

> **Your first day in Korea, sorted.** An independent, ad‑free survival guide for foreign travelers and overseas Koreans (gyopo) — eSIM, transit & payment cards, KTX, taxis, identity‑verification workarounds, food and tickets, all in one flow. No Korean phone number needed to read it.

외국인·교포가 한국에 **도착한 첫날** 겪는 문제(인터넷 개통, 교통·결제카드, KTX, 택시, 본인인증 벽, 맛집·공연 예약)를 **한 페이지·한 흐름**으로 정리한 단일 파일 웹앱입니다. 순수 HTML/CSS/JS 한 파일에 4개 언어(EN/KO/JA/ZH), 데이터 주도 렌더링, 오프라인 우선 설계로 만들어졌습니다.

🔗 **라이브:** https://clayborneyeounjunlee.github.io/korea-rescue/
📄 **KTX 상세 가이드(SEO 랜딩):** https://clayborneyeounjunlee.github.io/korea-rescue/guides/ktx-ticket-foreigner.html

> 💡 이 앱은 개인용 유틸리티가 아니라 외국인 대상 **제품**입니다. 상단 `LINKS` 설정에 모든 외부 링크(어필리에이트 추적ID 교체 지점)를 모아두었고, 선택적으로 Claude 기반 AI 컨시어지(Cloudflare Worker)를 붙일 수 있습니다.

---

## ✨ 주요 기능 (사용자 관점)

- **4개 언어 즉시 전환** — 영어(기본) / 한국어 / 日本語 / 中文. `navigator.language`로 첫 방문 언어 자동 감지, 이후 선택은 기기에 저장.
- **도착 체크리스트** — eSIM, 교통·결제카드, 택시앱, 지도앱, 파파고, 본인인증 이해 등 6항목을 탭으로 체크. 진행률(`n / 6 완료`) 표시, 기기에 저장.
- **8개 실전 모듈** — eSIM / 교통·결제카드 / KTX / 택시 / 본인인증 우회 / 맛집 / 공연·티켓 / 생존 한국어. 각 모듈은 요점 불릿 + 경고(⚠️/⛔) + 바로가기 버튼으로 구성.
- **교통카드 추천 위저드(Picker)** — “주로 서울 vs 전국 여러 도시” × “iPhone vs Android” 두 질문으로 WOWPASS / NAMANE / 기후동행카드 / T‑money 중 최적을 즉시 추천.
- **“무엇이든 물어보세요” 컨시어지** — 질문을 입력하면 관련 섹션과 실전 답변으로 안내. 기본은 서버 없는 **정적 의도 매처(4개 언어)**, 원하면 **Claude 기반 실시간 AI**로 업그레이드(끊기면 자동으로 정적 매처로 폴백).
- **생존 한국어 7문장** — 영어 뜻 · 한글 · 로마자 발음을 나란히. 파파고 바로가기 제공.
- **다크/라이트 테마** — 토글 저장, 최초 진입 시 시스템 설정 감지. FOUC(깜빡임) 방지 스크립트 내장.
- **어필리에이트 투명성** — 광고 링크에는 `AD` 배지, 하단에 독립 가이드 고지(disclaimer).
- **모바일 최적화** — `viewport-fit=cover`, `env(safe-area-inset)`, iOS PWA 메타, 백드롭 블러 앱바.
- **완전 오프라인 우선** — 정적 매처·체크리스트·언어·테마 모두 서버 없이 동작(외부 링크 클릭 시에만 나감).

---

## 🧱 기술 스택 / 언어

| 항목 | 내용 |
|---|---|
| 언어 | **순수 HTML + CSS + Vanilla JavaScript** (프레임워크·번들러·빌드 도구 **없음**) |
| 파일 | 단일 `index.html` 하나(약 625줄)에 마크업·스타일·로직 전부 인라인 |
| JS 모듈 | ES 모듈(import/export) **미사용** — 일반 `<script>` 블록. (예외: `concierge/worker.js`는 Cloudflare용 `export default`) |
| 스타일 | 순수 CSS, CSS 변수(`--bg`, `--accent` 등)로 라이트/다크 테마. `color-mix()`, `backdrop-filter`, `env()` 등 모던 CSS |
| 폰트 | **Pretendard** 우선 → 시스템 폰트 폴백(`-apple-system`, `Apple SD Gothic Neo`, `Segoe UI`, `Noto Sans KR/JP` 등). 웹폰트 CDN 로드는 없음(설치돼 있으면 사용) |
| 아이콘/파비콘 | 인라인 **SVG data‑URI**(⛑ 이모지), 별도 이미지 파일·아이콘 라이브러리 없음 |
| 외부 라이브러리/SDK | **없음** — CDN `<script>`, 분석 태그, jQuery, Firebase SDK 등 전무 |
| 데이터 | JS 객체/배열 리터럴(`MODULES`, `PHRASES`, `LINKS` …)로 코드에 내장 |
| 선택적 백엔드 | `concierge/worker.js` — Cloudflare Worker(서버리스), Anthropic Messages API 프록시 |

> **한 줄 요약:** 빌드가 필요 없는 “파일 하나 = 앱 하나”. `index.html`을 브라우저로 열면 그대로 동작합니다.

---

## 🏗️ 시스템 구조

### 부팅 흐름
1. `<head>`의 인라인 스크립트가 `localStorage['hub-theme']`(또는 시스템 다크 설정)를 읽어 **테마를 즉시 적용**(FOUC 방지).
2. 페이지 하단 `<script>`에서 초기 상태 계산:
   - `lang` — `kr-lang` 저장값 → 없으면 `navigator.language`로 감지(`ko`/`ja`/`zh`/`en`).
   - `checked` — `kr-checklist`(JSON)로 체크리스트 상태 복원.
3. 이벤트 1회 배선(Ask 버튼/엔터, 테마 토글, 언어 버튼) 후 `renderAll()` 호출.

### 렌더 파이프라인 (`renderAll()`)
```
renderAll()
├─ applyStatic()     // [data-i18n] 텍스트·언어 속성·언어 버튼 활성화
├─ applyAsk()        // 컨시어지 제목/힌트/placeholder 세팅
├─ renderNav()       // MODULES → 상단 퀵 내비 칩
├─ renderChecklist() // CHECK → 체크박스 + 진행률, 클릭 시 localStorage 저장
└─ renderMods()      // MODULES → 카드(desc + picker/bul/phrases + note + actions)
```
언어를 바꾸면 상태만 갱신하고 `renderAll()`을 다시 호출 → **전체 UI를 데이터에서 재생성**합니다(별도 라우팅 없이 단일 페이지, 섹션 이동은 `#anchor` 해시).

### 핵심 헬퍼
| 함수 | 역할 |
|---|---|
| `T(o)` | 다국어 객체에서 현재 언어 문자열 반환 (`o[lang] || o.en`) |
| `L(o)` | 모듈/체크 항목의 현재 언어 블록 반환 (`o[lang] || o.en`) |
| `esc(s)` | HTML 이스케이프(XSS 방지) — 모든 동적 문자열에 적용 |
| `$(sel)` | `querySelector` 단축 |

### 상태 관리
- 전역 변수 + `localStorage`만 사용(프레임워크/스토어 없음).
- `lang`(현재 언어), `checked`(체크리스트 맵), `pick`(교통카드 위저드 선택: `{region, phone}`), `CFG.conciergeApi`(AI 사용 여부).
- 라우팅은 순수 앵커(`href="#esim"` 등) — SPA 라우터 없음.

### 컨시어지(Ask) 2단 구조
- **정적 매처**: `INTENTS` 배열의 키워드 점수 매칭(`matchIntent`) → 해당 모듈로 점프 + 4개 언어 답변. 서버·네트워크 불필요.
- **실시간 AI**(선택): `CFG.conciergeApi`에 Worker URL을 넣으면 `askLive()`가 그 URL로 `{question, lang}`을 POST. 실패 시 `catch`에서 **정적 매처로 우아하게 폴백**.

---

## 🗂️ 데이터

모든 콘텐츠는 `index.html` 안의 JS 리터럴로 존재하며, 각 항목은 `{en, ko, ja, zh}` 다국어 객체 형태입니다.

| 상수 | 타입 | 개수 | 용도 |
|---|---|---|---|
| `LINKS` | object | 24개 URL | 모든 외부 링크 중앙 관리(어필리에이트 교체 지점) |
| `UI` | object(4 lang) | — | 히어로/체크리스트/푸터/고지 등 정적 UI 문자열 |
| `CHECK` | array | 6개 | 도착 체크리스트 항목(각 `[제목, 부연]`) |
| `MODULES` | array | **8개** | 메인 가이드 카드 정의 |
| `PHRASES` | array | 7개 | 생존 한국어(뜻·한글·로마자) |
| `PK` | object | — | 교통카드 위저드 질문·추천·근거 문자열 |
| `ASK` | object(4 lang) | — | 컨시어지 UI 문자열 |
| `INTENTS` | array | 8개 | 정적 매처 키워드+답변(모듈별 1개) |

### 8개 모듈 (`MODULES`)

| id | 아이콘 | 내비 라벨 | 다루는 내용 |
|---|---|---|---|
| `esim` | 📶 | eSIM | 도착 즉시 인터넷 개통, 해외카드 결제, 본인인증과 무관함 안내 |
| `money` | 💳 | 카드 | 교통+결제카드, **Picker 위저드** 포함(WOWPASS/NAMANE/기후동행/T‑money) |
| `ktx` | 🚄 | KTX | 여권만으로 Trip.com/Klook/KKday 예매, Korail 자체사이트·Rail Ninja 경고 |
| `taxi` | 🚕 | 택시 | k.ride(외국인 앱)·카카오T, 지도는 카카오/네이버 사용 |
| `verify` | 🔐 | 본인인증 | 본인인증이 막는 이유와 우회법(게스트 결제·국제파트너·현장결제 등) |
| `food` | 🍜 | 맛집 | CatchTable Global 예약, 네이버 리뷰 기준, 채식/할랄 경로 |
| `tickets` | 🎫 | 공연 | NOL World·Melon Global·Klook/Trazy, 한국 티켓사이트의 신분/카드 벽 |
| `phrases` | 💬 | 회화 | 생존 한국어 7문장(파파고 연동) |

### 모듈 스키마 (실제 예시)
```js
{ id:"money", icon:"💳", nav:{en:"Card",ko:"카드",ja:"カード",zh:"卡"},
  en:{ title:"Money & transit card", desc:"...", picker:1,
       bul:[ "WOWPASS — prepaid debit + currency exchange + T-money in one. ...",
             "NAMANE — top up anywhere from the app ..." ],
       warn:[ "Mobile T-money / Apple Wallet T-money usually need a Korean card ..." ] },
  ko:{ /* 동일 구조의 한국어 */ }, ja:{ /* … */ }, zh:{ /* … */ },
  act:[ {en:"WOWPASS", ..., url:LINKS.wowpass},
        {en:"NAMANE",  ..., url:LINKS.namane, ghost:1} ] }
```
- `picker:1` → 교통카드 추천 위저드 삽입, `phrases:1` → 회화표 삽입.
- `warn`(⚠️)·`bad`(⛔) 배열 → 강조 노트로 렌더.
- `act[].aff:1` → 광고 링크에 `AD` 배지, `ghost:1` → 보조(테두리) 버튼 스타일.

### 생존 한국어 예시 (`PHRASES`)
```js
{ en:"Please take me to this address (show screen)", ko:"여기로 가주세요", ro:"yeogiro ga-juseyo" }
{ en:"No meat, please", ko:"고기 빼주세요", ro:"gogi ppae-juseyo" }
```

---

## 💾 저장소 / DB

**데이터베이스·Firebase·서버 세션 없음.** 모든 사용자 상태는 브라우저 `localStorage`에만 저장되며, 원격으로 전송되지 않습니다. (Firebase 설정 파일·SDK 부재를 코드로 확인)

### localStorage 키

| 키 | 용도 | 값 형태 |
|---|---|---|
| `kr-lang` | 선택한 언어 유지 | `"en"` / `"ko"` / `"ja"` / `"zh"` |
| `kr-checklist` | 도착 체크리스트 체크 상태 | JSON 맵 `{"0":true,"2":true,...}` |
| `hub-theme` | 라이트/다크 테마 | `"light"` / `"dark"` |

> `hub-theme` 키는 **moa 컬렉션 공통** 테마 키라서 형제 앱들과 다크모드 설정을 공유합니다.

### 오프라인 / 게스트 폴백
- 별도 로그인·계정 없음 — 모든 기능이 익명·오프라인 우선.
- `localStorage` 접근은 전부 `try/catch`로 감싸 프라이빗 모드·차단 환경에서도 앱이 죽지 않음(값만 저장 안 될 뿐).
- 컨시어지도 서버 없이 정적 매처로 완전 동작. AI Worker가 꺼져 있어도 자동 폴백.

---

## 🌐 외부 API · 의존성

### 런타임 외부 호출
- **없음(기본 상태)** — 정적 사이트 자체는 어떤 외부 API도 호출하지 않습니다. 사용자가 링크를 클릭할 때만 외부 서비스로 이동.
- `LINKS`에 모인 외부 서비스(모두 사용자가 클릭 시 새 탭으로 이동):

| 카테고리 | 서비스 |
|---|---|
| eSIM | Klook eSIM, Airalo |
| 카드 | WOWPASS, NAMANE, 기후동행카드(서울시), T‑money |
| KTX | Trip.com, Klook, KKday |
| 택시·지도 | k.ride, Kakao T, Kakao Map, Naver Map |
| 맛집 | CatchTable Global, HappyCow, Blue Ribbon |
| 티켓 | NOL World, Melon Global, Klook K‑pop, Trazy, VisitKorea, Visit Seoul |
| 번역 | Papago |

### 선택적 AI 컨시어지 (Anthropic)
- `CFG.conciergeApi`에 Cloudflare Worker URL을 넣으면 활성화.
- Worker(`concierge/worker.js`)가 **서버 사이드**에서 Anthropic **Messages API**(`https://api.anthropic.com/v1/messages`) 호출.
  - 모델: `claude-opus-4-8`, `max_tokens: 1024`, `output_config.effort: "low"`(간결·저비용). 비용 절감 시 `claude-haiku-4-5`로 교체 가능(주석 안내).
  - 시스템 프롬프트에 한국여행 핵심 사실(본인인증·eSIM·카드·KTX·택시·맛집·티켓)을 주입, 사용자 언어로 4문장 이내 답변.
- **키 위치:** Anthropic API 키는 **브라우저에 절대 노출하지 않고** Cloudflare Worker **시크릿**(`wrangler secret put ANTHROPIC_API_KEY`)으로만 보관. 코드·리포에 키 리터럴 없음. 이 프록시 구조 덕분에 정적 사이트에서도 키 없이 AI를 붙일 수 있음.

---

## ▶️ 로컬 실행 방법

빌드·설치 불필요. `index.html`을 브라우저로 바로 열면 됩니다. `localStorage`·상대 링크(`guides/`)가 정상 동작하도록 **정적 서버**로 여는 것을 권장합니다.

```bash
# 방법 1) Python
python -m http.server 8080
#  → http://localhost:8080

# 방법 2) Node (npx, 설치 불필요)
npx serve .

# 방법 3) VS Code
#  Live Server 확장으로 index.html 열기
```

> `package.json`·npm 스크립트는 **없습니다**(빌드 스텝이 없기 때문). AI 컨시어지를 개발/배포할 때만 `wrangler`가 필요합니다.

### AI 컨시어지 배포(선택, ≈5분·무료 티어)
```bash
npm i -g wrangler
wrangler login
# concierge/ 폴더에 wrangler.toml 작성 후:
wrangler secret put ANTHROPIC_API_KEY   # 키를 시크릿으로 저장
wrangler deploy                         # 출력된 URL을 index.html CFG.conciergeApi에 붙여넣기
```
자세한 절차·CORS·비용 튜닝은 [`concierge/README.md`](concierge/README.md) 참고.

---

## 🚀 배포 (GitHub Pages)

정적 사이트라 **GitHub Pages**에 그대로 올립니다.

1. 리포 → **Settings → Pages**.
2. **Source: Deploy from a branch**, 브랜치 `main`, 폴더 `/ (root)` 선택 후 저장.
3. 몇 분 뒤 `https://<user>.github.io/korea-rescue/` 로 공개 → 현재 라이브: **https://clayborneyeounjunlee.github.io/korea-rescue/**

- SEO 랜딩(`guides/ktx-ticket-foreigner.html`)은 자체 `<canonical>`·OpenGraph·**FAQPage JSON‑LD** 구조화 데이터를 포함해 검색 유입을 노립니다.
- `BUSINESS_PLAN*.md`는 `.gitignore`로 **공개 리포에서 제외**(로컬 보관).
- AI 컨시어지는 GitHub Pages가 아닌 **Cloudflare Workers**에 별도 배포(정적 프런트 + 서버리스 프록시 분리).

---

## 📁 파일 구조

```
korea-rescue/
├─ index.html                         # 앱 전체(마크업+CSS+JS+4개언어 데이터). 단일 파일
├─ .gitignore                         # BUSINESS_PLAN*.md 제외(비공개 유지)
├─ BUSINESS_PLAN.md                   # 사업계획서(한국어) — gitignore, 비공개
├─ BUSINESS_PLAN.en.md                # 사업계획서(영어) — gitignore, 비공개
├─ concierge/                         # (선택) AI 컨시어지 백엔드
│  ├─ worker.js                       # Cloudflare Worker: Anthropic Messages API 프록시(키는 시크릿)
│  └─ README.md                       # 배포·CORS·비용 가이드
└─ guides/
   └─ ktx-ticket-foreigner.html       # 독립 SEO 랜딩(FAQ JSON-LD 포함) — "외국인 KTX 예매법"
```

> 참고: 현재 Git에는 `index.html`·`.gitignore`만 커밋돼 있고 `concierge/`·`guides/`는 아직 추적 전(untracked)입니다 — 위 구조는 디스크상의 실제 파일 기준입니다.

---

## 🔗 관련 앱 (moa 컬렉션)

Korea Rescue는 제작자의 **moa** 단일 파일 앱 컬렉션의 일부입니다. 상단 앱바의 `◈` 버튼과 하단 푸터에서 허브로 이동합니다.

- **moa 허브:** https://clayborneyeounjunlee.github.io/moa/
- 컬렉션 공통 패턴 공유: `hub-theme` 다크모드 키, 인라인 SVG 파비콘, 데이터 주도 렌더, 빌드리스 단일 파일 배포.

---

## 🔒 보안 / 프라이버시 메모

- **개인정보 수집 없음** — 계정·서버 전송 없이 모든 상태는 기기 `localStorage`에만 저장.
- **비밀키 없음** — 리포 어디에도 API 키 리터럴이 없습니다. AI 컨시어지 키는 Cloudflare Worker **시크릿**(환경변수)으로만 관리하며, 브라우저에 노출되지 않습니다.
- **어필리에이트 투명성** — 일부 링크는 어필리에이트일 수 있고(추가 비용 없음) 앱 내 고지·`AD` 배지로 명시. 소개된 서비스와 제휴/후원 관계 없음(독립 가이드).
