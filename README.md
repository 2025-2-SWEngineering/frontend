# 우리회계 프론트엔드 (Korean)

## 기술 스택

- React 18, TypeScript, Vite
- Styled-components 6, React Router 6, Axios 1

## 주요 특징

- 공통 API DTO(`src/types/api.ts`)와 API 클라이언트(`src/api/client.ts`)로 타입 일원화
- Axios 인터셉터: 401 시 자동 리프레시(`/api/auth/refresh`) 후 원 요청 재시도
- 업로드 전략: 백엔드 `/uploads/mode`로 S3/로컬 자동 판별, 실패 시 폴백 처리
- 페이지 모듈화: `DashboardPage` 구성요소 분리(거래/회비/리포트/초대 등)

## 실행 방법

1. 설치 & 개발 서버

```bash
npm install
npm run dev
```

앱: http://localhost:3000

2. 빌드/미리보기

```bash
npm run build
npm run preview
```

## 환경 변수

- 개발은 기본 `/api` 프록시를 사용합니다.
- 배포에서 백엔드 주소를 고정하려면 `VITE_API_URL`을 사용하세요.

## 라우팅

- `/` 로그인
- `/register` 회원가입
- `/groups` 그룹 선택/생성/초대코드 참여
- `/dashboard` 대시보드(토큰 필요)

## 인증 흐름

- 로그인/회원가입 응답: `{ token, refreshToken, user }` 저장
- 요청 시 `Authorization: Bearer <token>` 자동 첨부
- 401 발생 시 `refreshToken`으로 재발급 → 성공 시 원 요청 재시도, 실패 시 로그아웃

## 업로드 흐름

- 모드 조회: `GET /api/uploads/mode` → `s3`/`local`
- `s3`면 Presigned PUT 후 키 저장, 실패(CORS 등) 시 로컬 업로드로 폴백
- `local`이면 `POST /api/uploads/direct`로 업로드

## 폴더 개요

- `src/api/client.ts`: 그룹/거래/회비/리포트/업로드 등 API 래퍼
- `src/types/api.ts`: 공통 DTO 모음
- `src/services/api.ts`: Axios 인스턴스 + 인터셉터(자동 재발급)
- `src/pages/*`, `src/components/*`: UI 구성요소

## 트러블슈팅

- 401 반복: `localStorage`의 `token`/`refreshToken` 삭제 후 재로그인
- 업로드 403: S3 CORS 정책 확인, 백엔드 `AWS_REGION`/버킷 확인
- API 실패: `VITE_API_URL` 또는 Vite 프록시 타깃 확인

# Woori Accounting Frontend (English)

React + TypeScript web app for small organizations.

## Highlights

- Shared API DTOs (`src/types/api.ts`) and client (`src/api/client.ts`)
- Axios interceptor with auto refresh (`/api/auth/refresh`) and retry
- Upload strategy: detect S3/local via `/uploads/mode`, fallback on failures
- Modular dashboard components (transactions, dues, reports, invites)

## Run

```bash
npm install
npm run dev
# build
npm run build && npm run preview
```

## Env

- Use `VITE_API_URL` in deployments to bypass proxy.

## Routes

- `/` login, `/register`, `/groups`, `/dashboard`

## Auth

- Store `{ token, refreshToken }` and `user` after auth.
- Interceptor refreshes on 401; logout clears both tokens.

## Uploads

- `GET /api/uploads/mode` → `s3` or `local`; then presign/direct accordingly.
