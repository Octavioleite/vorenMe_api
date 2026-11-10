-- AlterTable
ALTER TABLE "User" ADD COLUMN "paidUntil" TIMESTAMP(3),
ADD COLUMN "asaasCustomerId" TEXT,
ADD COLUMN "asaasSubscriptionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_asaasCustomerId_key" ON "User"("asaasCustomerId");
