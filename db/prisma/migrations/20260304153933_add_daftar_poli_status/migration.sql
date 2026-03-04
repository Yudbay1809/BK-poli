-- CreateEnum
CREATE TYPE "DaftarPoliStatus" AS ENUM ('MENUNGGU', 'DIPANGGIL', 'SELESAI', 'BATAL');

-- AlterTable
ALTER TABLE "DaftarPoli" ADD COLUMN     "status" "DaftarPoliStatus" NOT NULL DEFAULT 'MENUNGGU';
