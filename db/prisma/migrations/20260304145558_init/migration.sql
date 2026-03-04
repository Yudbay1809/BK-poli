-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DOKTER', 'PASIEN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poli" (
    "id" SERIAL NOT NULL,
    "namaPoli" TEXT NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "Poli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dokter" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "poliId" INTEGER NOT NULL,
    "nip" TEXT NOT NULL,
    "alamat" TEXT,
    "noHp" TEXT,

    CONSTRAINT "Dokter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pasien" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "noRm" TEXT NOT NULL,
    "noKtp" TEXT NOT NULL,
    "alamat" TEXT,
    "noHp" TEXT,

    CONSTRAINT "Pasien_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JadwalPeriksa" (
    "id" SERIAL NOT NULL,
    "dokterId" INTEGER NOT NULL,
    "hari" TEXT NOT NULL,
    "jamMulai" TIMESTAMP(3) NOT NULL,
    "jamSelesai" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JadwalPeriksa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaftarPoli" (
    "id" SERIAL NOT NULL,
    "pasienId" INTEGER NOT NULL,
    "jadwalId" INTEGER NOT NULL,
    "keluhan" TEXT NOT NULL,
    "noAntrian" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DaftarPoli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Periksa" (
    "id" SERIAL NOT NULL,
    "daftarPoliId" INTEGER NOT NULL,
    "tglPeriksa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "catatan" TEXT,
    "biayaPeriksa" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Periksa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obat" (
    "id" SERIAL NOT NULL,
    "namaObat" TEXT NOT NULL,
    "kemasan" TEXT,
    "harga" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Obat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailPeriksa" (
    "id" SERIAL NOT NULL,
    "periksaId" INTEGER NOT NULL,
    "obatId" INTEGER NOT NULL,

    CONSTRAINT "DetailPeriksa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "actorUserId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Dokter_userId_key" ON "Dokter"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Dokter_nip_key" ON "Dokter"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_userId_key" ON "Pasien"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_noRm_key" ON "Pasien"("noRm");

-- CreateIndex
CREATE UNIQUE INDEX "Pasien_noKtp_key" ON "Pasien"("noKtp");

-- CreateIndex
CREATE UNIQUE INDEX "Periksa_daftarPoliId_key" ON "Periksa"("daftarPoliId");

-- AddForeignKey
ALTER TABLE "Dokter" ADD CONSTRAINT "Dokter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dokter" ADD CONSTRAINT "Dokter_poliId_fkey" FOREIGN KEY ("poliId") REFERENCES "Poli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pasien" ADD CONSTRAINT "Pasien_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalPeriksa" ADD CONSTRAINT "JadwalPeriksa_dokterId_fkey" FOREIGN KEY ("dokterId") REFERENCES "Dokter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaftarPoli" ADD CONSTRAINT "DaftarPoli_pasienId_fkey" FOREIGN KEY ("pasienId") REFERENCES "Pasien"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DaftarPoli" ADD CONSTRAINT "DaftarPoli_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "JadwalPeriksa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Periksa" ADD CONSTRAINT "Periksa_daftarPoliId_fkey" FOREIGN KEY ("daftarPoliId") REFERENCES "DaftarPoli"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPeriksa" ADD CONSTRAINT "DetailPeriksa_periksaId_fkey" FOREIGN KEY ("periksaId") REFERENCES "Periksa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPeriksa" ADD CONSTRAINT "DetailPeriksa_obatId_fkey" FOREIGN KEY ("obatId") REFERENCES "Obat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
