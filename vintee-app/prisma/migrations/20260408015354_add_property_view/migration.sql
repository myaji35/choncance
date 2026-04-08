-- CreateTable
CREATE TABLE "PropertyView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "anonId" TEXT,
    "viewedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "PropertyView_propertyId_viewedAt_idx" ON "PropertyView"("propertyId", "viewedAt");

-- CreateIndex
CREATE INDEX "PropertyView_source_viewedAt_idx" ON "PropertyView"("source", "viewedAt");
