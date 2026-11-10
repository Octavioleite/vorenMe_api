-- AlterTable
ALTER TABLE "User" ADD COLUMN "referredById" TEXT,
ADD COLUMN "referralRewarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "freeMonths" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "resetTokenHash" TEXT,
ADD COLUMN "resetTokenExp" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_resetTokenHash_key" ON "User"("resetTokenHash");

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "cardId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "target" TEXT,
    "source" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_cardId_createAt_idx" ON "Event"("cardId", "createAt");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
