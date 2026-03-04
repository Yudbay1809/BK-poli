CREATE TYPE "PaymentMethod" AS ENUM ('UMUM', 'BPJS');

ALTER TABLE "GuestBooking"
ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'UMUM',
ADD COLUMN "bpjsNumber" TEXT;
