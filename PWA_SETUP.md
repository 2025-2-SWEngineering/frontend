# PWA (Progressive Web App) 설정 가이드

## 개요

우리회계 프론트엔드는 PWA로 구성되어 있어 모바일 및 데스크톱에서 네이티브 앱처럼 설치하고 사용할 수
있습니다.

## 주요 기능

### ✅ 구현된 기능

1. **Service Worker**
   - 자동 업데이트 (`registerType: "autoUpdate"`)
   - 오프라인 지원을 위한 캐싱
   - API 응답 캐싱 (NetworkFirst 전략)

2. **Web App Manifest**
   - 앱 이름, 아이콘, 테마 색상 설정
   - Standalone 모드 (네이티브 앱처럼 표시)
   - Portrait 방향 고정

3. **설치 프롬프트**
   - 사용자에게 앱 설치 안내
   - 설치 거부 시 24시간 동안 재표시 안 함

4. **오프라인 지원**
   - 정적 자산 캐싱 (JS, CSS, HTML, 이미지)
   - API 응답 캐싱 (24시간)

## 설정 파일

### vite.config.ts

- `VitePWA` 플러그인 설정
- Manifest 설정
- Workbox 설정 (Service Worker)

### index.html

- Manifest 링크
- Apple Touch Icon 설정
- Theme Color 메타 태그

## 필요한 아이콘 파일

`public/` 디렉토리에 다음 아이콘 파일들을 추가해야 합니다:

### 필수

- `pwa-192x192.png` (192x192 픽셀)
- `pwa-512x512.png` (512x512 픽셀)

### 선택사항

- `apple-touch-icon.png` (180x180 픽셀)
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`

자세한 내용은 `public/README.md`를 참고하세요.

## 개발 환경

### 개발 모드에서 PWA 테스트

기본적으로 개발 모드에서는 PWA가 비활성화되어 있습니다. 테스트하려면:

1. `vite.config.ts`에서 `devOptions.enabled`를 `true`로 변경
2. 개발 서버 재시작
3. 브라우저 개발자 도구에서 Application > Service Workers 확인

### 빌드 및 배포

```bash
npm run build
npm run preview
```

빌드 후 `dist/` 디렉토리에 다음 파일들이 생성됩니다:

- `manifest.webmanifest`
- `sw.js` (Service Worker)
- `workbox-*.js` (Workbox 라이브러리)

## 배포 요구사항

### HTTPS 필수

PWA는 HTTPS 환경에서만 작동합니다 (localhost 제외).

### 서버 설정

- `manifest.webmanifest` 파일을 `application/manifest+json` MIME 타입으로 제공
- Service Worker 파일을 올바른 경로에서 제공

## 브라우저 지원

### 완전 지원

- Chrome/Edge (Android, Desktop)
- Safari (iOS 11.3+, macOS)
- Firefox (Android, Desktop)
- Samsung Internet

### 제한적 지원

- iOS Safari: 일부 기능 제한 (Service Worker는 지원)

## 설치 방법

### 모바일 (Android)

1. Chrome에서 앱 열기
2. 주소창 옆 메뉴(⋮) 클릭
3. "홈 화면에 추가" 선택

### 모바일 (iOS)

1. Safari에서 앱 열기
2. 공유 버튼(□↑) 클릭
3. "홈 화면에 추가" 선택

### 데스크톱 (Chrome/Edge)

1. 주소창 오른쪽의 설치 아이콘 클릭
2. "설치" 버튼 클릭

## 문제 해결

### Service Worker가 등록되지 않음

- HTTPS 환경인지 확인
- 브라우저 개발자 도구에서 Console 확인
- `vite.config.ts`의 `devOptions.enabled` 확인

### 아이콘이 표시되지 않음

- `public/` 디렉토리에 아이콘 파일이 있는지 확인
- 파일 이름이 정확한지 확인
- 빌드 후 `dist/` 디렉토리 확인

### 업데이트가 적용되지 않음

- 브라우저 캐시 삭제
- Service Worker 수동 업데이트 (개발자 도구 > Application > Service Workers)

## 참고 자료

- [Vite PWA Plugin 문서](https://vite-pwa-org.netlify.app/)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox 문서](https://developers.google.com/web/tools/workbox)
