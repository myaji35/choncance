# Payment System Quick Reference

## Quick Links
- **Payment History**: http://localhost:3010/payments
- **Production Guide**: TOSS_PAYMENTS_PRODUCTION_GUIDE.md
- **Full Documentation**: PAYMENT_SYSTEM_SUMMARY.md

## Key Files

### Pages
```
src/app/payments/page.tsx                    # Payment history page
```

### API Routes
```
src/app/api/payments/[id]/refund/route.ts    # POST refund request
src/app/api/payments/[id]/receipt/route.ts   # GET receipt data
```

### Components
```
src/components/payments/refund-dialog.tsx    # Refund request dialog
```

### Email System
```
src/lib/email/send-email.ts                  # Email utility (SendGrid/Resend/Nodemailer)
src/lib/email/templates.ts                   # Email HTML templates
```

## Environment Variables

### Toss Payments
```bash
TOSS_CLIENT_KEY=test_ck_*****              # Client key (public, for frontend)
TOSS_SECRET_KEY=test_sk_*****              # Secret key (private, for backend)
```

### Email (Choose one)
```bash
# Option 1: SendGrid (Recommended)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.*****

# Option 2: Resend
EMAIL_SERVICE=resend
RESEND_API_KEY=re_*****

# Option 3: Nodemailer (SMTP)
EMAIL_SERVICE=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Common
EMAIL_FROM=noreply@choncance.com
EMAIL_FROM_NAME=ChonCance
```

## API Endpoints

### Refund Request
```bash
POST /api/payments/:id/refund
Content-Type: application/json

{
  "reason": "고객 요청으로 인한 환불",
  "cancelAmount": 100000
}

# Response
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

### Receipt Data
```bash
GET /api/payments/:id/receipt

# Response
{
  "receiptNumber": "RC-ABC12345",
  "issuedAt": "2025년 10월 30일 12:30",
  "payment": { ... },
  "booking": { ... },
  "property": { ... },
  "host": { ... },
  "customer": { ... },
  "transactions": [ ... ]
}
```

## Payment Status Enum

```typescript
enum PaymentStatus {
  READY        // 결제 대기
  IN_PROGRESS  // 결제 진행중
  DONE         // 결제 완료
  CANCELLED    // 취소/환불
  FAILED       // 결제 실패
}
```

## Common Tasks

### Add Refund Button to Page
```tsx
import { RefundDialog } from "@/components/payments/refund-dialog";

<RefundDialog
  paymentId={payment.id}
  amount={Number(payment.amount)}
/>
```

### Send Email Notification
```tsx
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

### Check Payment Status
```typescript
const payment = await prisma.payment.findUnique({
  where: { id: paymentId },
  include: {
    booking: true,
    transactions: true,
  },
});

if (payment.status === "DONE") {
  // Payment is complete, allow refund
}

if (payment.status === "CANCELLED") {
  // Already refunded
}
```

## Testing Commands

### Local Development
```bash
# Start server
npm run dev

# Visit payment history
open http://localhost:3010/payments

# Build project
npm run build
```

### Production Setup
```bash
# Set GCP project
gcloud config set project YOUR_PROJECT_ID

# Update Secret Manager
gcloud secrets versions add toss-secret-key --data-file=- <<< "your_production_key"

# Deploy to Cloud Run
gcloud run deploy choncance \
  --source . \
  --region asia-northeast3 \
  --allow-unauthenticated
```

## Troubleshooting

### Refund fails with "Payment is not in a refundable state"
**Fix**: Ensure payment.status === "DONE" before attempting refund

### Email not sending
**Fix**:
1. Check EMAIL_SERVICE environment variable
2. Verify API key is valid
3. Ensure EMAIL_FROM is verified in provider dashboard

### Toss API returns 401
**Fix**:
1. Verify TOSS_SECRET_KEY is correct
2. Check Base64 encoding: `Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64")`

### Receipt API returns 404
**Fix**: Ensure payment exists and user has permission

## Support Contacts

### Toss Payments
- Email: dev@tosspayments.com
- Phone: 1661-5114
- Docs: https://docs.tosspayments.com

### SendGrid
- Support: https://support.sendgrid.com
- Docs: https://docs.sendgrid.com

### Internal
- Full Docs: PAYMENT_SYSTEM_SUMMARY.md
- Production Guide: TOSS_PAYMENTS_PRODUCTION_GUIDE.md
- Improvement Plan: IMPROVEMENT_PLAN.md

## Next Steps

1. ✅ Payment history page - DONE
2. ✅ Refund system - DONE
3. ✅ Receipt API - DONE
4. ✅ Email infrastructure - DONE
5. ⏳ Set up Toss Payments production account
6. ⏳ Configure SendGrid for email notifications
7. ⏳ Implement PDF receipt generation
8. ⏳ Add email notifications to payment workflows

---

Last Updated: 2025-10-30
Version: 1.0.0
