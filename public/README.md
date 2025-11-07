# PWA 아이콘 파일

이 디렉토리에는 PWA(Progressive Web App)에 필요한 아이콘 파일들이 위치합니다.

## 필요한 파일 목록

다음 파일들을 생성하여 이 디렉토리에 추가해야 합니다:

### 필수 아이콘
- `pwa-192x192.png` - 192x192 픽셀 PWA 아이콘
- `pwa-512x512.png` - 512x512 픽셀 PWA 아이콘 (maskable 포함)

### 선택적 아이콘
- `apple-touch-icon.png` - 180x180 픽셀 (iOS 홈 화면 아이콘)
- `favicon.ico` - 16x16, 32x32 픽셀 포함
- `favicon-16x16.png` - 16x16 픽셀
- `favicon-32x32.png` - 32x32 픽셀
- `mask-icon.svg` - Safari 마스크 아이콘 (선택사항)

## 아이콘 디자인 가이드라인

- **주 색상**: #667eea (primary 색상)
- **배경**: 투명 또는 단색 배경
- **스타일**: 간단하고 명확한 디자인
- **텍스트**: "우리회계" 또는 "W" 로고

## 생성 방법

1. 디자인 도구(Figura, Sketch, Adobe XD 등)로 아이콘 디자인
2. 각 크기별로 PNG 파일 생성
3. 이 디렉토리에 파일 추가
4. `npm run build` 실행하여 PWA 빌드 확인

## 온라인 아이콘 생성기

- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

