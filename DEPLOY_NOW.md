# 🚀 간단 배포 가이드 (기존 환경 사용)

## 현재 상황
- ✅ Supabase PostgreSQL 이미 연결됨
- ✅ Vercel 프로젝트 이미 생성됨  
- ✅ 로컬 빌드 성공

## 배포 2단계

### 1. Vercel 환경 변수 설정

[Vercel Dashboard](https://vercel.com/dashboard) > 프로젝트 > Settings > Environment Variables

아래 환경 변수를 **Production**과 **Preview**에 추가:

```bash
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.xfchchvhwciaiwefgjgsg:posdnjs!00@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.xfchchvhwciaiwefgjgsg:posdnjs!00@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xfchchvhwciaiwefgjgsg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmY2hjdmh3Y2lhaXdlZmpnanNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3Mzc5MjcsImV4cCI6MjA3ODMxMzkyN30.gfQFoqqBRowyI2FsR8Uu00Jt3cN2lofwleJ_J_-ctTI

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d29uZHJvdXMtc3BvbmdlLTIwLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_bdfLUP32iwMl8zL2oAPgmJvXCqKeZpz8X4Yey8zUla

# Toss Payments
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R

# Gemini AI
GEMINI_API_KEY=AIzaSyDMtwOnB77EYK9d_eaETnSSpC25Eiu7wa0

# Admin
ADMIN_PASSWORD_HASH=$2b$10$/2LriKXhyrDcDzRgC9TzeOmB5X2tY4AIUBvIeW4tH0eenTOcWVOte
JWT_SECRET=your-secret-key-change-this-in-production

# Kakao (선택사항)
KAKAO_ALIMTALK_ENABLED=false
```

### 2. Git Push

```bash
git add .
git commit -m "feat: Vercel 배포 설정 완료"
git push origin main
```

Vercel이 자동으로 빌드하고 배포합니다. 끝! 🎉
