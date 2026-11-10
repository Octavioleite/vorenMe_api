-- AlterTable
ALTER TABLE "User" ADD COLUMN "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "SlugHold" (
    "slug" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "until" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlugHold_pkey" PRIMARY KEY ("slug")
);
