# Payment System Implementation Summary

## Overview
This document summarizes the complete payment system implementation for ChonCance, including all features, APIs, components, and documentation created as part of Priority 3 enhancement work.

## Completed Features

### 1. Payment History Page
**Location**: `src/app/payments/page.tsx`

A comprehensive payment history page that displays all user payments with detailed information.

**Features**:
- Chronological list of all user payments
- Payment status badges (대기중, 완료, 취소/환불, 실패)
- Property and booking details
- Payment method display (카드, 가상계좌, 계좌이체, 휴대폰, 카카오페이, 토스)
- Transaction history with PAYMENT, REFUND, CANCEL types
- Quick links to booking details
- Receipt download button (UI ready, API implemented)

**Key Implementation Details**:
```typescript
// Fetches all payments for authenticated user
const payments = await prisma.payment.findMany({
  where: { booking: { userId } },
  include: {
    booking: { include: { property: true } },
    transactions: { orderBy: { createdAt: "desc" } },
  },
  orderBy: { createdAt: "desc" },
});
```

**Status Mapping**:
- READY → 대기중 (outline badge)
- IN_PROGRESS → 진행중 (outline badge)
- DONE → 완료 (default badge)
- CANCELLED → 취소/환불 (secondary badge)
- FAILED → 실패 (destructive badge)

---

### 2. Refund System
**API**: `src/app/api/payments/[id]/refund/route.ts`
**Component**: `src/components/payments/refund-dialog.tsx`

Complete refund workflow with Toss Payments integration and database transaction management.

**Features**:
- Refund reason input with validation
- Refund policy display (7일 전 전액, 3-6일 전 50%, 2일 전~ 불가)
- Full and partial refund support
- Toss Payments API integration
- Transaction record creation
- Booking status update for full refunds
- Error handling with user-friendly messages

**API Implementation**:
```typescript
// Toss Payments refund API call
const tossResponse = await fetch(
  `https://api.tosspayments.com/v1/payments/${payment.paymentKey}/cancel`,
  {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cancelReason: reason || "고객 요청",
      cancelAmount: Number(refundAmount),
    }),
  }
);

// Database transaction for atomicity
await prisma.$transaction(async (tx) => {
  // Update payment status
  // Create refund transaction record
  // Update booking status if full refund
});
```

**Security Features**:
- User authentication check
- Payment ownership verification
- Refundable status validation
- Amount validation (cannot exceed original payment)
- Production-only Toss API calls (dev mode skips external API)

---

### 3. Receipt Generation System
**API**: `src/app/api/payments/[id]/receipt/route.ts`

Generates detailed receipt data in JSON format for payment records.

**Receipt Data Structure**:
```typescript
{
  // Receipt metadata
  receiptNumber: "RC-{PAYMENT_ID_PREFIX}",
  issuedAt: "2025년 10월 30일 12:30",

  // Payment details
  payment: {
    id, amount, method, status,
    paidAt, tossPaymentKey
  },

  // Booking information
  booking: {
    id, checkIn, checkOut,
    guests, specialRequests
  },

  // Property details
  property: { name, address },

  // Host information
  host: { name },

  // Customer information
  customer: { name, email },

  // Transaction history
  transactions: [
    { type, amount, status, createdAt }
  ]
}
```

**Use Cases**:
- Download receipts as PDF (frontend implementation needed)
- Email receipts to customers
- Tax documentation
- Accounting records

---

### 4. Email Notification System
**Utility**: `src/lib/email/send-email.ts`
**Templates**: `src/lib/email/templates.ts`

Flexible email system supporting multiple providers with professional HTML templates.

**Supported Email Providers**:
1. **SendGrid** (recommended for production)
2. **Resend** (modern alternative)
3. **Nodemailer** (SMTP-based)

**Email Templates**:

#### Booking Confirmation Email
```typescript
getBookingConfirmationEmail({
  propertyName, checkIn, checkOut,
  guests, totalAmount, bookingId
})
```
- Professional HTML layout
- Booking details with dates and guest count
- Payment information
- View booking button with link
- Contact information

#### Payment Refund Email
```typescript
getPaymentRefundEmail({
  propertyName, refundAmount,
  refundReason, bookingId
})
```
- Refund confirmation message
- Refund amount and reason
- Processing timeline (3-5 business days)
- Contact support information

#### Payment Failure Email
```typescript
getPaymentFailureEmail({
  propertyName, amount,
  failureReason, bookingId
})
```
- Failure notification
- Reason for failure
- Retry instructions
- Alternative payment method suggestions

**Environment Configuration**:
```bash
# Choose email provider
EMAIL_SERVICE=sendgrid  # or 'resend' or 'nodemailer'

# SendGrid
SENDGRID_API_KEY=your_api_key

# Resend
RESEND_API_KEY=your_api_key

# Nodemailer (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Sender information
EMAIL_FROM=noreply@choncance.com
EMAIL_FROM_NAME=ChonCance
```

**Usage Example**:
```typescript
import { sendEmail } from "@/lib/email/send-email";
import { getBookingConfirmationEmail } from "@/lib/email/templates";

const emailContent = getBookingConfirmationEmail({
  propertyName: "제주 한옥 스테이",
  checkIn: "2025년 11월 15일",
  checkOut: "2025년 11월 17일",
  guests: 2,
  totalAmount: 200000,
  bookingId: "booking_123",
});

await sendEmail({
  to: user.email,
  subject: emailContent.subject,
  html: emailContent.html,
});
```

---

### 5. Production Setup Documentation
**Document**: `TOSS_PAYMENTS_PRODUCTION_GUIDE.md`

Comprehensive guide for deploying payment system to production.

**Contents**:
- **Step 1**: Merchant application process
  - Required documents (business registration, bank account, ID)
  - Application review timeline
  - Account activation

- **Step 2**: Production key retrieval
  - Dashboard navigation
  - API key management
  - Key rotation procedures

- **Step 3**: Environment variable setup
  - Local development configuration
  - GCP Secret Manager integration
  - Cloud Run environment variables

- **Step 4**: Testing checklist
  - Small amount test (₩100-₩1,000)
  - Refund scenario testing
  - Payment failure handling
  - Webhook verification

- **Step 5**: Monitoring and alerts
  - Toss Payments dashboard
  - Webhook event monitoring
  - Error tracking setup

- **Step 6**: Settlement configuration
  - D+7 settlement cycle (default)
  - Fee structure (2.9% + VAT)
  - Bank account verification
  - Settlement schedule monitoring

- **Step 7**: Security hardening
  - Secret Key protection (never commit to git)
  - Request signature validation
  - IP whitelist configuration
  - Rate limiting implementation

**Support Contacts**:
- Customer Support: support@tosspayments.com
- Technical Support: dev@tosspayments.com
- Emergency Hotline: 1661-5114

---

## Database Schema

### Payment Model
```prisma
model Payment {
  id            String              @id @default(cuid())
  bookingId     String              @unique
  booking       Booking             @relation(fields: [bookingId], references: [id])

  // Payment details
  amount        Decimal             @db.Decimal(10, 2)
  paymentMethod String?
  status        PaymentStatus       @default(READY)

  // Toss Payments data
  paymentKey    String?             @unique
  orderId       String?             @unique

  // Timestamps
  requestedAt   DateTime            @default(now())
  approvedAt    DateTime?
  cancelledAt   DateTime?
  refundedAt    DateTime?

  // Relations
  transactions  PaymentTransaction[]

  @@index([bookingId])
  @@index([status])
  @@index([requestedAt])
}

enum PaymentStatus {
  READY        // 결제 대기
  IN_PROGRESS  // 결제 진행중
  DONE         // 결제 완료
  CANCELLED    // 취소/환불
  FAILED       // 결제 실패
}
```

### PaymentTransaction Model
```prisma
model PaymentTransaction {
  id        String   @id @default(cuid())
  paymentId String
  payment   Payment  @relation(fields: [paymentId], references: [id])

  type      TransactionType  // PAYMENT, REFUND, CANCEL
  amount    Decimal          @db.Decimal(10, 2)
  status    String           // SUCCESS, FAILED, PENDING

  metadata  Json?            // Additional transaction data
  createdAt DateTime         @default(now())

  @@index([paymentId])
  @@index([createdAt])
}

enum TransactionType {
  PAYMENT
  REFUND
  CANCEL
}
```

---

## API Endpoints

### GET /api/payments
**Status**: Not implemented (would return user's payment history API)

### GET /api/payments/:id
**Status**: Not implemented (would return single payment details)

### POST /api/payments/:id/refund
**Status**: ✅ Implemented
**Request Body**:
```json
{
  "reason": "고객 요청으로 인한 환불",
  "cancelAmount": 100000
}
```
**Response**:
```json
{
  "success": true,
  "refund": {
    "paymentId": "pay_xxx",
    "refundAmount": 100000,
    "status": "CANCELLED",
    "transactionId": "txn_xxx"
  }
}
```

### GET /api/payments/:id/receipt
**Status**: ✅ Implemented
**Response**: Receipt data object (see Receipt Generation System section)

### POST /api/payments/confirm
**Status**: ✅ Implemented (in booking checkout flow)
**Request Body**:
```json
{
  "paymentKey": "pay_xxx",
  "orderId": "order_xxx",
  "amount": 100000
}
```

---

## Integration Points

### 1. Booking Detail Page
**File**: `src/app/bookings/[id]/page.tsx`

Add RefundDialog component to allow refund requests:
```tsx
import { RefundDialog } from "@/components/payments/refund-dialog";

// In the booking detail page
{booking.payment?.status === "DONE" && (
  <RefundDialog
    paymentId={booking.payment.id}
    amount={Number(booking.payment.amount)}
  />
)}
```

### 2. Payment History Navigation
Add link to payments page in user profile menu:
```tsx
<Link href="/payments">결제 내역</Link>
```

### 3. Receipt Download
**Current**: Button shows "준비 중입니다" alert
**TODO**: Implement PDF generation
```tsx
// Suggested library: react-pdf or puppeteer
import { pdf } from '@react-pdf/renderer';
import ReceiptPDF from '@/components/receipts/receipt-pdf';

const handleDownload = async () => {
  const response = await fetch(`/api/payments/${paymentId}/receipt`);
  const data = await response.json();

  const blob = await pdf(<ReceiptPDF data={data} />).toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `receipt-${data.receiptNumber}.pdf`;
  link.click();
};
```

### 4. Email Notifications Integration
Add email sending to relevant API routes:

**After booking confirmation** (`src/app/api/payments/confirm/route.ts`):
```typescript
import { sendEmail } from "@/lib/email/send-email";
import { getBookingConfirmationEmail } from "@/lib/email/templates";

// After successful payment confirmation
const emailContent = getBookingConfirmationEmail({ /* booking data */ });
await sendEmail({
  to: user.email,
  subject: emailContent.subject,
  html: emailContent.html,
});
```

**After refund** (`src/app/api/payments/[id]/refund/route.ts`):
```typescript
// Already marked as TODO in the route
const emailContent = getPaymentRefundEmail({ /* refund data */ });
await sendEmail({
  to: user.email,
  subject: emailContent.subject,
  html: emailContent.html,
});
```

---

## Testing Checklist

### Local Development Testing
- [ ] View payment history page at `/payments`
- [ ] Check payment status badges display correctly
- [ ] Test refund dialog opens and accepts input
- [ ] Verify refund policy is displayed
- [ ] Test receipt API returns correct data structure
- [ ] Verify email templates render correctly (console logs in dev mode)

### Production Testing (After Toss Payments setup)
- [ ] Complete small test payment (₩100-₩1,000)
- [ ] Verify payment appears in Toss dashboard
- [ ] Test full refund flow
- [ ] Test partial refund (if applicable)
- [ ] Verify refund appears in Toss dashboard
- [ ] Check settlement account receives test payment
- [ ] Test payment failure scenarios
- [ ] Verify webhook events are received (if configured)

### User Experience Testing
- [ ] Mobile responsive design on payment history page
- [ ] Refund dialog works on mobile devices
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly and in Korean
- [ ] Date formatting is correct (Korean locale)
- [ ] Currency formatting displays correctly (원)

---

## Security Considerations

### Environment Variables
**Never commit these to git**:
- `TOSS_SECRET_KEY` (production key)
- `EMAIL_SERVICE` API keys (SendGrid, Resend)
- `SMTP_PASSWORD` (if using Nodemailer)

### Production Security
1. **Secret Key Protection**
   - Store in GCP Secret Manager
   - Rotate keys periodically
   - Use different keys for dev/staging/prod

2. **Request Validation**
   - Verify payment amounts match
   - Validate user ownership of payments
   - Check payment status before refunds
   - Sanitize user input (refund reasons)

3. **Rate Limiting**
   - Implement rate limiting on refund endpoint
   - Prevent abuse of receipt generation
   - Monitor for suspicious patterns

4. **Webhook Security**
   - Validate Toss Payments webhook signatures
   - Use HTTPS for webhook endpoints
   - Verify webhook source IP

---

## Future Enhancements

### Short-term (1-2 weeks)
1. **PDF Receipt Generation**
   - Implement react-pdf or puppeteer
   - Design professional receipt template
   - Add download functionality

2. **Email Notifications**
   - Set up SendGrid account
   - Integrate email sending into payment flows
   - Add email preferences to user settings

3. **Partial Refund UI**
   - Allow users to request partial refunds
   - Calculate refund amount based on policy
   - Display refund calculation breakdown

### Medium-term (1-2 months)
1. **Payment Analytics**
   - Dashboard for hosts to view earnings
   - Revenue charts and statistics
   - Settlement history tracking

2. **Multiple Payment Methods**
   - Add virtual account support
   - Integrate Kakao Pay, Toss Pay
   - Support international payment methods

3. **Automated Refund Policy**
   - Calculate refund percentage based on check-in date
   - Enforce policy rules in refund API
   - Display policy-compliant refund amounts

### Long-term (3+ months)
1. **Subscription Payments**
   - Host premium memberships
   - Featured listing payments
   - Recurring revenue tracking

2. **Escrow System**
   - Hold payment until check-in
   - Automatic release to host
   - Dispute resolution workflow

3. **Multi-currency Support**
   - USD, JPY, CNY support for international guests
   - Currency conversion API integration
   - Exchange rate display

---

## Support and Troubleshooting

### Common Issues

#### Issue: Refund fails with "Payment is not in a refundable state"
**Solution**: Check payment status is "DONE" before attempting refund

#### Issue: Email not sending in production
**Solution**:
1. Verify EMAIL_SERVICE environment variable is set
2. Check API key is valid and not expired
3. Ensure EMAIL_FROM is verified in email provider dashboard

#### Issue: Receipt API returns 404
**Solution**: Ensure payment ID exists and user has permission to access it

#### Issue: Toss Payments API returns 401 Unauthorized
**Solution**:
1. Verify TOSS_SECRET_KEY is correct
2. Check API key hasn't been rotated
3. Ensure Base64 encoding of key is correct

### Getting Help
- **Internal**: Check TOSS_PAYMENTS_PRODUCTION_GUIDE.md
- **Toss Payments**: dev@tosspayments.com or 1661-5114
- **SendGrid Support**: https://support.sendgrid.com
- **GitHub Issues**: Create issue with "payment" label

---

## Conclusion

The payment system enhancement (Priority 3) is now complete with:
- ✅ Payment history page with full transaction details
- ✅ Refund system with Toss Payments integration
- ✅ Receipt generation API
- ✅ Email notification system (infrastructure ready)
- ✅ Production deployment documentation

**Next Steps**:
1. Set up Toss Payments production merchant account
2. Configure email service provider (SendGrid recommended)
3. Test payment flows in staging environment
4. Implement PDF receipt generation
5. Integrate email notifications into payment workflows

For questions or issues, refer to this document and TOSS_PAYMENTS_PRODUCTION_GUIDE.md.
