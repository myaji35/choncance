#!/bin/bash

# ChonCance Google Cloud Run 배포 스크립트 (소스 기반)
set -e

echo "🚀 ChonCance Google Cloud Run 배포 시작 (소스 기반)..."

# 프로젝트 ID 확인
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo "❌ 에러: Google Cloud 프로젝트가 설정되지 않았습니다."
  echo "다음 명령어로 프로젝트를 설정하세요:"
  echo "gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "📦 프로젝트 ID: $PROJECT_ID"

# 리전 설정
REGION="asia-northeast3"
SERVICE_NAME="choncance"

echo "☁️  Cloud Build로 빌드 및 배포 중..."
echo "   (GitHub에서 소스를 가져와 GCP에서 빌드합니다)"

gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXRoaWNhbC1zd2lmdC0xLmNsZXJrLmFjY291bnRzLmRldiQ,CLERK_SECRET_KEY=sk_test_QGq3SR7xnY2fjnzeZhVVhUqOovPKfPgzYurXtJqfNV,NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login,NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup,DATABASE_URL=postgresql://neondb_owner:npg_d9OoK2qQlTXH@ep-proud-fog-a100b0a9-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

echo "✅ 배포 완료!"

# 서비스 URL 가져오기
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo ""
echo "🌐 서비스 URL: $SERVICE_URL"
echo ""
echo "🧪 배포 테스트:"
echo "curl $SERVICE_URL"
