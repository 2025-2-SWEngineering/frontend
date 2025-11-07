# 모바일 UI 분석 및 구상 방안

## 현재 상태 분석

### 1. 기술 스택

- **스타일링**: styled-components 6.1.19
- **차트**: recharts (ResponsiveContainer 사용 중)
- **레이아웃**: Grid, Flexbox 사용
- **반응형**: 현재 미구현 상태

### 2. 주요 컴포넌트별 현황

#### ✅ 모바일 친화적 요소

- `ResponsiveContainer` (recharts) - 차트는 자동 반응형
- `ModalCard` - `width: min(450px, 96vw)` 사용으로 모바일 대응
- `LoginBox`, `RegisterPage` - `max-width: 400px` 사용

#### ❌ 모바일 대응 필요 요소

1. **DashboardPage**
   - 탭 버튼: 고정 크기, 모바일에서 가로 스크롤 필요할 수 있음
   - 헤더 + 로그아웃 버튼: 가로 배치가 모바일에서 좁을 수 있음

2. **TransactionForm**
   - 복잡한 Grid 레이아웃 (4열, 3열)
   - 모바일에서 필드들이 겹치거나 작아질 수 있음
   - 버튼 크기가 작을 수 있음

3. **StatsCards**
   - `gridTemplateColumns: repeat(auto-fit, minmax(250px, 1fr))`
   - 모바일에서 카드가 작아질 수 있음

4. **CategoryChart**
   - 2열 그리드 (`gridTemplateColumns: "1fr 1fr"`)
   - 모바일에서 세로 스택 필요

5. **TransactionsList**
   - 가로 배치된 많은 정보 (금액, 카테고리, 설명, 날짜, 버튼들)
   - 모바일에서 정보가 압축되거나 가로 스크롤 필요

6. **GroupMembers**
   - 테이블 레이아웃
   - 모바일에서 테이블이 좁아질 수 있음

7. **Container**
   - `max-width: 1200px`, `padding: 40px 20px`
   - 모바일에서 패딩 조정 필요

## 모바일 UI 구상 방안

### 1. 반응형 Breakpoint 시스템

```typescript
// 권장 breakpoint
const breakpoints = {
  mobile: "480px", // 작은 모바일
  tablet: "768px", // 태블릿
  desktop: "1024px", // 데스크톱
  wide: "1440px", // 와이드 스크린
};
```

### 2. 모바일 우선 접근법 (Mobile-First)

- 기본 스타일을 모바일에 맞춤
- 미디어 쿼리로 큰 화면에 기능 추가
- 터치 친화적인 최소 크기: 44x44px (버튼, 입력 필드)

### 3. 주요 컴포넌트별 개선 방안

#### DashboardPage

- 모바일: 헤더와 로그아웃 버튼을 세로 배치
- 탭: 모바일에서 전체 너비 사용, 폰트 크기 조정

#### TransactionForm

- 모바일: 모든 필드를 세로 스택 (1열)
- 태블릿: 2열 그리드
- 데스크톱: 현재 4열/3열 유지
- 버튼: 모바일에서 전체 너비 또는 더 큰 크기

#### StatsCards

- 모바일: 1열 (세로 스택)
- 태블릿: 2열
- 데스크톱: 3열

#### CategoryChart

- 모바일: 1열 (차트를 세로로 배치)
- 태블릿 이상: 2열 유지

#### TransactionsList

- 모바일: 카드 형태로 변경 (세로 배치)
  - 금액을 상단에 크게 표시
  - 카테고리, 설명, 날짜를 세로로 배치
  - 버튼들을 하단에 배치
- 데스크톱: 현재 가로 배치 유지

#### GroupMembers

- 모바일: 테이블을 카드 리스트로 변경
- 데스크톱: 테이블 유지

#### Container

- 모바일: `padding: 16px`
- 태블릿: `padding: 24px`
- 데스크톱: `padding: 40px 20px`

### 4. 터치 친화적 개선

- 버튼 최소 크기: 44x44px
- 입력 필드 높이: 최소 44px
- 터치 영역 간격: 최소 8px
- 스크롤 가능한 영역 명확히 표시

### 5. 네비게이션 개선

- 모바일에서 탭을 더 명확하게 표시
- 하단 네비게이션 바 고려 (선택사항)
- 햄버거 메뉴는 현재 구조상 불필요 (탭 구조가 단순함)

### 6. 폰트 크기 조정

- 모바일: 기본 폰트 크기 약간 축소
- 제목 크기: 모바일에서 24-28px, 데스크톱 32px
- 본문: 모바일 14px, 데스크톱 16px

### 7. 성능 최적화

- 이미지 최적화 (영수증 이미지)
- 레이지 로딩 고려
- 모바일에서 불필요한 애니메이션 축소

## 구현 우선순위

### Phase 1: 핵심 반응형 (필수)

1. ✅ Breakpoint 시스템 구축
2. ✅ Container 패딩 조정
3. ✅ TransactionForm 모바일 대응
4. ✅ StatsCards 모바일 대응
5. ✅ CategoryChart 모바일 대응

### Phase 2: 레이아웃 개선 (중요)

6. ✅ TransactionsList 모바일 카드 형태
7. ✅ DashboardPage 헤더/탭 모바일 대응
8. ✅ GroupMembers 모바일 대응

### Phase 3: 세부 조정 (선택)

9. 폰트 크기 미세 조정
10. 터치 영역 최적화
11. 애니메이션/트랜지션 조정
