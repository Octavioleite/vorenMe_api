-- CreateTable
CREATE TABLE "SupportSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminEmail" TEXT NOT NULL,
    "adminName" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "endedBy" TEXT,

    CONSTRAINT "SupportSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupportSession_userId_idx" ON "SupportSession"("userId");

-- AddForeignKey
ALTER TABLE "SupportSession" ADD CONSTRAINT "SupportSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
