#!/bin/bash
# 빠른 배포 스크립트 (로컬 Docker 빌드 사용)
set -e

PROJECT_ID="dauntless-gate-476607-b7"
REGION="asia-northeast3"
SERVICE_NAME="choncance"
IMAGE_NAME="asia-northeast3-docker.pkg.dev/$PROJECT_ID/choncance-repo/choncance:latest"

echo "🚀 ChonCance 빠른 배포 시작..."
echo "📦 프로젝트: $PROJECT_ID"

# 1. Docker 이미지 로컬 빌드 (캐시 활용)
echo "🔨 Docker 이미지 빌드 중..."
docker build -t $IMAGE_NAME . --platform linux/amd64

# 2. GCP Artifact Registry에 푸시
echo "☁️  이미지 푸시 중..."
docker push $IMAGE_NAME

# 3. Cloud Run에 배포 (이미지 직접 사용)
echo "🚀 Cloud Run 배포 중..."
INSTANCE_CONNECTION_NAME=$(gcloud sql instances describe choncance-db --format='value(connectionName)')

gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --add-cloudsql-instances=$INSTANCE_CONNECTION_NAME \
  --update-env-vars="NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXRoaWNhbC1zd2lmdC0xLmNsZXJrLmFjY291bnRzLmRldiQ,CLERK_SECRET_KEY=sk_test_QGq3SR7xnY2fjnzeZhVVhUqOovPKfPgzYurXtJqfNV,NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login,NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup,NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq,TOSS_SECRET_KEY=test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R,GCP_STORAGE_BUCKET=choncance-images,DATABASE_URL=postgresql://postgres:socdnjs!00@localhost/choncance?host=/cloudsql/$INSTANCE_CONNECTION_NAME" \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

echo "✅ 배포 완료!"

SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')
echo ""
echo "🌐 서비스 URL: $SERVICE_URL"
