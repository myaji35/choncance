# Trello 연동 가이드

## 개요
ChonCance 프로젝트와 Trello를 연동하여 작업 관리, 예약 관리, 호스트 요청 등을 자동화할 수 있습니다.

## 연동 방법

### 1. Trello API 키 발급

#### Step 1: Trello API Key 및 Token 받기
1. Trello 계정으로 로그인
2. https://trello.com/power-ups/admin 방문
3. "New" 버튼 클릭하여 새 Power-Up 생성
4. API Key 복사
5. "Token" 링크를 클릭하여 Token 생성 및 복사

#### Step 2: 환경 변수 설정
```bash
# .env.local
TRELLO_API_KEY=your_api_key_here
TRELLO_TOKEN=your_token_here
TRELLO_BOARD_ID=your_board_id  # 사용할 보드 ID
```

### 2. Trello SDK 설치

```bash
npm install trello  # ✅ 이미 설치 완료!
```

### 3. 빠른 시작

#### Step 1: List ID 확인
```bash
npm run trello:setup
```

이 명령어를 실행하면:
- 보드의 모든 리스트 조회
- 각 리스트의 ID 출력
- 환경 변수 설정 가이드 제공

#### Step 2: 환경 변수 설정
`.env.local` 파일에 출력된 환경 변수를 복사하여 붙여넣기

#### Step 3: 연동 테스트
```bash
npm run trello:test
```

이 명령어를 실행하면:
- 테스트 카드 생성
- 라벨 추가
- Due Date 설정
- 체크리스트 추가

모든 기능이 정상 작동하면 Trello 연동 준비 완료!

## 연동 시나리오

### 시나리오 1: 예약 요청 자동 카드 생성

새로운 예약이 들어오면 Trello 보드에 자동으로 카드를 생성합니다.

**Trello 보드 구조 예시:**
```
보드: ChonCance 예약 관리
├── List: 새 예약 (New Bookings)
├── List: 확인 중 (Confirming)
├── List: 확정됨 (Confirmed)
├── List: 체크인 완료 (Checked In)
└── List: 완료 (Completed)
```

**구현 위치:** `src/lib/trello/booking-sync.ts`
```typescript
import Trello from 'trello';

const trello = new Trello(
  process.env.TRELLO_API_KEY!,
  process.env.TRELLO_TOKEN!
);

export async function createBookingCard(booking: {
  id: string;
  propertyName: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  totalAmount: number;
  status: string;
}) {
  const listId = process.env.TRELLO_NEW_BOOKINGS_LIST_ID!;

  const cardName = `[${booking.id.slice(0, 8)}] ${booking.propertyName} - ${booking.guestName}`;
  const cardDesc = `
**예약 정보**
- 게스트: ${booking.guestName}
- 숙소: ${booking.propertyName}
- 체크인: ${booking.checkIn.toLocaleDateString('ko-KR')}
- 체크아웃: ${booking.checkOut.toLocaleDateString('ko-KR')}
- 금액: ${booking.totalAmount.toLocaleString()}원
- 상태: ${booking.status}

[예약 상세보기](https://choncance.com/bookings/${booking.id})
`;

  try {
    const card = await trello.addCard(cardName, cardDesc, listId);

    // 라벨 추가 (예: 금액대별 색상)
    if (booking.totalAmount > 500000) {
      await trello.addLabelToCard(card.id, 'red'); // 고액 예약
    } else if (booking.totalAmount > 200000) {
      await trello.addLabelToCard(card.id, 'yellow'); // 중액 예약
    }

    // 체크인 날짜를 Due Date로 설정
    await trello.updateCard(card.id, 'due', booking.checkIn.toISOString());

    return card;
  } catch (error) {
    console.error('Trello 카드 생성 실패:', error);
    throw error;
  }
}

export async function updateBookingCardStatus(
  cardId: string,
  newStatus: string
) {
  // 상태에 따라 카드를 다른 리스트로 이동
  const listMapping: Record<string, string> = {
    PENDING: process.env.TRELLO_NEW_BOOKINGS_LIST_ID!,
    CONFIRMED: process.env.TRELLO_CONFIRMED_LIST_ID!,
    CHECKED_IN: process.env.TRELLO_CHECKED_IN_LIST_ID!,
    COMPLETED: process.env.TRELLO_COMPLETED_LIST_ID!,
  };

  const targetListId = listMapping[newStatus];
  if (targetListId) {
    await trello.updateCard(cardId, 'idList', targetListId);
  }
}
```

**API 통합:** `src/app/api/bookings/route.ts`
```typescript
import { createBookingCard } from '@/lib/trello/booking-sync';

export async function POST(request: Request) {
  // ... 예약 생성 로직 ...

  // Trello 카드 생성 (비동기, 실패해도 예약은 생성됨)
  if (process.env.TRELLO_API_KEY && process.env.TRELLO_TOKEN) {
    try {
      const trelloCard = await createBookingCard({
        id: booking.id,
        propertyName: property.name,
        guestName: user.name,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        totalAmount: booking.totalAmount,
        status: booking.status,
      });

      // Trello 카드 ID를 booking metadata에 저장
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          metadata: {
            trelloCardId: trelloCard.id,
          },
        },
      });
    } catch (error) {
      console.error('Trello sync failed:', error);
      // 에러가 나도 예약은 정상 처리
    }
  }

  return NextResponse.json({ booking });
}
```

---

### 시나리오 2: 호스트 신청 관리

새로운 호스트 신청을 Trello 카드로 생성하여 승인 프로세스를 관리합니다.

**Trello 보드 구조:**
```
보드: ChonCance 호스트 관리
├── List: 신규 신청 (New Applications)
├── List: 서류 검토 중 (Document Review)
├── List: 면접 예정 (Interview Scheduled)
├── List: 승인 완료 (Approved)
└── List: 거절 (Rejected)
```

**구현:** `src/lib/trello/host-sync.ts`
```typescript
export async function createHostApplicationCard(application: {
  userId: string;
  userName: string;
  email: string;
  phone: string;
  businessName?: string;
  businessNumber?: string;
  propertyCount: number;
}) {
  const listId = process.env.TRELLO_HOST_APPLICATIONS_LIST_ID!;

  const cardName = `[호스트 신청] ${application.userName} - ${application.email}`;
  const cardDesc = `
**신청자 정보**
- 이름: ${application.userName}
- 이메일: ${application.email}
- 연락처: ${application.phone}
- 사업자명: ${application.businessName || '미등록'}
- 사업자번호: ${application.businessNumber || '미등록'}
- 등록 예정 숙소: ${application.propertyCount}개

**체크리스트**
- [ ] 신원 확인
- [ ] 사업자 등록증 검토
- [ ] 숙소 정보 확인
- [ ] 면접 진행
- [ ] 승인 처리

[신청 상세보기](https://choncance.com/admin/hosts/${application.userId})
`;

  const card = await trello.addCard(cardName, cardDesc, listId);

  // 체크리스트 추가
  await trello.addChecklistToCard(card.id, '승인 프로세스', [
    '신원 확인',
    '사업자 등록증 검토',
    '숙소 정보 확인',
    '면접 진행',
    '승인 처리',
  ]);

  return card;
}
```

---

### 시나리오 3: 개발 작업 관리 (현재 PM Tools와 연동)

IMPROVEMENT_PLAN.md의 작업을 Trello 카드로 자동 생성합니다.

**Trello 보드 구조:**
```
보드: ChonCance 개발
├── List: Backlog
├── List: To Do (이번 주)
├── List: In Progress
├── List: Review
└── List: Done
```

**구현:** `src/lib/trello/project-sync.ts`
```typescript
export async function syncImprovementPlanToTrello() {
  const tasks = [
    {
      title: 'Priority 1: /recommendations and /how-to-use 페이지 생성',
      priority: 1,
      estimate: '1-2 days',
      subtasks: [
        '테마별 큐레이션 콘텐츠 작성',
        '이용 가이드 페이지 UI 구현',
        '호스트 가이드 섹션 추가',
      ],
    },
    {
      title: 'Priority 2: Booking widget 개선',
      priority: 2,
      estimate: '2-3 days',
      subtasks: [
        'Plus/Minus 버튼으로 게스트 선택 개선',
        '날짜 선택 캘린더 UX 개선',
        '실시간 가격 계산 표시',
      ],
    },
    // ... more tasks
  ];

  const backlogListId = process.env.TRELLO_BACKLOG_LIST_ID!;

  for (const task of tasks) {
    const cardName = `[P${task.priority}] ${task.title}`;
    const cardDesc = `
**예상 작업 시간:** ${task.estimate}

**서브 태스크:**
${task.subtasks.map((st) => `- [ ] ${st}`).join('\n')}
`;

    const card = await trello.addCard(cardName, cardDesc, backlogListId);

    // 우선순위별 라벨
    const labelColors = ['red', 'orange', 'yellow', 'green'];
    await trello.addLabelToCard(card.id, labelColors[task.priority - 1]);

    // 체크리스트 추가
    await trello.addChecklistToCard(card.id, 'Subtasks', task.subtasks);
  }
}
```

---

### 시나리오 4: 리뷰 응답 관리

새로운 리뷰가 작성되면 Trello 카드를 생성하여 호스트 응답을 관리합니다.

**구현:** `src/lib/trello/review-sync.ts`
```typescript
export async function createReviewCard(review: {
  id: string;
  propertyName: string;
  guestName: string;
  rating: number;
  content: string;
  createdAt: Date;
}) {
  const listId = process.env.TRELLO_REVIEWS_LIST_ID!;

  const cardName = `[리뷰 응답 필요] ${review.propertyName} - ⭐${review.rating}/5`;
  const cardDesc = `
**리뷰 정보**
- 게스트: ${review.guestName}
- 숙소: ${review.propertyName}
- 평점: ${'⭐'.repeat(review.rating)}
- 작성일: ${review.createdAt.toLocaleDateString('ko-KR')}

**리뷰 내용:**
> ${review.content}

**액션 아이템:**
- [ ] 호스트에게 리뷰 알림
- [ ] 응답 작성
- [ ] 필요시 개선 사항 반영

[리뷰 확인하기](https://choncance.com/reviews/${review.id})
`;

  const card = await trello.addCard(cardName, cardDesc, listId);

  // 낮은 평점은 긴급 라벨
  if (review.rating <= 3) {
    await trello.addLabelToCard(card.id, 'red');
    // Due date를 24시간 후로 설정
    const dueDate = new Date();
    dueDate.setHours(dueDate.getHours() + 24);
    await trello.updateCard(card.id, 'due', dueDate.toISOString());
  }

  return card;
}
```

---

## 고급 기능

### Webhook을 통한 양방향 동기화

Trello에서 카드 상태가 변경되면 ChonCance 데이터베이스도 업데이트합니다.

**구현:** `src/app/api/webhooks/trello/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Trello webhook 시그니처 검증
  // https://developer.atlassian.com/cloud/trello/guides/rest-api/webhooks/

  const { action, model } = body;

  // 카드가 다른 리스트로 이동된 경우
  if (action.type === 'updateCard' && action.data.listAfter) {
    const cardId = model.id;
    const newListId = action.data.listAfter.id;

    // 카드 ID로 예약 찾기
    const booking = await prisma.booking.findFirst({
      where: {
        metadata: {
          path: ['trelloCardId'],
          equals: cardId,
        },
      },
    });

    if (booking) {
      // 리스트 ID에 따라 예약 상태 업데이트
      const statusMapping: Record<string, string> = {
        [process.env.TRELLO_CONFIRMED_LIST_ID!]: 'CONFIRMED',
        [process.env.TRELLO_CHECKED_IN_LIST_ID!]: 'CHECKED_IN',
        [process.env.TRELLO_COMPLETED_LIST_ID!]: 'COMPLETED',
      };

      const newStatus = statusMapping[newListId];
      if (newStatus) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: newStatus },
        });
      }
    }
  }

  // 체크리스트 아이템이 완료된 경우
  if (action.type === 'updateCheckItemStateOnCard') {
    // 특정 액션 수행 (예: 이메일 발송)
  }

  return NextResponse.json({ success: true });
}
```

**Webhook 등록:**
```typescript
// scripts/setup-trello-webhook.ts
import Trello from 'trello';

const trello = new Trello(
  process.env.TRELLO_API_KEY!,
  process.env.TRELLO_TOKEN!
);

async function setupWebhook() {
  const webhook = await trello.addWebhook(
    'ChonCance Bookings Webhook',
    'https://choncance.com/api/webhooks/trello',
    process.env.TRELLO_BOARD_ID!
  );
  console.log('Webhook created:', webhook);
}

setupWebhook();
```

---

## 환경 변수 설정 (전체)

```bash
# .env.local

# Trello API Credentials
TRELLO_API_KEY=your_api_key_here
TRELLO_TOKEN=your_token_here

# Board IDs
TRELLO_BOARD_ID=your_main_board_id

# 예약 관리 List IDs
TRELLO_NEW_BOOKINGS_LIST_ID=list_id_1
TRELLO_CONFIRMED_LIST_ID=list_id_2
TRELLO_CHECKED_IN_LIST_ID=list_id_3
TRELLO_COMPLETED_LIST_ID=list_id_4

# 호스트 관리 List IDs
TRELLO_HOST_APPLICATIONS_LIST_ID=list_id_5

# 개발 관리 List IDs
TRELLO_BACKLOG_LIST_ID=list_id_6
TRELLO_TODO_LIST_ID=list_id_7
TRELLO_IN_PROGRESS_LIST_ID=list_id_8
TRELLO_REVIEW_LIST_ID=list_id_9
TRELLO_DONE_LIST_ID=list_id_10

# 리뷰 관리 List IDs
TRELLO_REVIEWS_LIST_ID=list_id_11
```

---

## 설치 및 설정 단계

### 1. Package 설치
```bash
npm install trello
npm install @types/trello --save-dev
```

### 2. Trello API 키 발급
1. https://trello.com/power-ups/admin 접속
2. New Power-Up 생성
3. API Key 및 Token 발급

### 3. Board 및 List ID 찾기
```bash
# Board ID는 Trello URL에서 확인
# https://trello.com/b/BOARD_ID/board-name

# List ID 확인 스크립트
node scripts/get-trello-list-ids.js
```

**scripts/get-trello-list-ids.js:**
```javascript
const Trello = require('trello');

const trello = new Trello(
  process.env.TRELLO_API_KEY,
  process.env.TRELLO_TOKEN
);

async function getListIds() {
  const boardId = process.env.TRELLO_BOARD_ID;
  const lists = await trello.getListsOnBoard(boardId);

  console.log('Lists on board:');
  lists.forEach((list) => {
    console.log(`${list.name}: ${list.id}`);
  });
}

getListIds();
```

### 4. 환경 변수 설정
위의 환경 변수들을 `.env.local`에 추가

### 5. GCP Secret Manager 설정 (프로덕션)
```bash
# Trello API Key
echo -n "your_api_key" | gcloud secrets create trello-api-key --data-file=-

# Trello Token
echo -n "your_token" | gcloud secrets create trello-token --data-file=-

# Cloud Run에 secret 마운트
gcloud run services update choncance \
  --update-secrets TRELLO_API_KEY=trello-api-key:latest \
  --update-secrets TRELLO_TOKEN=trello-token:latest \
  --region asia-northeast3
```

---

## 사용 예시

### 예약 생성 시 Trello 카드 자동 생성
```typescript
// src/app/api/bookings/route.ts
import { createBookingCard } from '@/lib/trello/booking-sync';

export async function POST(request: Request) {
  const booking = await prisma.booking.create({ /* ... */ });

  // Trello 동기화
  if (process.env.TRELLO_API_KEY) {
    await createBookingCard({
      id: booking.id,
      propertyName: property.name,
      guestName: user.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalAmount: booking.totalAmount,
      status: booking.status,
    });
  }

  return NextResponse.json({ booking });
}
```

### 호스트 신청 시 Trello 카드 생성
```typescript
// src/app/api/user/request-host/route.ts
import { createHostApplicationCard } from '@/lib/trello/host-sync';

export async function POST(request: Request) {
  const application = await prisma.hostProfile.create({ /* ... */ });

  await createHostApplicationCard({
    userId: user.id,
    userName: user.name,
    email: user.email,
    phone: user.phone || '',
    businessName: data.businessName,
    businessNumber: data.businessNumber,
    propertyCount: 1,
  });

  return NextResponse.json({ success: true });
}
```

---

## 장점

### 1. 프로젝트 관리
- 예약, 호스트 신청, 리뷰를 한눈에 관리
- 팀원들과 실시간 협업
- 모바일 앱으로 언제든 확인

### 2. 자동화
- 수동 입력 없이 자동으로 카드 생성
- 상태 변경 시 자동 동기화
- 알림 및 Due Date 자동 설정

### 3. 시각화
- 칸반 보드로 진행 상황 시각화
- 우선순위별 라벨링
- 통계 및 리포트 (Trello Power-Ups)

### 4. 유연성
- 다양한 워크플로우 구성 가능
- 커스텀 필드 및 체크리스트
- 타 서비스 연동 (Slack, Google Drive 등)

---

## 대안: 다른 프로젝트 관리 도구

Trello 외에도 다음 도구들과 연동 가능합니다:

### 1. Notion
- API: https://developers.notion.com
- 장점: 문서와 데이터베이스 통합, 강력한 데이터 관리

### 2. Asana
- API: https://developers.asana.com
- 장점: 복잡한 프로젝트 관리, Gantt 차트

### 3. Jira
- API: https://developer.atlassian.com/cloud/jira/platform/rest/v3/
- 장점: 개발 팀에 최적화, 스프린트 관리

### 4. Monday.com
- API: https://developer.monday.com
- 장점: 고도의 커스터마이징, 자동화 워크플로우

### 5. ClickUp
- API: https://clickup.com/api
- 장점: All-in-one 솔루션, 다양한 뷰 옵션

---

## 비용

### Trello 요금제
- **Free**: 개인 및 소규모 팀 (10 boards/workspace, Power-Ups 제한)
- **Standard**: $5/user/month (무제한 boards, 고급 체크리스트)
- **Premium**: $10/user/month (Calendar view, Timeline view, 고급 자동화)
- **Enterprise**: $17.50/user/month (무제한 workspaces, 엔터프라이즈 보안)

**추천:** Standard 또는 Premium (자동화 기능 필요 시)

---

## 다음 단계

1. Trello API Key 발급
2. 테스트용 Trello Board 생성
3. `npm install trello` 실행
4. `src/lib/trello/` 디렉토리 생성 및 코드 구현
5. 예약 API에 Trello 동기화 추가
6. 테스트 후 프로덕션 배포

원하시는 시나리오를 선택하시면 바로 구현해드리겠습니다!
