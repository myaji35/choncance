-- CreateEnum
CREATE TYPE "TagCategory" AS ENUM ('VIEW', 'ACTIVITY', 'FACILITY', 'VIBE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'INACTIVE');

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "TagCategory" NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "pricePerNight" DECIMAL(10,2) NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "images" TEXT[],
    "thumbnailUrl" TEXT,
    "hostStory" TEXT,
    "amenities" TEXT[],
    "rules" TEXT,
    "checkInTime" TEXT NOT NULL DEFAULT '15:00',
    "checkOutTime" TEXT NOT NULL DEFAULT '11:00',
    "minNights" INTEGER NOT NULL DEFAULT 1,
    "maxNights" INTEGER NOT NULL DEFAULT 30,
    "status" "PropertyStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "images" TEXT[],
    "availableDays" INTEGER[],
    "availableTimes" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PropertyToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PropertyToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "_PropertyToTag_B_index" ON "_PropertyToTag"("B");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "HostProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "HostProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToTag" ADD CONSTRAINT "_PropertyToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PropertyToTag" ADD CONSTRAINT "_PropertyToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
