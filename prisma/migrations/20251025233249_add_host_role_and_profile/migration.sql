-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'HOST_PENDING', 'HOST', 'ADMIN');

-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "HostProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessNumber" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "status" "HostStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "HostProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HostProfile_userId_key" ON "HostProfile"("userId");

-- AddForeignKey
ALTER TABLE "HostProfile" ADD CONSTRAINT "HostProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
