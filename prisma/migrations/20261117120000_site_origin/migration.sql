-- AlterTable
ALTER TABLE "User" ADD COLUMN "origin" JSONB;

-- CreateTable
CREATE TABLE "SiteEvent" (
    "id" SERIAL NOT NULL,
    "kind" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "medium" TEXT,
    "campaign" TEXT,
    "device" TEXT NOT NULL,
    "new" BOOLEAN NOT NULL DEFAULT false,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteEvent_createAt_idx" ON "SiteEvent"("createAt");
