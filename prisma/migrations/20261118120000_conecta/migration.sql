-- AlterTable
ALTER TABLE "Event" ADD COLUMN "visitor" TEXT,
ADD COLUMN "action" TEXT,
ADD COLUMN "interest" TEXT,
ADD COLUMN "shown" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "action" TEXT,
    "interest" TEXT,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "message" TEXT,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversion" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "action" TEXT,
    "leadId" TEXT,
    "note" TEXT,
    "value" DECIMAL(10,2),
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_cardId_createAt_idx" ON "Lead"("cardId", "createAt");

-- CreateIndex
CREATE INDEX "Conversion_cardId_occurredAt_idx" ON "Conversion"("cardId", "occurredAt");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversion" ADD CONSTRAINT "Conversion_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
