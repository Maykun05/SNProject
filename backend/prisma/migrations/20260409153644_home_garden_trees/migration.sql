-- CreateTable
CREATE TABLE "TreeType" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "unlockCoinCost" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TreeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTreeUnlock" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "treeTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTreeUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarnedTree" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "treeTypeId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "refDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EarnedTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeGardenSlot" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "earnedTreeId" INTEGER,

    CONSTRAINT "HomeGardenSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TreeType_key_key" ON "TreeType"("key");

-- CreateIndex
CREATE UNIQUE INDEX "UserTreeUnlock_userId_treeTypeId_key" ON "UserTreeUnlock"("userId", "treeTypeId");

-- CreateIndex
CREATE INDEX "EarnedTree_userId_createdAt_idx" ON "EarnedTree"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EarnedTree_userId_refDate_source_key" ON "EarnedTree"("userId", "refDate", "source");

-- CreateIndex
CREATE UNIQUE INDEX "HomeGardenSlot_earnedTreeId_key" ON "HomeGardenSlot"("earnedTreeId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeGardenSlot_userId_slotIndex_key" ON "HomeGardenSlot"("userId", "slotIndex");

-- AddForeignKey
ALTER TABLE "UserTreeUnlock" ADD CONSTRAINT "UserTreeUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTreeUnlock" ADD CONSTRAINT "UserTreeUnlock_treeTypeId_fkey" FOREIGN KEY ("treeTypeId") REFERENCES "TreeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedTree" ADD CONSTRAINT "EarnedTree_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedTree" ADD CONSTRAINT "EarnedTree_treeTypeId_fkey" FOREIGN KEY ("treeTypeId") REFERENCES "TreeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeGardenSlot" ADD CONSTRAINT "HomeGardenSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeGardenSlot" ADD CONSTRAINT "HomeGardenSlot_earnedTreeId_fkey" FOREIGN KEY ("earnedTreeId") REFERENCES "EarnedTree"("id") ON DELETE SET NULL ON UPDATE CASCADE;
