#!/bin/bash

# Vercel Environment Variables Setup Script
# This script adds all required environment variables to Vercel

set -e

echo "🚀 Setting up Vercel Environment Variables..."
echo ""

# Read from .env and .env.local files
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

echo "📦 Adding DATABASE_URL..."
echo "$DATABASE_URL" | vercel env add DATABASE_URL production --yes 2>/dev/null || echo "  ⚠️  DATABASE_URL already exists or failed"

echo "📦 Adding Clerk variables..."
echo "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" | vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production --yes 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY already exists or failed"
echo "$CLERK_SECRET_KEY" | vercel env add CLERK_SECRET_KEY production --yes 2>/dev/null || echo "  ⚠️  CLERK_SECRET_KEY already exists or failed"
echo "/login" | vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production --yes 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_CLERK_SIGN_IN_URL already exists or failed"
echo "/signup" | vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production --yes 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_CLERK_SIGN_UP_URL already exists or failed"

echo "📦 Adding Toss Payments variables..."
echo "$NEXT_PUBLIC_TOSS_CLIENT_KEY" | vercel env add NEXT_PUBLIC_TOSS_CLIENT_KEY production --yes 2>/dev/null || echo "  ⚠️  NEXT_PUBLIC_TOSS_CLIENT_KEY already exists or failed"
echo "$TOSS_SECRET_KEY" | vercel env add TOSS_SECRET_KEY production --yes 2>/dev/null || echo "  ⚠️  TOSS_SECRET_KEY already exists or failed"

echo "📦 Adding optional variables..."
echo "$GEMINI_API_KEY" | vercel env add GEMINI_API_KEY production --yes 2>/dev/null || echo "  ⚠️  GEMINI_API_KEY already exists or failed"
echo "$KAKAO_CLIENT_ID" | vercel env add KAKAO_CLIENT_ID production --yes 2>/dev/null || echo "  ⚠️  KAKAO_CLIENT_ID already exists or failed"
echo "$KAKAO_CLIENT_SECRET" | vercel env add KAKAO_CLIENT_SECRET production --yes 2>/dev/null || echo "  ⚠️  KAKAO_CLIENT_SECRET already exists or failed"
echo "false" | vercel env add KAKAO_ALIMTALK_ENABLED production --yes 2>/dev/null || echo "  ⚠️  KAKAO_ALIMTALK_ENABLED already exists or failed"

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📋 Listing all environment variables:"
vercel env ls

echo ""
echo "🎯 Next step: Run 'vercel --prod --yes' to deploy"
