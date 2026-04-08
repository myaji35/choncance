-- CreateTable
CREATE TABLE "RecommendLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "RecommendLog_propertyId_createdAt_idx" ON "RecommendLog"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "RecommendLog_query_idx" ON "RecommendLog"("query");
