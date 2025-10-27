-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "allowsPets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "province" TEXT;

-- CreateIndex
CREATE INDEX "Property_province_idx" ON "Property"("province");

-- CreateIndex
CREATE INDEX "Property_city_idx" ON "Property"("city");

-- CreateIndex
CREATE INDEX "Property_pricePerNight_idx" ON "Property"("pricePerNight");

-- CreateIndex
CREATE INDEX "Property_maxGuests_idx" ON "Property"("maxGuests");
