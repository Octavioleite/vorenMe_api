-- AlterTable
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN "verifyTokenHash" TEXT,
ADD COLUMN "verifyTokenExp" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_verifyTokenHash_key" ON "User"("verifyTokenHash");
