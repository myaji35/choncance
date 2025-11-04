-- CreateEnum
CREATE TYPE "CreditType" AS ENUM ('EARNED_REVIEW_SNS', 'EARNED_REFERRAL', 'EARNED_EVENT', 'USED_BOOKING', 'USED_COUPON', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SNSPlatform" AS ENUM ('FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'THREADS');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'CREDIT_EARNED';

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "creditAwarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "snsShareConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "snsShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "snsSharedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "credits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalEarned" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "CreditHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "CreditType" NOT NULL,
    "description" TEXT,
    "reviewId" TEXT,
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SNSAccount" (
    "id" TEXT NOT NULL,
    "platform" "SNSPlatform" NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountUrl" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "followerCount" INTEGER,
    "lastPostAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SNSAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SNSPost" (
    "id" TEXT NOT NULL,
    "platform" "SNSPlatform" NOT NULL,
    "postUrl" TEXT NOT NULL,
    "postId" TEXT,
    "content" TEXT NOT NULL,
    "images" TEXT[],
    "reviewId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SNSPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditHistory_userId_idx" ON "CreditHistory"("userId");

-- CreateIndex
CREATE INDEX "CreditHistory_type_idx" ON "CreditHistory"("type");

-- CreateIndex
CREATE INDEX "CreditHistory_createdAt_idx" ON "CreditHistory"("createdAt");

-- CreateIndex
CREATE INDEX "SNSAccount_platform_idx" ON "SNSAccount"("platform");

-- CreateIndex
CREATE INDEX "SNSAccount_isActive_idx" ON "SNSAccount"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SNSAccount_platform_accountName_key" ON "SNSAccount"("platform", "accountName");

-- CreateIndex
CREATE INDEX "SNSPost_reviewId_idx" ON "SNSPost"("reviewId");

-- CreateIndex
CREATE INDEX "SNSPost_platform_idx" ON "SNSPost"("platform");

-- CreateIndex
CREATE INDEX "SNSPost_publishedAt_idx" ON "SNSPost"("publishedAt");

-- CreateIndex
CREATE INDEX "Review_snsShareConsent_idx" ON "Review"("snsShareConsent");

-- AddForeignKey
ALTER TABLE "CreditHistory" ADD CONSTRAINT "CreditHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
