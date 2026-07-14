# 히든피스: 우리 반 보물찾기 — 실행 방법 안내

본 소프트웨어는 웹 애플리케이션으로 **Next.js(프론트엔드) · FastAPI(백엔드) · Firestore(DB)** 서버 환경에서 운영됩니다.

## 1. 심사 시 권장 실행 방법 (배포 서비스 이용)

별도 설치 없이 웹브라우저로 바로 실행할 수 있습니다.

- 서비스 주소: **https://www.inedu.site/**
- 최신 Chrome / Edge / Safari 권장, 권장 해상도 1920×1080
- 심사용 계정
  - 교사 계정: `{{심사용_교사ID}}` / `{{심사용_PW}}`
  - 학생 인증번호(6자리): `{{심사용_인증코드}}`
  - 저학년(새싹) 모드는 로그인 없이 바로 체험 가능

USB의 `program/index.html`을 열면 위 내용이 안내된 실행 런처가 표시됩니다.

## 2. 로컬(개발 환경) 실행 방법

> 백엔드는 Firestore·Gemini 등 외부 서비스 자격증명(키)이 필요합니다.
> 보안상 키 값은 본 제출물에 포함되어 있지 않으므로, **심사 시에는 위 배포 서비스 이용을 권장**하며
> 로컬 구동이 필요한 경우 별도의 키 발급이 필요합니다.

### 요구 환경

- Node.js **20 이상**
- Python **3.10 이상**

### 2-1. 프론트엔드 (frontend/)

```bash
cd frontend
npm install
```

`frontend/.env.local` 파일을 만들고 백엔드 주소를 설정합니다.

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

(설정하지 않으면 기본값으로 `http://localhost:8000`을 사용합니다.)

개발 서버 실행:

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속.

### 2-2. 백엔드 (backend/)

```bash
cd backend
pip install -r requirements.txt
```

`backend/.env` 파일(또는 시스템 환경변수)에 아래 값을 설정합니다. **값은 별도 발급이 필요합니다.**

| 환경변수 | 용도 |
|---|---|
| `FIREBASE_CREDENTIALS` | Firebase 서비스 계정 키(JSON 문자열) — Firestore DB 연결 |
| `GEMINI_API_KEY` | Google Gemini API 키 — AI 대화·피드백 기능 |
| `ADMIN_USER` / `ADMIN_PASS` | 관리자 페이지 접속 계정(임의 지정) |
| `SMTP_USER` / `SMTP_PASSWORD` | (선택) 계정 찾기 메일 발송용 SMTP 계정 |

백엔드 서버 실행 (둘 중 하나):

```bash
uvicorn main:app --reload --port 8000
# 또는
python run.py
```

## 3. 폴더 구성

- `frontend/` — Next.js 16 (App Router) 프론트엔드 소스
- `backend/` — FastAPI 백엔드 소스 (`app/routers/` API, `app/services/` Firestore 연동)

## 4. 멀티미디어 자료 출처

이미지·배경음악: 생성형 AI로 직접 제작 | 음성: Typecast AI 보이스(라이선스 확보) | 폰트: 나눔고딕(OFL)
