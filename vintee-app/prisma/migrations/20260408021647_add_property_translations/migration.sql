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
    "images" TEXT NOT NULL DEFAULT '[]',
    "pricePerNight" INTEGER,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'trial',
    "subscriptionUntil" DATETIME,
    "translations" TEXT NOT NULL DEFAULT '{}',
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
INSERT INTO "new_Property" ("address", "amenities", "bestSeason", "checkinTime", "checkoutTime", "createdAt", "description", "highlights", "hostId", "hostIntro", "id", "images", "latitude", "location", "longitude", "maxGuests", "nearbyAttractions", "numberOfRooms", "petsAllowed", "phone", "pricePerNight", "regionId", "source", "status", "subscriptionPlan", "subscriptionUntil", "thumbnailUrl", "title", "uniqueExperience", "updatedAt", "uploadedBy") SELECT "address", "amenities", "bestSeason", "checkinTime", "checkoutTime", "createdAt", "description", "highlights", "hostId", "hostIntro", "id", "images", "latitude", "location", "longitude", "maxGuests", "nearbyAttractions", "numberOfRooms", "petsAllowed", "phone", "pricePerNight", "regionId", "source", "status", "subscriptionPlan", "subscriptionUntil", "thumbnailUrl", "title", "uniqueExperience", "updatedAt", "uploadedBy" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
