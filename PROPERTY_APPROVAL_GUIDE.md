# 숙소 승인 시스템 가이드 (Property Approval System Guide)

## 개요

ChonCance 플랫폼의 숙소 승인 시스템은 관리자가 호스트가 등록한 숙소를 검토하고 승인/거절할 수 있는 기능입니다.

## 숙소 상태 (Property Status)

숙소는 다음 4가지 상태를 가질 수 있습니다:

- **PENDING**: 검토 대기중 (호스트가 숙소를 등록한 초기 상태)
- **APPROVED**: 승인됨 (게스트가 예약할 수 있는 상태)
- **REJECTED**: 거절됨 (승인이 거절된 상태)
- **INACTIVE**: 비활성화 (호스트가 일시적으로 비활성화한 상태)

## 접근 방법

### 1. 관리자 대시보드에서 접근

```
http://localhost:3010/admin
```

관리자 대시보드에 접속하면:
- 검토 대기중인 숙소가 있는 경우 상단에 **amber 색상의 알림 배너**가 표시됩니다
- 배너를 클릭하면 숙소 승인 페이지로 이동합니다
- "관리자 메뉴" 섹션에서 "숙소 승인 관리" 링크를 클릭할 수도 있습니다

### 2. 직접 URL 접근

```
http://localhost:3010/admin/properties/pending
```

## 숙소 승인 페이지 기능

### 숙소 목록 표시

각 숙소 카드에는 다음 정보가 표시됩니다:

- **숙소 이름**
- **호스트 정보**: 이름, 이메일, 연락처
- **등록일**
- **숙소 이미지** (썸네일 또는 첫 번째 이미지)
- **숙소 설명** (최대 3줄)
- **위치** (주소)
- **가격** (1박 요금)
- **최대 인원**
- **태그** (설정된 경우)

### 액션 버튼

각 숙소마다 3개의 버튼이 제공됩니다:

1. **👁️ 상세보기**: 숙소 상세 페이지로 이동하여 전체 정보 확인
2. **✅ 승인**: 숙소를 승인하여 APPROVED 상태로 변경
3. **❌ 거절**: 거절 사유를 입력하여 숙소를 REJECTED 상태로 변경

## 숙소 승인 프로세스

### 승인 (APPROVE)

1. "승인" 버튼 클릭
2. 확인 다이얼로그에서 "확인" 선택
3. 시스템이 다음 작업을 수행합니다:
   - 숙소 상태를 `PENDING` → `APPROVED`로 변경
   - 호스트에게 승인 알림 발송
   - 숙소가 게스트에게 공개되어 예약 가능한 상태가 됨
4. 목록에서 해당 숙소가 자동으로 제거됨

**호스트가 받는 알림:**
```
제목: 숙소가 승인되었습니다 🎉
내용: {숙소이름}이(가) 관리자에 의해 승인되었습니다.
      이제 게스트들이 숙소를 예약할 수 있습니다.
링크: /property/{propertyId}
```

### 거절 (REJECT)

1. "거절" 버튼 클릭
2. 거절 사유 입력 프롬프트가 표시됨
3. 거절 사유를 입력하고 "확인" 선택
   - 사유를 입력하지 않으면 거절이 취소됨
4. 시스템이 다음 작업을 수행합니다:
   - 숙소 상태를 `PENDING` → `REJECTED`로 변경
   - 호스트에게 거절 알림과 사유 발송
5. 목록에서 해당 숙소가 자동으로 제거됨

**호스트가 받는 알림:**
```
제목: 숙소 등록이 거절되었습니다
내용: {숙소이름}의 등록이 거절되었습니다.
      사유: {입력한 거절 사유}
링크: /host/properties/{propertyId}/edit
```

## API 엔드포인트

### 숙소 목록 조회

```http
GET /api/admin/properties?status=PENDING
Authorization: Clerk Session (ADMIN role required)
```

**Response:**
```json
{
  "properties": [
    {
      "id": "property_id",
      "name": "숙소 이름",
      "description": "숙소 설명",
      "address": "주소",
      "pricePerNight": 100000,
      "maxGuests": 4,
      "images": ["url1", "url2"],
      "thumbnailUrl": "thumbnail_url",
      "status": "PENDING",
      "createdAt": "2025-11-03T00:00:00.000Z",
      "host": {
        "user": {
          "name": "호스트 이름",
          "email": "host@example.com",
          "phone": "010-1234-5678"
        }
      },
      "tags": [
        {
          "id": "tag_id",
          "name": "#논뷰맛집",
          "category": "VIEW"
        }
      ],
      "_count": {
        "bookings": 0,
        "reviews": 0
      }
    }
  ]
}
```

### 숙소 상태 변경

```http
PATCH /api/admin/properties/:id/status
Authorization: Clerk Session (ADMIN role required)
Content-Type: application/json

{
  "status": "APPROVED" | "REJECTED",
  "rejectionReason": "거절 사유 (REJECTED인 경우)"
}
```

**Response:**
```json
{
  "property": {
    "id": "property_id",
    "status": "APPROVED",
    ...
  },
  "message": "숙소가 승인되었습니다"
}
```

## 알림 시스템

숙소 승인/거절 시 자동으로 호스트에게 알림이 발송됩니다.

### 데이터베이스 알림 타입

Prisma schema에 다음 알림 타입이 추가되었습니다:

```prisma
enum NotificationType {
  // ... 기존 타입들
  PROPERTY_APPROVED
  PROPERTY_REJECTED
}
```

### 알림 헬퍼 함수

`/src/lib/notifications.ts`:

```typescript
// 숙소 승인 알림
export async function notifyPropertyApproved(
  userId: string,
  propertyId: string,
  propertyName: string
)

// 숙소 거절 알림
export async function notifyPropertyRejected(
  userId: string,
  propertyId: string,
  propertyName: string,
  reason?: string
)
```

## 권한 관리

### 관리자 권한 필요

숙소 승인 기능은 **ADMIN 권한**이 필요합니다.

- Clerk 인증으로 로그인 필요
- 데이터베이스의 User 모델에서 `role = "ADMIN"`이어야 함
- 권한이 없는 경우 403 Forbidden 에러 반환

### 관리자 계정 확인

```bash
# 데이터베이스에서 관리자 확인
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true }
  });
  console.log('관리자 목록:', admins);
  await prisma.\$disconnect();
})()
"
```

## UI/UX 특징

### 반응형 디자인

- 모바일, 태블릿, 데스크톱에서 모두 최적화된 레이아웃
- Grid 레이아웃으로 카드 형식 표시
- 이미지와 정보가 적절히 배치

### 로딩 상태

- 페이지 로딩 시 스피너 표시
- 승인/거절 처리 중 버튼 비활성화
- 처리 중인 숙소는 모든 버튼 비활성화

### 사용자 피드백

- 승인/거절 시 확인 다이얼로그
- 성공 시 알림 메시지 표시
- 에러 시 에러 메시지 표시
- 처리 완료 후 목록에서 자동 제거

## 파일 구조

```
/src/app/admin/
├── page.tsx                                    # 관리자 대시보드 (승인 알림 배너 포함)
└── properties/
    └── pending/
        └── page.tsx                            # 숙소 승인 페이지

/src/app/api/admin/
└── properties/
    ├── route.ts                                # 숙소 목록 조회 API
    └── [id]/
        └── status/
            └── route.ts                        # 숙소 상태 변경 API

/src/lib/
└── notifications.ts                            # 알림 헬퍼 함수

/prisma/
├── schema.prisma                               # Property 및 Notification 모델
└── migrations/
    └── 20251103103719_add_property_notification_types/
        └── migration.sql                       # 알림 타입 추가 마이그레이션
```

## 검토 대기중인 숙소 확인

명령어로 현재 검토 대기중인 숙소를 확인할 수 있습니다:

```bash
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
(async () => {
  const pendingProperties = await prisma.property.findMany({
    where: { status: 'PENDING' },
    include: {
      host: {
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }
    }
  });
  console.log('검토 대기중인 숙소:', pendingProperties.length, '개');
  pendingProperties.forEach(p => {
    console.log('-', p.name, '(호스트:', p.host.user.name, ')');
  });
  await prisma.\$disconnect();
})()
"
```

## 문제 해결

### 관리자 권한이 없다는 에러

**증상**: "관리자 권한이 필요합니다" 메시지 표시

**해결방법**:
1. 데이터베이스에서 사용자의 role 확인:
```sql
SELECT id, email, role FROM "User" WHERE email = 'your@email.com';
```

2. role이 ADMIN이 아니면 업데이트:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 숙소 목록이 비어있는 경우

**증상**: "승인 대기중인 숙소가 없습니다" 메시지

**확인사항**:
1. 실제로 PENDING 상태의 숙소가 있는지 확인
2. API 응답을 브라우저 개발자 도구에서 확인
3. 서버 로그에서 에러 확인

### 알림이 전송되지 않는 경우

**증상**: 숙소는 승인/거절되지만 호스트가 알림을 받지 못함

**확인사항**:
1. 서버 로그에서 notification 관련 에러 확인
2. Notification 테이블에 레코드가 생성되었는지 확인:
```bash
npx prisma studio
# Notification 테이블 확인
```

3. 호스트의 userId가 올바른지 확인

## 테스트 가이드

### 수동 테스트 시나리오

1. **숙소 승인 테스트**:
   - PENDING 상태의 테스트 숙소 생성
   - 관리자로 로그인
   - `/admin/properties/pending` 접속
   - 숙소 승인 실행
   - 숙소 상태가 APPROVED로 변경되었는지 확인
   - 호스트가 알림을 받았는지 확인

2. **숙소 거절 테스트**:
   - PENDING 상태의 테스트 숙소 생성
   - 관리자로 로그인
   - 거절 사유 입력하여 거절 실행
   - 숙소 상태가 REJECTED로 변경되었는지 확인
   - 호스트가 거절 사유와 함께 알림을 받았는지 확인

3. **권한 테스트**:
   - 일반 사용자(non-admin)로 로그인
   - `/admin/properties/pending` 접속 시도
   - 403 에러 또는 리다이렉트 확인

## 추가 개선 사항 (향후)

- [ ] 이메일 알림 통합 (현재는 인앱 알림만)
- [ ] 승인/거절 이력 관리
- [ ] 일괄 승인/거절 기능
- [ ] 필터링 및 검색 기능
- [ ] 호스트에게 수정 요청 기능
- [ ] 승인 전 체크리스트 기능

## 관련 문서

- [호스트 로그인 가이드](./HOST_LOGIN_GUIDE.md)
- [자동 배포 가이드](./AUTO_DEPLOY_GUIDE.md)
- Architecture: `/docs/architecture/booking-system-architecture.md`
