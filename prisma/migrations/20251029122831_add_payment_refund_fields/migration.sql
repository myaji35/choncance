/*
  Warnings:

  - Added the required column `status` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PaymentTransaction" ADD COLUMN     "method" TEXT,
ADD COLUMN     "status" TEXT NOT NULL;
