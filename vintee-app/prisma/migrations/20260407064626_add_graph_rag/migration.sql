-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "embedding" BLOB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PropertyTag" (
    "propertyId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "score" REAL NOT NULL DEFAULT 1.0,
    "source" TEXT NOT NULL DEFAULT 'manual',

    PRIMARY KEY ("propertyId", "tagId"),
    CONSTRAINT "PropertyTag_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PropertyTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewTag" (
    "reviewId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL DEFAULT 'neutral',

    PRIMARY KEY ("reviewId", "tagId"),
    CONSTRAINT "ReviewTag_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    CONSTRAINT "Region_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PropertyAttraction" (
    "propertyId" TEXT NOT NULL,
    "attractionId" TEXT NOT NULL,
    "distanceKm" REAL NOT NULL,
    "travelTime" TEXT,

    PRIMARY KEY ("propertyId", "attractionId"),
    CONSTRAINT "PropertyAttraction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PropertyAttraction_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "phone" TEXT,
    "thumbnailUrl" TEXT,
    "pricePerNight" INTEGER,
    "maxGuests" INTEGER NOT NULL DEFAULT 4,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "source" TEXT NOT NULL DEFAULT 'direct',
    "uploadedBy" TEXT,
    "checkinTime" TEXT,
    "checkoutTime" TEXT,
    "highlights" TEXT NOT NULL DEFAULT '[]',
    "nearbyAttractions" TEXT NOT NULL DEFAULT '[]',
    "bestSeason" TEXT,
    "hostIntro" TEXT,
    "uniqueExperience" TEXT,
    "petsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "numberOfRooms" INTEGER NOT NULL DEFAULT 1,
    "regionId" TEXT,
    "hostId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Property_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Property_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("address", "amenities", "bestSeason", "checkinTime", "checkoutTime", "createdAt", "description", "highlights", "hostId", "hostIntro", "id", "latitude", "location", "longitude", "maxGuests", "nearbyAttractions", "numberOfRooms", "petsAllowed", "phone", "pricePerNight", "source", "status", "thumbnailUrl", "title", "uniqueExperience", "updatedAt", "uploadedBy") SELECT "address", "amenities", "bestSeason", "checkinTime", "checkoutTime", "createdAt", "description", "highlights", "hostId", "hostIntro", "id", "latitude", "location", "longitude", "maxGuests", "nearbyAttractions", "numberOfRooms", "petsAllowed", "phone", "pricePerNight", "source", "status", "thumbnailUrl", "title", "uniqueExperience", "updatedAt", "uploadedBy" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "Tag_type_idx" ON "Tag"("type");

-- CreateIndex
CREATE INDEX "PropertyTag_tagId_idx" ON "PropertyTag"("tagId");

-- CreateIndex
CREATE INDEX "ReviewTag_tagId_idx" ON "ReviewTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE INDEX "Region_parentId_idx" ON "Region"("parentId");

-- CreateIndex
CREATE INDEX "PropertyAttraction_attractionId_idx" ON "PropertyAttraction"("attractionId");
