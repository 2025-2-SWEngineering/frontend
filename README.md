# 우리회계 프론트엔드

소규모 조직 회계 관리 서비스의 React 웹 애플리케이션입니다. Android WebView로 패키징 가능하도록 구성되어 있습니다.

## 기술 스택

- React 18, TypeScript
- Vite, Styled-components 6, React Router 6, Axios 1

## 실행 방법

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행(Vite)

```bash
npm run dev
```

앱: http://localhost:3000

백엔드 API 프록시: `/api` → `http://localhost:3001` (vite.config.ts에 설정)

3. 프로덕션 빌드/미리보기

```bash
npm run build
npm run preview
```

## 환경 변수

- 기본적으로 Axios는 `/api`를 베이스로 요청합니다.
- 배포 환경에서 백엔드 주소를 고정하려면 `VITE_API_URL`을 설정하세요.

예)

```bash
VITE_API_URL=https://api.example.com
```

## 라우팅 개요

- `/` 로그인
- `/register` 회원가입
- `/dashboard` 대시보드(프라이빗 라우트, 토큰 없으면 `/`로 리다이렉트)

## API 사용 방식

- Axios 인스턴스(`src/services/api.ts`)가 JWT를 `Authorization: Bearer <token>`로 자동 첨부합니다.
- 401 응답 시 토큰을 제거하고 `/`로 리다이렉트합니다.

## 주요 기능(요약)

- 그룹 선택 및 초대코드 생성/참여
- 거래 등록/목록/통계/월별 추이, 영수증 업로드(Presigned URL)
- 회비 상태 확인/관리, 사용자 알림 수신 설정
- 기간별 요약 리포트(PDF/Excel) 다운로드

## 개발 편의

- Vite 프록시 설정(`frontend/vite.config.ts`):

```ts
// 발췌
server: {
    port: 3000,
    proxy: {
        "/api": { target: "http://localhost:3001", changeOrigin: true },
    },
},
```

## 트러블슈팅

- API 호출 실패 시: 백엔드(3001) 가동 여부, 프록시 설정, `VITE_API_URL` 확인
- 401 반복: 로컬스토리지 토큰 삭제 후 재로그인

## 라이선스/팀

MIT / 개발만하고싶어 팀 (강재민, 안재관, 김훈민, Ntwali Herve, 전성민)
