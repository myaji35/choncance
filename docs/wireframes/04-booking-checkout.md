# 와이어프레임 04: 예약 체크아웃 페이지

**페이지**: `/booking/checkout`
**설명**: 예약 정보 입력 및 결제를 진행하는 페이지
**사용자**: 로그인한 게스트 (인증 필수)

---

## 데스크톱 레이아웃 (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header: VINTEE Logo  [검색바]  [메뉴: 탐색 | 호스트 시작하기 | 프로필] │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  < 뒤로가기                예약 정보 입력                            │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────┬─────────────────────────────┐
│  예약 정보 입력 폼 (좌측 2/3)          │  예약 요약 (우측 1/3)        │
├───────────────────────────────────────┤  Sticky Position            │
│  1️⃣ 여행 일정                         │ ┌─────────────────────────┐ │
│  ┌─────────────────────────────────┐  │ │ 논뷰맛집 한옥 스테이     │ │
│  │ 체크인: 2026-03-01 (토)         │  │ │ [썸네일 이미지]          │ │
│  │ 체크아웃: 2026-03-02 (일)       │  │ │                         │ │
│  │ 게스트: 2명                     │  │ │ ─────────────────       │ │
│  │ [수정]                          │  │ │ 체크인: 2026-03-01      │ │
│  └─────────────────────────────────┘  │ │ 체크아웃: 2026-03-02    │ │
│                                        │ │ 게스트: 2명             │ │
│  2️⃣ 게스트 정보                       │ │                         │ │
│  ┌─────────────────────────────────┐  │ │ ─────────────────       │ │
│  │ 성명 (필수) *                   │  │ │ 요금 상세               │ │
│  │ [홍길동                       ] │  │ │ ₩50,000 x 1박           │ │
│  │                                 │  │ │ = ₩50,000               │ │
│  │ 이메일 (필수) *                 │  │ │                         │ │
│  │ [hong@example.com            ] │  │ │ 서비스 수수료 (5%)      │ │
│  │                                 │  │ │ = ₩2,500                │ │
│  │ 전화번호 (필수) *               │  │ │                         │ │
│  │ [010-1234-5678               ] │  │ │ ═════════════════       │ │
│  │                                 │  │ │ 총 결제 금액            │ │
│  │ 특별 요청 (선택)                │  │ │ ₩52,500                 │ │
│  │ [조용한 방 부탁드립니다       ] │  │ │                         │ │
│  │ [                             ] │  │ │ ─────────────────       │ │
│  │ [                             ] │  │ │ 환불 정책               │ │
│  └─────────────────────────────────┘  │ │ • 체크인 7일 전: 전액  │ │
│                                        │ │ • 체크인 3일 전: 50%   │ │
│  3️⃣ 경험 추가 (선택)                  │ │ • 체크인 당일: 환불 불가│ │
│  ┌─────────────────────────────────┐  │ │                         │ │
│  │ ☐ 아궁이 체험 (₩20,000)         │  │ └─────────────────────────┘ │
│  │   소요 시간: 2시간              │  │                           │
│  │                                 │  │                           │
│  │ ☐ 농사 체험 (₩15,000)          │  │                           │
│  │   소요 시간: 1.5시간            │  │                           │
│  │                                 │  │                           │
│  │ ☐ 불멍 세트 (₩10,000)          │  │                           │
│  │   장작 + 화로 포함              │  │                           │
│  └─────────────────────────────────┘  │                           │
│                                        │                           │
│  4️⃣ 결제 수단                         │                           │
│  ┌─────────────────────────────────┐  │                           │
│  │ ◉ 신용카드/체크카드             │  │                           │
│  │ ○ 계좌이체                      │  │                           │
│  │ ○ 간편결제 (카카오페이/네이버)  │  │                           │
│  └─────────────────────────────────┘  │                           │
│                                        │                           │
│  5️⃣ 약관 동의                         │                           │
│  ┌─────────────────────────────────┐  │                           │
│  │ ☐ 전체 동의                     │  │                           │
│  │                                 │  │                           │
│  │ ☐ 이용약관 동의 (필수) [보기]   │  │                           │
│  │ ☐ 개인정보 처리방침 동의 (필수) │  │                           │
│  │    [보기]                       │  │                           │
│  │ ☐ 환불 정책 동의 (필수) [보기]  │  │                           │
│  │ ☐ 마케팅 수신 동의 (선택)       │  │                           │
│  └─────────────────────────────────┘  │                           │
│                                        │                           │
│  ┌─────────────────────────────────┐  │                           │
│  │     [결제하기 - ₩52,500]        │  │                           │
│  └─────────────────────────────────┘  │                           │
│                                        │                           │
└───────────────────────────────────────┴─────────────────────────────┘
```

---

## 모바일 레이아웃 (< 768px)

```
┌───────────────────────────┐
│  < 뒤로  예약 정보 입력    │
└───────────────────────────┘

┌───────────────────────────┐
│  논뷰맛집 한옥 스테이      │
│  [썸네일]                 │
│  2026-03-01 ~ 03-02       │
│  게스트 2명               │
└───────────────────────────┘

┌───────────────────────────┐
│  1️⃣ 여행 일정             │
│  체크인: 2026-03-01 (토)  │
│  체크아웃: 2026-03-02 (일) │
│  게스트: 2명              │
│  [수정]                   │
└───────────────────────────┘

┌───────────────────────────┐
│  2️⃣ 게스트 정보           │
│  성명 *                   │
│  [홍길동              ]   │
│                           │
│  이메일 *                 │
│  [hong@example.com   ]    │
│                           │
│  전화번호 *               │
│  [010-1234-5678      ]    │
│                           │
│  특별 요청                │
│  [                   ]    │
└───────────────────────────┘

┌───────────────────────────┐
│  3️⃣ 경험 추가 (선택)      │
│  ☐ 아궁이 체험 ₩20,000    │
│  ☐ 농사 체험 ₩15,000      │
│  ☐ 불멍 세트 ₩10,000      │
└───────────────────────────┘

┌───────────────────────────┐
│  4️⃣ 결제 수단             │
│  ◉ 신용카드/체크카드      │
│  ○ 계좌이체               │
│  ○ 간편결제               │
└───────────────────────────┘

┌───────────────────────────┐
│  5️⃣ 약관 동의             │
│  ☐ 전체 동의              │
│  ☐ 이용약관 (필수) [보기] │
│  ☐ 개인정보 처리 (필수)   │
│  ☐ 환불 정책 (필수)       │
│  ☐ 마케팅 수신 (선택)     │
└───────────────────────────┘

┌───────────────────────────┐
│  요금 상세                │
│  1박 x ₩50,000            │
│  서비스 수수료: ₩2,500    │
│  ═════════════            │
│  총 금액: ₩52,500         │
└───────────────────────────┘

┌───────────────────────────┐
│  [결제하기 - ₩52,500]     │
└───────────────────────────┘
  ↑ 하단 고정 바
```

---

## 컴포넌트 구조

```tsx
// app/booking/checkout/page.tsx
<CheckoutPage>
  <CheckoutHeader /> {/* 뒤로가기 + 제목 */}

  <div className="grid lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2">
      <CheckoutForm onSubmit={handleCheckout}>
        <section>
          <h2>1️⃣ 여행 일정</h2>
          <BookingDateSummary
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onEdit={() => router.back()}
          />
        </section>

        <section>
          <h2>2️⃣ 게스트 정보</h2>
          <GuestInfoForm
            register={register}
            errors={errors}
          />
        </section>

        <section>
          <h2>3️⃣ 경험 추가 (선택)</h2>
          <ExperienceSelector
            experiences={property.experiences}
            selectedIds={selectedExperienceIds}
            onToggle={toggleExperience}
          />
        </section>

        <section>
          <h2>4️⃣ 결제 수단</h2>
          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onChange={setPaymentMethod}
          />
        </section>

        <section>
          <h2>5️⃣ 약관 동의</h2>
          <TermsAgreement
            register={register}
            errors={errors}
          />
        </section>

        <Button type="submit">
          결제하기 - ₩{totalPrice.toLocaleString()}
        </Button>
      </CheckoutForm>
    </div>

    <div className="lg:col-span-1">
      <BookingSummaryCard
        property={property}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        experiences={selectedExperiences}
        totalPrice={totalPrice}
      />
    </div>
  </div>
</CheckoutPage>
```

---

## UI 컴포넌트 명세

### 1. CheckoutForm

**역할**: 전체 체크아웃 폼 관리

**검증 (Zod 스키마)**:
```typescript
const CheckoutSchema = z.object({
  guestName: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  guestEmail: z.string().email("올바른 이메일을 입력해주세요"),
  guestPhone: z.string().regex(/^010-\d{4}-\d{4}$/, "전화번호 형식이 올바르지 않습니다"),
  specialRequests: z.string().optional(),
  experienceIds: z.array(z.string()).optional(),
  paymentMethod: z.enum(["CARD", "TRANSFER", "SIMPLE"]),
  agreeTerms: z.boolean().refine((val) => val === true, "이용약관에 동의해주세요"),
  agreePrivacy: z.boolean().refine((val) => val === true, "개인정보 처리방침에 동의해주세요"),
  agreeRefund: z.boolean().refine((val) => val === true, "환불 정책에 동의해주세요"),
  agreeMarketing: z.boolean().optional(),
});
```

**인터랙션**:
1. 폼 필드 입력 → 실시간 검증
2. 에러 시 → 필드 하단에 빨간색 에러 메시지
3. "결제하기" 버튼 클릭 → 전체 검증 → API 호출

---

### 2. BookingDateSummary

**역할**: 선택한 날짜 요약 + 수정 버튼

**표시 정보**:
- 체크인 날짜 (요일 포함)
- 체크아웃 날짜 (요일 포함)
- 게스트 수
- "수정" 버튼 → 이전 페이지 복귀

**Props**:
```tsx
interface BookingDateSummaryProps {
  checkIn: string; // ISO 8601
  checkOut: string;
  guests: number;
  onEdit: () => void;
}
```

---

### 3. GuestInfoForm

**역할**: 게스트 정보 입력 (react-hook-form)

**필드**:
- 성명 (필수, min 2자)
- 이메일 (필수, 이메일 형식)
- 전화번호 (필수, 010-XXXX-XXXX 형식)
- 특별 요청 (선택, textarea, max 500자)

**기본값**:
- Clerk 사용자 정보로 자동 입력 (name, email)
- 전화번호는 입력 필요 (Clerk에 없을 경우)

**Props**:
```tsx
interface GuestInfoFormProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}
```

---

### 4. ExperienceSelector

**역할**: 경험 프로그램 선택 (체크박스)

**각 경험 카드**:
```
┌────────────────────────────┐
│ ☐ 아궁이 체험 (₩20,000)    │
│   소요 시간: 2시간         │
│   전통 방식으로 불 피우기  │
└────────────────────────────┘
```

**인터랙션**:
- 체크박스 토글 → 가격 합산 (우측 요약 카드 업데이트)
- 최대 선택 제한 없음

**Props**:
```tsx
interface ExperienceSelectorProps {
  experiences: Experience[];
  selectedIds: string[];
  onToggle: (experienceId: string) => void;
}

interface Experience {
  id: string;
  name: string;
  price: number;
  duration: number; // 분
  description: string;
}
```

---

### 5. PaymentMethodSelector

**역할**: 결제 수단 선택 (라디오 버튼)

**옵션**:
- **신용카드/체크카드** (기본 선택)
- 계좌이체
- 간편결제 (카카오페이, 네이버페이 등)

**인터랙션**:
- 라디오 버튼 선택 → 결제 수단 변경
- 토스페이먼츠 SDK는 동일하게 사용 (method 파라미터만 변경)

**Props**:
```tsx
interface PaymentMethodSelectorProps {
  selectedMethod: "CARD" | "TRANSFER" | "SIMPLE";
  onChange: (method: string) => void;
}
```

---

### 6. TermsAgreement

**역할**: 약관 동의 체크박스

**구조**:
```
☐ 전체 동의 (마스터 체크박스)

☐ 이용약관 동의 (필수) [보기]
☐ 개인정보 처리방침 동의 (필수) [보기]
☐ 환불 정책 동의 (필수) [보기]
☐ 마케팅 수신 동의 (선택)
```

**인터랙션**:
- "전체 동의" 체크 → 모든 체크박스 ON
- "전체 동의" 체크 해제 → 모든 체크박스 OFF
- 개별 체크박스 변경 → "전체 동의" 상태 자동 업데이트
- "[보기]" 링크 → 모달 팝업 (약관 전문)

**Props**:
```tsx
interface TermsAgreementProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}
```

---

### 7. BookingSummaryCard

**역할**: 예약 요약 + 가격 계산 (Sticky)

**표시 정보**:
- 숙소 썸네일 + 이름
- 체크인/체크아웃 날짜
- 게스트 수
- 요금 상세 (숙박비 + 경험비 + 수수료)
- 환불 정책 요약

**가격 계산 로직**:
```typescript
const basePrice = property.pricePerNight * nights;
const experiencePrice = selectedExperiences.reduce((sum, exp) => sum + exp.price, 0);
const serviceFee = (basePrice + experiencePrice) * 0.05; // 5%
const totalPrice = basePrice + experiencePrice + serviceFee;
```

**Props**:
```tsx
interface BookingSummaryCardProps {
  property: {
    id: string;
    name: string;
    pricePerNight: number;
    images: string[];
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  experiences: Experience[];
  totalPrice: number;
}
```

---

## URL 구조 및 쿼리 파라미터

**URL**:
```
/booking/checkout?propertyId=xxx&checkIn=2026-03-01&checkOut=2026-03-02&guests=2
```

**쿼리 파라미터**:
- `propertyId` (필수): 숙소 ID
- `checkIn` (필수): 체크인 날짜 (YYYY-MM-DD)
- `checkOut` (필수): 체크아웃 날짜 (YYYY-MM-DD)
- `guests` (필수): 게스트 수

**검증**:
```typescript
// URL에서 파라미터 추출 + 검증
const searchParams = useSearchParams();
const propertyId = searchParams.get("propertyId");
const checkIn = searchParams.get("checkIn");
const checkOut = searchParams.get("checkOut");
const guests = parseInt(searchParams.get("guests") || "2");

if (!propertyId || !checkIn || !checkOut) {
  redirect("/explore"); // 필수 파라미터 없으면 리다이렉트
}
```

---

## API 호출 플로우

### 1. 페이지 로드 시

```typescript
// 숙소 정보 조회
const property = await fetch(`/api/properties/${propertyId}`).then(res => res.json());

// 가용성 재확인 (혹시 몰라)
const availability = await fetch(
  `/api/availability/check?propertyId=${propertyId}&checkIn=${checkIn}&checkOut=${checkOut}`
).then(res => res.json());

if (!availability.available) {
  // 가용하지 않으면 숙소 상세 페이지로 복귀
  router.push(`/property/${propertyId}`);
}
```

---

### 2. 폼 제출 시

```typescript
const handleCheckout = async (data: CheckoutFormData) => {
  try {
    // 1. 예약 생성 (PENDING 상태)
    const bookingResponse = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId,
        checkIn,
        checkOut,
        guestCount: guests,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        specialRequests: data.specialRequests,
        experienceIds: data.experienceIds,
        totalPrice,
      }),
    });

    const booking = await bookingResponse.json();

    // 2. 토스페이먼츠 결제 요청
    const tossPayments = await loadTossPayments(clientKey);
    await tossPayments.requestPayment(data.paymentMethod, {
      amount: totalPrice,
      orderId: `booking_${booking.id}`,
      orderName: `${property.name} 숙박`,
      successUrl: `${window.location.origin}/booking/success`,
      failUrl: `${window.location.origin}/booking/fail`,
      customerName: data.guestName,
      customerEmail: data.guestEmail,
    });

    // 성공 시 successUrl로 자동 리다이렉트
  } catch (error) {
    console.error("예약 생성 실패:", error);
    toast.error("예약 중 오류가 발생했습니다. 다시 시도해주세요.");
  }
};
```

---

## 접근성 (A11y)

- **키보드 네비게이션**:
  - Tab: 필드 간 이동
  - Space: 체크박스/라디오 버튼 토글
  - Enter: 버튼 활성화
- **스크린 리더**:
  - 필수 필드: `<label>성명 <span className="text-red-500">*</span></label>`
  - 에러 메시지: `aria-describedby="error-guestName"`
- **포커스 트랩**: 모달 열렸을 때 모달 내부로 포커스 제한
- **에러 스타일**: 빨간 테두리 + 빨간 텍스트 (충분한 대비)

---

## 에러 상태

1. **필수 필드 누락**:
   - 필드 하단에 빨간색 에러 메시지
   - "이름은 2자 이상이어야 합니다"

2. **결제 실패** (토스페이먼츠):
   - 리다이렉트 → `/booking/fail?code=...&message=...`

3. **예약 생성 실패** (API 500 에러):
   - 토스트 알림: "예약 중 오류가 발생했습니다."
   - "재시도" 버튼 표시

4. **가용성 없음** (동시 예약):
   - 모달 경고: "죄송합니다. 다른 게스트가 먼저 예약했습니다."
   - CTA: "다른 숙소 찾기" → `/explore`

---

## 로딩 상태

**"결제하기" 버튼 클릭 시**:
```tsx
<Button disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      결제 진행 중...
    </>
  ) : (
    `결제하기 - ₩${totalPrice.toLocaleString()}`
  )}
</Button>
```

---

**마지막 업데이트**: 2026-02-10
**작성자**: Claude Sonnet 4.5
