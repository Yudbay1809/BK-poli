-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- DropIndex
DROP INDEX "DokterPoli_poliId_idx";

-- DropIndex
DROP INDEX "JadwalPeriksa_poliId_idx";

-- AlterTable
ALTER TABLE "GuestBooking" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paidByName" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Poli" ADD COLUMN     "bpjsCode" TEXT,
ADD COLUMN     "bpjsName" TEXT;

-- CreateTable
CREATE TABLE "Holiday" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_date_key" ON "Holiday"("date");
