# VINTEE 챗봇 기능

## 개요

VINTEE 플랫폼의 우측 하단에 위치한 AI 챗봇입니다. 등록된 숙소, 태그, 후기 등 **내부 데이터만**을 기반으로 사용자에게 상담 서비스를 제공합니다.

## 주요 기능

### 1. 의도 기반 대화 분류 (Intent Classification)

사용자 메시지를 분석하여 다음 의도를 자동 분류합니다:

- **태그 기반 검색** (`TAG_BASED`): `#논뷰맛집`, `#힐링` 등 해시태그로 숙소 검색
- **지역 검색** (`PROPERTY_SEARCH`): 강릉, 제주, 경주 등 지역명으로 숙소 검색
- **추천** (`PROPERTY_RECOMMEND`): 힐링, 조용한 등 키워드로 숙소 추천
- **후기 조회** (`REVIEW_INQUIRY`): 후기가 좋은 숙소 찾기
- **가격 문의** (`PRICE_INQUIRY`): 가격대 안내
- **예약 도움말** (`BOOKING_HELP`): 예약 방법 안내
- **일반 질문** (`GENERAL_QUESTION`): 인사, 기타 질문

### 2. 키워드 기반 검색

간단한 키워드 매칭으로 빠르고 정확한 검색을 제공합니다:

```typescript
// 지역 키워드
["강릉", "강원", "경주", "전주", "제주", "부산", "여수", "속초", "양양", "춘천", "가평", "남해"]

// 후기 키워드
["후기", "리뷰", "평가", "평점", "별점"]

// 가격 키워드
["가격", "얼마", "비용", "요금", "저렴", "비싼"]

// 예약 키워드
["예약", "체크인", "체크아웃", "숙박", "묵다"]

// 추천 키워드
["추천", "좋은", "힐링", "쉬다", "조용한", "경치", "뷰"]
```

### 3. 숙소 카드 표시

검색 결과를 시각적인 카드 형태로 표시하며, 클릭 시 해당 숙소 상세 페이지로 이동합니다:

- 숙소 썸네일 이미지
- 숙소 이름
- 1박 가격
- 관련 태그 (최대 2개)

## 예시 대화

### 태그 검색
```
사용자: #논뷰맛집 숙소 찾아줘
챗봇: #논뷰맛집 태그의 숙소 3곳을 찾았어요! 아래에서 확인해보세요.
      [숙소 카드 표시]
```

### 지역 검색
```
사용자: 강릉 근처에 숙소 있어?
챗봇: 강릉 지역의 숙소 5곳을 찾았어요! 각 숙소를 클릭하면 자세한 정보를 볼 수 있습니다.
      [숙소 카드 표시]
```

### 추천
```
사용자: 힐링할 수 있는 곳 추천해줘
챗봇: 이런 숙소는 어떠세요? 힐링하기 좋은 5곳을 추천드립니다.
      [숙소 카드 표시]
```

### 가격 문의
```
사용자: 가격대가 어떻게 돼?
챗봇: 현재 VINTEE의 숙소 가격대는 다음과 같습니다:

      최저: 80,000원/박
      평균: 150,000원/박
      최고: 300,000원/박

      원하시는 가격대가 있으시면 말씀해주세요!
```

## 기술 스택

- **프론트엔드**: React + TypeScript + Tailwind CSS + shadcn/ui
- **백엔드**: Next.js API Routes
- **데이터베이스**: PostgreSQL + Prisma ORM
- **AI 모델**: OpenAI GPT-4o-mini (선택사항, 폴백: 키워드 기반)

## 파일 구조

```
src/
├── components/chatbot/
│   ├── chatbot-widget.tsx           # 메인 챗봇 위젯
│   ├── message-list.tsx             # 메시지 리스트
│   ├── message-bubble.tsx           # 개별 메시지 버블
│   ├── chat-input.tsx               # 입력 필드
│   └── types.ts                     # 타입 정의
├── lib/chatbot/
│   ├── llm-response-generator.ts    # OpenAI 기반 응답 생성 (NEW!)
│   ├── intent-classifier.ts         # 의도 분류 로직 (폴백용)
│   └── response-generator.ts        # 응답 생성 로직 (폴백용)
└── app/api/chat/
    └── route.ts                     # 챗봇 API 엔드포인트
```

## UI/UX 특징

### 데스크톱
- 우측 하단 플로팅 버튼 (직경 56px)
- 클릭 시 챗봇 대화창 표시 (너비 384px, 높이 600px)
- 최소화 기능
- 닫기 버튼

### 모바일
- 우측 하단 플로팅 버튼
- 클릭 시 전체 화면 모달로 표시
- 반응형 디자인 (Tailwind breakpoints)

### 접근성
- `aria-label` 속성으로 스크린 리더 지원
- 키보드 네비게이션 (Enter: 전송, Shift+Enter: 줄바꿈)

## OpenAI 설정 방법 (자연스러운 대화)

### 1. OpenAI API 키 발급

1. https://platform.openai.com/api-keys 방문
2. "Create new secret key" 클릭
3. API 키 복사 (sk-로 시작)

### 2. 환경 변수 설정

`.env.local` 파일에 다음 줄의 주석을 해제하고 API 키를 입력:

```bash
# 주석 해제하고 실제 키 입력
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. 서버 재시작

```bash
# 기존 서버 종료 후 재시작
npm run dev
```

### 4. 테스트

이제 챗봇이 자연스러운 질문을 이해합니다:

- ✅ "동북부 산골이 맛깔인가요?"
- ✅ "힐링하기 좋은 조용한 곳 있을까요?"
- ✅ "가족과 함께 가기 좋은 펜션 추천해줘"
- ✅ "강릉 근처에 바다 보이는 숙소 찾고 있어요"

### 비용 안내

- **모델**: GPT-4o-mini (비용 효율적)
- **가격**: 약 $0.15 / 1M 입력 토큰, $0.60 / 1M 출력 토큰
- **예상 비용**: 대화 1회당 약 $0.001~0.005 (1~5원)

### 폴백 모드

API 키를 설정하지 않으면 **기본 키워드 매칭** 방식으로 동작합니다:
- 비용 무료
- 간단한 검색 가능 (예: "강릉 숙소", "#논뷰맛집")
- 자연스러운 대화 불가

## 향후 개선 사항

### 1. 다른 AI 모델 지원
- Anthropic Claude
- Google Gemini
- Vercel AI SDK 통합

### 2. 대화 기록 저장
- 로그인 사용자 대화 히스토리 저장
- 이전 대화 컨텍스트 활용

### 3. 추천 알고리즘 고도화
- 협업 필터링 (Collaborative Filtering)
- 콘텐츠 기반 필터링 (Content-based Filtering)
- 하이브리드 추천

### 4. 피드백 시스템
- 응답 유용성 평가 (👍/👎)
- 챗봇 성능 개선 데이터 수집

## 개발 가이드

### 챗봇 테스트

1. 개발 서버 시작
```bash
npm run dev
```

2. 브라우저에서 `http://localhost:3010` 접속

3. 우측 하단 챗봇 버튼 클릭

4. 다음 질문들을 테스트:
   - "안녕하세요"
   - "#논뷰맛집 숙소 보여줘"
   - "강릉 근처 숙소 찾아줘"
   - "힐링할 수 있는 곳 추천해줘"
   - "가격대가 어떻게 돼?"
   - "후기 좋은 곳 알려줘"
   - "예약은 어떻게 해?"

### 새로운 의도 추가

1. `src/components/chatbot/types.ts`에 새 의도 추가:
```typescript
export enum ChatIntent {
  // ... 기존 의도들
  NEW_INTENT = "NEW_INTENT",
}
```

2. `src/lib/chatbot/intent-classifier.ts`에 키워드 매칭 로직 추가:
```typescript
const newKeywords = ["키워드1", "키워드2"];
if (newKeywords.some(k => lowerMessage.includes(k))) {
  return {
    intent: ChatIntent.NEW_INTENT,
    confidence: 0.8,
    keywords: newKeywords.filter(k => lowerMessage.includes(k)),
  };
}
```

3. `src/lib/chatbot/response-generator.ts`에 응답 생성 로직 추가:
```typescript
case ChatIntent.NEW_INTENT:
  return await handleNewIntent();
```

## 제약 사항

1. **외부 데이터 차단**: 챗봇은 오직 내부 데이터(Property, Review, Tag)만 사용합니다.
2. **AI 모델 미사용**: 현재는 간단한 키워드 매칭만 사용합니다. (비용 절감)
3. **대화 컨텍스트 제한**: 현재 각 메시지를 독립적으로 처리합니다. (추후 개선 가능)

## 라이선스

이 챗봇은 VINTEE 플랫폼의 일부이며, 프로젝트의 라이선스를 따릅니다.
