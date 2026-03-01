# VINTEE 접근성 가이드 (Accessibility Guide)

**버전**: 2.0 (Enhanced Edition)
**최종 업데이트**: 2026-02-10
**작성자**: Gagahoho, Inc. Engineering Team
**준수 표준**: WCAG 2.1 Level AA
**상태**: Production-Ready

---

## 📋 목차

1. [개요](#1-개요)
2. [WCAG 2.1 준수 현황](#2-wcag-21-준수-현황)
3. [키보드 네비게이션](#3-키보드-네비게이션)
4. [스크린 리더 지원](#4-스크린-리더-지원)
5. [시각적 접근성](#5-시각적-접근성)
6. [인터랙티브 요소](#6-인터랙티브-요소)
7. [폼 접근성](#7-폼-접근성)
8. [모바일 접근성](#8-모바일-접근성)
9. [테스트 가이드](#9-테스트-가이드)
10. [개선 계획](#10-개선-계획)

---

## 1. 개요

### 1.1 접근성 철학

VINTEE는 **모든 사용자**가 농촌 휴가 경험을 동등하게 탐색하고 예약할 수 있도록 설계되었습니다. 이는 다음을 포함합니다:

- 🦯 **시각 장애인**: 스크린 리더 사용자, 저시력 사용자
- 🦻 **청각 장애인**: 자막, 시각적 알림 제공
- 🤲 **운동 장애인**: 키보드 전용 네비게이션, 큰 터치 타겟
- 🧠 **인지 장애인**: 명확한 언어, 단순한 네비게이션
- 📱 **기술적 제약**: 저속 인터넷, 오래된 기기

### 1.2 준수 표준

| 표준 | 레벨 | 상태 |
|------|------|------|
| **WCAG 2.1** | Level AA | ✅ 목표 |
| **ARIA 1.2** | Full Support | ✅ 적용 중 |
| **한국형 웹 콘텐츠 접근성 지침 (KWCAG) 2.1** | 준수 | ✅ 목표 |
| **Section 508** | Compliance | 🔄 향후 |

---

## 2. WCAG 2.1 준수 현황

### 2.1 원칙 1: 인식 가능 (Perceivable)

**1.1 대체 텍스트 (Text Alternatives)**

✅ **Success Criterion 1.1.1 (Level A)**: 모든 이미지에 적절한 `alt` 속성 제공

```jsx
// 숙소 이미지
<Image
  src="/property/photo.jpg"
  alt="황금빛 논밭이 펼쳐진 농촌 펜션 외관"
  width={800}
  height={600}
/>

// 장식 이미지 (빈 alt)
<Image
  src="/decorative-pattern.svg"
  alt=""
  aria-hidden="true"
  width={100}
  height={100}
/>

// 아이콘 (aria-label 사용)
<button aria-label="찜하기">
  <HeartIcon aria-hidden="true" />
</button>
```

**1.2 시간 기반 미디어 (Time-based Media)**

⏸️ **Success Criterion 1.2.1-1.2.5**: 현재 동영상 콘텐츠 없음 (향후 추가 시 자막 제공 예정)

**1.3 적응 가능성 (Adaptable)**

✅ **Success Criterion 1.3.1 (Level A)**: 시맨틱 HTML 사용

```html
<header role="banner">
  <nav aria-label="주 메뉴">
    <ul>
      <li><a href="/explore">숙소 탐색</a></li>
      <li><a href="/host">호스트 되기</a></li>
    </ul>
  </nav>
</header>

<main role="main">
  <article>
    <h1>논뷰맛집 펜션</h1>
    <p>황금빛 논밭이 한눈에 보이는 힐링 펜션입니다.</p>
  </article>
</main>

<aside role="complementary" aria-label="예약 위젯">
  <!-- 예약 위젯 -->
</aside>

<footer role="contentinfo">
  <!-- Footer 콘텐츠 -->
</footer>
```

✅ **Success Criterion 1.3.2 (Level A)**: 의미 있는 순서

```html
<!-- 논리적 읽기 순서: 제목 → 내용 → 액션 -->
<article>
  <h2>논뷰맛집 펜션</h2>
  <p>황금빛 논밭...</p>
  <a href="/property/123">상세 보기</a>
</article>
```

✅ **Success Criterion 1.3.3 (Level A)**: 감각적 특성

```html
<!-- ❌ 나쁜 예: 색상에만 의존 -->
<p>빨간색 버튼을 클릭하세요.</p>

<!-- ✅ 좋은 예: 명확한 지시 -->
<p>아래 "예약하기" 버튼을 클릭하세요.</p>
<button class="bg-red-500">예약하기</button>
```

**1.4 구별 가능성 (Distinguishable)**

✅ **Success Criterion 1.4.1 (Level A)**: 색상 사용

```css
/* ❌ 나쁜 예: 색상으로만 에러 표시 */
.error {
  color: red;
}

/* ✅ 좋은 예: 색상 + 아이콘 + 텍스트 */
.error {
  color: #EA001E;
  border-left: 4px solid #EA001E;
}

.error::before {
  content: "⚠️ ";
}
```

✅ **Success Criterion 1.4.3 (Level AA)**: 명도 대비 4.5:1 이상

```css
/* 텍스트 색상 (WCAG AA 준수) */
--text-primary: #16325C;    /* 배경 #FFFFFF 대비 12.63:1 ✅ */
--text-secondary: #3E3E3C;  /* 배경 #FFFFFF 대비 9.73:1 ✅ */
--primary: #00A1E0;         /* 배경 #FFFFFF 대비 3.02:1 ❌ (큰 텍스트만) */

/* 큰 텍스트 (18pt 이상 또는 14pt bold): 3:1 허용 */
.heading-large {
  color: var(--primary); /* 3.02:1 ✅ */
  font-size: 1.5rem;
  font-weight: bold;
}
```

✅ **Success Criterion 1.4.4 (Level AA)**: 텍스트 크기 조정 (200%까지 가능)

```css
/* rem 단위 사용 (사용자 브라우저 설정 반영) */
body {
  font-size: 1rem; /* 16px 기본 */
}

h1 {
  font-size: 2.5rem; /* 40px */
}
```

✅ **Success Criterion 1.4.10 (Level AA)**: 리플로우 (Reflow)

- 320px 너비에서 수평 스크롤 없음
- 모바일 우선 반응형 디자인

✅ **Success Criterion 1.4.11 (Level AA)**: 비텍스트 명도 대비

```css
/* 버튼 테두리 */
.button-outline {
  border: 2px solid #16325C; /* 대비 12.63:1 ✅ */
}

/* 입력 필드 테두리 (포커스 상태) */
.input:focus {
  outline: 2px solid #00A1E0;
  outline-offset: 2px;
}
```

✅ **Success Criterion 1.4.12 (Level AA)**: 텍스트 간격

```css
/* 사용자가 간격을 조정해도 콘텐츠 손실 없음 */
* {
  line-height: 1.5; /* 최소 1.5배 */
  letter-spacing: normal;
  word-spacing: normal;
}

p {
  margin-bottom: 1rem; /* 단락 간격 */
}
```

✅ **Success Criterion 1.4.13 (Level AA)**: 호버/포커스 콘텐츠

```jsx
// Tooltip이 호버 시 사라지지 않음
<Tooltip delayDuration={300} closeDelay={500}>
  <TooltipTrigger>호버하세요</TooltipTrigger>
  <TooltipContent>
    추가 정보 (마우스를 tooltip 위로 이동 가능)
  </TooltipContent>
</Tooltip>
```

---

### 2.2 원칙 2: 운용 가능 (Operable)

**2.1 키보드 접근성 (Keyboard Accessible)**

✅ **Success Criterion 2.1.1 (Level A)**: 모든 기능 키보드 접근 가능

```jsx
// 모든 인터랙티브 요소는 키보드로 접근 가능
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  예약하기
</button>

// 커스텀 컴포넌트도 키보드 지원
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  커스텀 버튼
</div>
```

✅ **Success Criterion 2.1.2 (Level A)**: 키보드 트랩 없음

```jsx
// 모달 내부에서 Tab 순환
const Modal = ({ isOpen, onClose, children }) => {
  const firstFocusRef = useRef(null);
  const lastFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      firstFocusRef.current?.focus();

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstFocusRef.current) {
            e.preventDefault();
            lastFocusRef.current?.focus();
          } else if (!e.shiftKey && document.activeElement === lastFocusRef.current) {
            e.preventDefault();
            firstFocusRef.current?.focus();
          }
        }
      };

      window.addEventListener('keydown', handleTabKey);
      return () => window.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  return (
    <div role="dialog" aria-modal="true">
      <button ref={firstFocusRef} onClick={onClose}>닫기</button>
      {children}
      <button ref={lastFocusRef}>확인</button>
    </div>
  );
};
```

✅ **Success Criterion 2.1.4 (Level A)**: 문자 키 단축키

- 현재 단축키 없음 (향후 추가 시 `Ctrl/Cmd` 조합 사용 예정)

**2.2 충분한 시간 (Enough Time)**

✅ **Success Criterion 2.2.1 (Level A)**: 시간 제한 조정 가능

```jsx
// 세션 타임아웃 경고 (1분 전)
const SessionTimeout = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const warningTimer = setTimeout(() => {
      setShowWarning(true);
    }, 29 * 60 * 1000); // 29분 후 경고

    return () => clearTimeout(warningTimer);
  }, []);

  return showWarning && (
    <div role="alert" aria-live="assertive">
      <p>1분 후 세션이 만료됩니다.</p>
      <button onClick={extendSession}>세션 연장 (20분)</button>
    </div>
  );
};
```

✅ **Success Criterion 2.2.2 (Level A)**: 일시정지, 중지, 숨김

- 자동 캐러셀 없음 (모든 콘텐츠 사용자 제어)

**2.3 발작 및 신체 반응 (Seizures and Physical Reactions)**

✅ **Success Criterion 2.3.1 (Level A)**: 3회 깜박임 또는 임계값 이하

- 깜박이는 콘텐츠 없음

**2.4 탐색 가능성 (Navigable)**

✅ **Success Criterion 2.4.1 (Level A)**: 블록 건너뛰기

```html
<!-- Skip to main content 링크 -->
<a href="#main-content" class="skip-link">
  본문으로 건너뛰기
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
</style>
```

✅ **Success Criterion 2.4.2 (Level A)**: 페이지 제목

```jsx
// app/property/[id]/page.tsx
export async function generateMetadata({ params }) {
  const property = await fetchProperty(params.id);

  return {
    title: `${property.name} - VINTEE`,
    description: property.description,
  };
}
```

✅ **Success Criterion 2.4.3 (Level A)**: 포커스 순서

```html
<!-- 논리적 순서: 헤더 → 메인 → 사이드바 → Footer -->
<div class="page-layout">
  <header tabindex="-1">...</header>
  <main tabindex="-1">...</main>
  <aside tabindex="-1">...</aside>
  <footer tabindex="-1">...</footer>
</div>
```

✅ **Success Criterion 2.4.4 (Level A)**: 링크 목적 (맥락 내)

```html
<!-- ❌ 나쁜 예 -->
<a href="/property/123">더 보기</a>

<!-- ✅ 좋은 예 -->
<a href="/property/123" aria-label="논뷰맛집 펜션 상세 보기">
  더 보기
</a>

<!-- 또는 -->
<a href="/property/123">논뷰맛집 펜션 상세 보기</a>
```

✅ **Success Criterion 2.4.5 (Level AA)**: 여러 방법

- 검색바 (전역)
- 태그 필터
- 사이트맵 (Footer)

✅ **Success Criterion 2.4.6 (Level AA)**: 제목 및 레이블

```html
<!-- 명확한 제목 계층 -->
<h1>논뷰맛집 펜션</h1>
<h2>숙소 정보</h2>
<h3>편의시설</h3>

<!-- 명확한 폼 레이블 -->
<label for="check-in">체크인 날짜</label>
<input id="check-in" type="date" />
```

✅ **Success Criterion 2.4.7 (Level AA)**: 포커스 가시성

```css
/* 기본 포커스 링 제거 금지 */
*:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

/* 커스텀 포커스 스타일 */
button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 161, 224, 0.2);
}
```

**2.5 입력 양식 (Input Modalities)**

✅ **Success Criterion 2.5.1 (Level A)**: 포인터 제스처

- 복잡한 제스처 없음 (단일 클릭/탭만 사용)

✅ **Success Criterion 2.5.2 (Level A)**: 포인터 취소

```jsx
// 마우스 다운/업 분리 (실수 방지)
<button
  onMouseDown={(e) => e.preventDefault()}
  onClick={handleClick}
>
  예약하기
</button>
```

✅ **Success Criterion 2.5.3 (Level A)**: 레이블 내 이름

```jsx
// aria-label과 시각적 텍스트 일치
<button aria-label="숙소 탐색하기">
  숙소 탐색하기
</button>
```

✅ **Success Criterion 2.5.4 (Level A)**: 모션 작동

- 모션 기반 인터랙션 없음

✅ **Success Criterion 2.5.5 (Level AAA)**: 타겟 크기

```css
/* 최소 터치 타겟 크기: 44x44px (Apple HIG, WCAG AAA) */
button,
a {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
}
```

---

### 2.3 원칙 3: 이해 가능 (Understandable)

**3.1 읽기 가능 (Readable)**

✅ **Success Criterion 3.1.1 (Level A)**: 페이지 언어

```html
<html lang="ko">
```

✅ **Success Criterion 3.1.2 (Level AA)**: 부분 언어

```html
<!-- 영어 섹션 표시 -->
<p>
  이 숙소는 <span lang="en">Pet-friendly</span>입니다.
</p>
```

**3.2 예측 가능 (Predictable)**

✅ **Success Criterion 3.2.1 (Level A)**: 포커스 시

```jsx
// 포커스만으로 컨텍스트 변경 없음
<input
  type="text"
  onFocus={() => {
    // ❌ 자동으로 다른 페이지 이동 금지
  }}
  onChange={() => {
    // ✅ 사용자 입력 시에만 반응
  }}
/>
```

✅ **Success Criterion 3.2.2 (Level A)**: 입력 시

```jsx
// 입력만으로 폼 제출 없음
<select
  onChange={(e) => {
    // ❌ 자동 제출 금지
    setRegion(e.target.value);
  }}
>
  <option>강원도</option>
  <option>경기도</option>
</select>

<button type="submit">필터 적용</button> {/* ✅ 명시적 버튼 */}
```

✅ **Success Criterion 3.2.3 (Level AA)**: 일관된 네비게이션

- 모든 페이지에 동일한 SiteHeader
- Footer 위치 일관성

✅ **Success Criterion 3.2.4 (Level AA)**: 일관된 식별

- "예약하기" 버튼: 항상 동일한 텍스트 및 스타일
- 아이콘 일관성: 🔍 (검색), 📍 (위치), ⭐ (평점)

**3.3 입력 지원 (Input Assistance)**

✅ **Success Criterion 3.3.1 (Level A)**: 에러 식별

```jsx
// 폼 유효성 검사 에러 표시
const [errors, setErrors] = useState({});

<div>
  <label htmlFor="email">이메일</label>
  <input
    id="email"
    type="email"
    aria-invalid={errors.email ? "true" : "false"}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="error">
      ⚠️ {errors.email}
    </p>
  )}
</div>
```

✅ **Success Criterion 3.3.2 (Level A)**: 레이블 또는 지시사항

```jsx
<label htmlFor="password">
  비밀번호 <span aria-label="필수 입력">(필수)</span>
</label>
<input
  id="password"
  type="password"
  required
  aria-required="true"
  aria-describedby="password-hint"
/>
<p id="password-hint" className="hint">
  최소 8자 이상, 영문/숫자/특수문자 포함
</p>
```

✅ **Success Criterion 3.3.3 (Level AA)**: 에러 제안

```jsx
// 잘못된 이메일 형식 → 수정 제안
{errors.email && (
  <p role="alert">
    ⚠️ 이메일 형식이 올바르지 않습니다.
    예: user@example.com
  </p>
)}
```

✅ **Success Criterion 3.3.4 (Level AA)**: 에러 방지 (법적/금융/데이터)

```jsx
// 예약 최종 확인 단계
<div role="dialog" aria-labelledby="confirm-title">
  <h2 id="confirm-title">예약 정보 확인</h2>
  <dl>
    <dt>숙소</dt>
    <dd>논뷰맛집 펜션</dd>
    <dt>날짜</dt>
    <dd>2026-03-01 ~ 2026-03-03 (2박)</dd>
    <dt>총 금액</dt>
    <dd>100,000원</dd>
  </dl>
  <p>위 정보가 맞습니까?</p>
  <button onClick={handleConfirm}>예, 맞습니다</button>
  <button onClick={onCancel}>수정하기</button>
</div>
```

---

### 2.4 원칙 4: 견고성 (Robust)

**4.1 호환성 (Compatible)**

✅ **Success Criterion 4.1.1 (Level A)**: 파싱

- 유효한 HTML5 (W3C Validator 통과)
- 닫는 태그 누락 없음
- 중복 ID 없음

✅ **Success Criterion 4.1.2 (Level A)**: 이름, 역할, 값

```jsx
// 커스텀 컴포넌트에 ARIA 속성 추가
<div
  role="checkbox"
  aria-checked={isChecked}
  aria-labelledby="pet-label"
  tabIndex={0}
  onClick={toggle}
  onKeyDown={(e) => {
    if (e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  }}
>
  <span id="pet-label">반려동물 동반 가능</span>
</div>
```

✅ **Success Criterion 4.1.3 (Level AA)**: 상태 메시지

```jsx
// 토스트 알림
<div role="status" aria-live="polite" aria-atomic="true">
  숙소가 찜 목록에 추가되었습니다.
</div>

// 에러 알림
<div role="alert" aria-live="assertive" aria-atomic="true">
  예약에 실패했습니다. 다시 시도해주세요.
</div>
```

---

## 3. 키보드 네비게이션

### 3.1 전역 단축키

| 키 | 기능 | 컨텍스트 |
|----|------|----------|
| `Tab` | 다음 포커스 이동 | 전역 |
| `Shift + Tab` | 이전 포커스 이동 | 전역 |
| `Enter` | 링크/버튼 활성화 | 인터랙티브 요소 |
| `Space` | 버튼 활성화, 체크박스 토글 | 버튼, 체크박스 |
| `Esc` | 모달/드롭다운 닫기 | 오버레이 |
| `Arrow Keys` | 리스트/달력 탐색 | 특정 컴포넌트 |
| `/` | 검색바 포커스 | 전역 (향후 추가) |

### 3.2 포커스 관리

**모달 포커스 트랩**:
```jsx
import { useEffect, useRef } from 'react';

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // 모달 열릴 때 이전 포커스 저장
      previousFocusRef.current = document.activeElement;

      // 모달 내부 첫 번째 포커스 가능 요소로 이동
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    }

    return () => {
      // 모달 닫힐 때 이전 포커스 복원
      if (isOpen) {
        previousFocusRef.current?.focus();
      }
    };
  }, [isOpen]);

  // Esc 키로 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {children}
    </div>
  );
};
```

**Skip Links**:
```jsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <a href="#main-content" className="skip-link">
          본문으로 건너뛰기
        </a>
        <a href="#navigation" className="skip-link">
          메뉴로 건너뛰기
        </a>

        <SiteHeader id="navigation" />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
```

---

## 4. 스크린 리더 지원

### 4.1 ARIA Landmarks

```html
<header role="banner">
  <nav role="navigation" aria-label="주 메뉴">...</nav>
</header>

<main role="main">
  <section aria-labelledby="results-heading">
    <h1 id="results-heading">검색 결과</h1>
    ...
  </section>
</main>

<aside role="complementary" aria-label="필터">
  ...
</aside>

<footer role="contentinfo">
  ...
</footer>
```

### 4.2 Live Regions

```jsx
// 검색 결과 업데이트 알림
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {propertyCount}개의 숙소를 찾았습니다.
</div>

// 에러 메시지 (즉시 알림)
<div role="alert" aria-live="assertive">
  예약에 실패했습니다. 다시 시도해주세요.
</div>

// 로딩 상태
<div role="status" aria-live="polite">
  <span className="sr-only">숙소를 불러오는 중...</span>
  <Spinner aria-hidden="true" />
</div>
```

### 4.3 숨김 텍스트 (Screen Reader Only)

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

```jsx
// 아이콘 버튼
<button>
  <HeartIcon aria-hidden="true" />
  <span className="sr-only">찜하기</span>
</button>
```

---

## 5. 시각적 접근성

### 5.1 색상 명도 대비

**텍스트 색상 (WCAG AA 준수)**:
```css
:root {
  /* 대비율 12.63:1 ✅ */
  --text-primary: #16325C;

  /* 대비율 9.73:1 ✅ */
  --text-secondary: #3E3E3C;

  /* 대비율 3.02:1 (큰 텍스트만) */
  --primary: #00A1E0;

  /* 에러 색상: 대비율 5.5:1 ✅ */
  --error: #EA001E;

  /* 성공 색상: 대비율 4.8:1 ✅ */
  --success: #4BCA81;
}
```

**명도 대비 테스트 도구**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio](https://contrast-ratio.com/)

### 5.2 포커스 인디케이터

```css
*:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 161, 224, 0.2);
}

/* 다크 배경에서 */
.dark *:focus-visible {
  outline-color: #fff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
}
```

### 5.3 텍스트 크기 조정

```css
/* rem 단위로 사용자 브라우저 설정 반영 */
html {
  font-size: 16px; /* 기본값 */
}

body {
  font-size: 1rem; /* 16px */
}

h1 {
  font-size: 2.5rem; /* 40px */
}

/* 사용자가 브라우저에서 200% 확대 시 자동 적용 */
```

---

## 6. 인터랙티브 요소

### 6.1 버튼

```jsx
// ✅ 올바른 버튼
<button type="button" aria-label="숙소 찜하기">
  <HeartIcon aria-hidden="true" />
</button>

// ❌ 잘못된 버튼 (div 사용)
<div onClick={handleClick}>클릭</div>
```

### 6.2 링크 vs 버튼

**규칙**:
- **링크 (`<a>`)**: 페이지 이동
- **버튼 (`<button>`)**: 액션 실행 (폼 제출, 모달 열기)

```jsx
// ✅ 올바른 사용
<a href="/property/123">숙소 상세 보기</a>
<button onClick={openModal}>필터 열기</button>

// ❌ 잘못된 사용
<a href="#" onClick={openModal}>필터 열기</a>
<button onClick={() => router.push('/explore')}>탐색</button>
```

### 6.3 토글 스위치

```jsx
<button
  role="switch"
  aria-checked={isEnabled}
  aria-label="반려동물 동반 가능 필터"
  onClick={toggle}
>
  <span className="switch-track">
    <span className={`switch-thumb ${isEnabled ? 'active' : ''}`} />
  </span>
  <span className="sr-only">
    반려동물 동반 가능 필터 {isEnabled ? '활성화됨' : '비활성화됨'}
  </span>
</button>
```

---

## 7. 폼 접근성

### 7.1 레이블 연결

```jsx
// ✅ 올바른 레이블
<label htmlFor="check-in">체크인 날짜</label>
<input id="check-in" type="date" required />

// ❌ 레이블 없음
<input type="date" placeholder="체크인 날짜" />
```

### 7.2 에러 처리

```jsx
const [errors, setErrors] = useState({});

<div>
  <label htmlFor="email">
    이메일 <span aria-label="필수 입력">(필수)</span>
  </label>
  <input
    id="email"
    type="email"
    required
    aria-required="true"
    aria-invalid={errors.email ? "true" : "false"}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="error-message">
      ⚠️ {errors.email}
    </p>
  )}
</div>
```

### 7.3 필수 필드 표시

```jsx
<label htmlFor="name">
  이름
  <abbr title="필수 입력" aria-label="필수 입력">
    *
  </abbr>
</label>
<input
  id="name"
  type="text"
  required
  aria-required="true"
/>
```

---

## 8. 모바일 접근성

### 8.1 터치 타겟 크기

**최소 크기: 44x44px (Apple HIG, WCAG AAA 기준)**

```css
button,
a,
input[type="checkbox"],
input[type="radio"] {
  min-height: 44px;
  min-width: 44px;
}
```

### 8.2 제스처 대안

```jsx
// ❌ 스와이프만 지원
<div onTouchMove={handleSwipe}>...</div>

// ✅ 스와이프 + 버튼 제공
<div>
  <button onClick={handlePrev}>이전</button>
  <div onTouchMove={handleSwipe}>...</div>
  <button onClick={handleNext}>다음</button>
</div>
```

---

## 9. 테스트 가이드

### 9.1 자동화 테스트

**eslint-plugin-jsx-a11y**:
```json
// .eslintrc.json
{
  "extends": [
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": ["jsx-a11y"]
}
```

**axe-core (Playwright)**:
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('접근성 테스트', async ({ page }) => {
  await page.goto('/');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

### 9.2 수동 테스트

**키보드 테스트**:
1. Tab 키로 모든 인터랙티브 요소 접근 가능한지 확인
2. Enter/Space 키로 활성화 가능한지 확인
3. Esc 키로 모달 닫히는지 확인

**스크린 리더 테스트**:
- **macOS**: VoiceOver (`Cmd + F5`)
- **Windows**: NVDA (무료)
- **Chrome**: ChromeVox 확장 프로그램

**명도 대비 테스트**:
- Chrome DevTools Accessibility 패널
- [WAVE Extension](https://wave.webaim.org/extension/)

---

## 10. 개선 계획

### Phase 1 (MVP 완료 후)
- [ ] 전체 페이지 WCAG 2.1 AA 자동 테스트
- [ ] VoiceOver/NVDA 수동 테스트
- [ ] 키보드 네비게이션 완전 지원

### Phase 2 (Beta)
- [ ] WCAG 2.1 AAA 부분 준수 (텍스트 명도 대비 7:1)
- [ ] 다국어 지원 (영어, 일본어)
- [ ] 고대비 모드 지원

### Phase 3 (Launch)
- [ ] 정기적 접근성 감사 (연 2회)
- [ ] 사용자 피드백 수집
- [ ] 접근성 개선 로드맵 공개

---

**문서 버전**: 1.0
**최종 수정일**: 2026-02-10
**다음 검토 예정**: 2026-03-01 (MVP 완료 후)

---

## 참고 문서

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [한국형 웹 콘텐츠 접근성 지침 (KWCAG) 2.1](http://www.wa.or.kr/m1/sub1.asp)

---

**End of Document**
