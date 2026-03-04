CREATE TYPE "GuestBookingStatus" AS ENUM ('PENDING_OTP', 'VERIFIED', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

CREATE TABLE "GuestBooking" (
    "id" SERIAL NOT NULL,
    "bookingCode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "noKtp" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "noHp" TEXT NOT NULL,
    "keluhan" TEXT NOT NULL,
    "poliId" INTEGER NOT NULL,
    "jadwalId" INTEGER NOT NULL,
    "status" "GuestBookingStatus" NOT NULL DEFAULT 'PENDING_OTP',
    "queueNumber" INTEGER,
    "otpVerifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestBooking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuestOtp" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestOtp_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GuestBooking_bookingCode_key" ON "GuestBooking"("bookingCode");
CREATE INDEX "GuestBooking_jadwalId_status_idx" ON "GuestBooking"("jadwalId", "status");
CREATE INDEX "GuestBooking_noKtp_jadwalId_idx" ON "GuestBooking"("noKtp", "jadwalId");
CREATE INDEX "GuestOtp_bookingId_createdAt_idx" ON "GuestOtp"("bookingId", "createdAt");

ALTER TABLE "GuestBooking" ADD CONSTRAINT "GuestBooking_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES "Poli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GuestBooking" ADD CONSTRAINT "GuestBooking_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "JadwalPeriksa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GuestOtp" ADD CONSTRAINT "GuestOtp_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "GuestBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
