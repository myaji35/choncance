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
    "hostId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Property_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("address", "amenities", "createdAt", "description", "hostId", "id", "latitude", "location", "longitude", "maxGuests", "phone", "pricePerNight", "source", "status", "thumbnailUrl", "title", "updatedAt", "uploadedBy") SELECT "address", "amenities", "createdAt", "description", "hostId", "id", "latitude", "location", "longitude", "maxGuests", "phone", "pricePerNight", "source", "status", "thumbnailUrl", "title", "updatedAt", "uploadedBy" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
