#!/bin/bash

# Vercel 환경 변수 설정 스크립트
# 사용법: ./scripts/setup-vercel-env.sh

echo "======================================"
echo "VINTEE Vercel 환경 변수 설정 가이드"
echo "======================================"
echo ""

# GCP PostgreSQL 정보 입력
echo "1. GCP Cloud SQL 정보를 입력하세요:"
echo ""
read -p "PostgreSQL Host (IP 주소): " GCP_HOST
read -p "PostgreSQL User (기본값: postgres): " GCP_USER
GCP_USER=${GCP_USER:-postgres}
read -sp "PostgreSQL Password: " GCP_PASSWORD
echo ""
read -p "Database Name (기본값: vintee): " GCP_DATABASE
GCP_DATABASE=${GCP_DATABASE:-vintee}
read -p "PostgreSQL Port (기본값: 5432): " GCP_PORT
GCP_PORT=${GCP_PORT:-5432}

echo ""
echo "2. 생성된 DATABASE_URL:"
DATABASE_URL="postgresql://${GCP_USER}:${GCP_PASSWORD}@${GCP_HOST}:${GCP_PORT}/${GCP_DATABASE}?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://${GCP_USER}:${GCP_PASSWORD}@${GCP_HOST}:${GCP_PORT}/${GCP_DATABASE}"

echo ""
echo "DATABASE_URL=${DATABASE_URL}"
echo "DIRECT_URL=${DIRECT_URL}"
echo ""

# Vercel CLI 설치 확인
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI가 설치되어 있지 않습니다."
    echo "다음 명령어로 설치하세요: npm i -g vercel"
    echo ""
    echo "또는 Vercel Dashboard에서 수동으로 설정하세요:"
    echo "https://vercel.com/dashboard > 프로젝트 > Settings > Environment Variables"
    echo ""

    # .env.production 파일 생성
    echo "3. .env.production 파일을 생성합니다..."
    cat > .env.production << EOF
# GCP PostgreSQL
DATABASE_URL="${DATABASE_URL}"
DIRECT_URL="${DIRECT_URL}"

# Clerk Authentication (프로덕션 키로 변경 필요)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_d29uZHJvdXMtc3BvbmdlLTIwLmNsZXJrLmFjY291bnRzLmRldiQ"
CLERK_SECRET_KEY="sk_test_bdfLUP32iwMl8zL2oAPgmJvXCqKeZpz8X4Yey8zUla"

# Toss Payments (프로덕션 키로 변경 필요)
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq"
TOSS_SECRET_KEY="test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R"

# Google Gemini AI
GEMINI_API_KEY="AIzaSyDMtwOnB77EYK9d_eaETnSSpC25Eiu7wa0"

# Admin Authentication
ADMIN_PASSWORD_HASH="\$2b\$10\$/2LriKXhyrDcDzRgC9TzeOmB5X2tY4AIUBvIeW4tH0eenTOcWVOte"
JWT_SECRET="CHANGE_THIS_TO_STRONG_RANDOM_STRING_FOR_PRODUCTION"
EOF

    echo "✅ .env.production 파일이 생성되었습니다."
    echo ""
    echo "다음 단계:"
    echo "1. Vercel Dashboard에서 환경 변수를 수동으로 설정하세요"
    echo "2. 또는 .env.production 파일 내용을 참고하세요"
    exit 0
fi

# Vercel CLI로 환경 변수 설정
echo "3. Vercel CLI로 환경 변수를 설정하시겠습니까? (y/n)"
read -p "입력: " SETUP_VERCEL

if [ "$SETUP_VERCEL" = "y" ] || [ "$SETUP_VERCEL" = "Y" ]; then
    echo ""
    echo "Vercel 환경 변수 설정 중..."

    # Production과 Preview에 동시 설정
    vercel env add DATABASE_URL production preview <<< "${DATABASE_URL}"
    vercel env add DIRECT_URL production preview <<< "${DIRECT_URL}"

    echo "✅ DATABASE_URL과 DIRECT_URL이 설정되었습니다."
    echo ""
    echo "나머지 환경 변수는 Vercel Dashboard에서 수동으로 설정하세요:"
    echo "- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    echo "- CLERK_SECRET_KEY"
    echo "- NEXT_PUBLIC_TOSS_CLIENT_KEY"
    echo "- TOSS_SECRET_KEY"
    echo "- GEMINI_API_KEY"
    echo "- ADMIN_PASSWORD_HASH"
    echo "- JWT_SECRET"
else
    echo ""
    echo "Vercel Dashboard에서 수동으로 환경 변수를 설정하세요:"
    echo "https://vercel.com/dashboard > 프로젝트 > Settings > Environment Variables"
fi

echo ""
echo "======================================"
echo "다음 단계:"
echo "1. Vercel에 환경 변수 설정 완료"
echo "2. 로컬에서 GCP DB 연결 테스트: npx prisma db push"
echo "3. 마이그레이션 실행: npx prisma migrate deploy"
echo "4. 시드 데이터 입력: npm run seed && npm run seed:properties"
echo "5. Git push로 배포: git push origin main"
echo "======================================"
