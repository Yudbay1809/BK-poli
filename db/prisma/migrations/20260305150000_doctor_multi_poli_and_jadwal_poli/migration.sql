-- Create join table for many-to-many Dokter <-> Poli
CREATE TABLE "DokterPoli" (
    "dokterId" INTEGER NOT NULL,
    "poliId" INTEGER NOT NULL,
    CONSTRAINT "DokterPoli_pkey" PRIMARY KEY ("dokterId", "poliId")
);

-- Backfill existing one-to-many relation into join table
INSERT INTO "DokterPoli" ("dokterId", "poliId")
SELECT "id", "poliId"
FROM "Dokter"
ON CONFLICT ("dokterId", "poliId") DO NOTHING;

-- Add poliId on schedule and backfill from current doctor mapping
ALTER TABLE "JadwalPeriksa" ADD COLUMN "poliId" INTEGER;

UPDATE "JadwalPeriksa" j
SET "poliId" = d."poliId"
FROM "Dokter" d
WHERE j."dokterId" = d."id";

ALTER TABLE "JadwalPeriksa" ALTER COLUMN "poliId" SET NOT NULL;

-- Remove old direct relation on Dokter
ALTER TABLE "Dokter" DROP CONSTRAINT IF EXISTS "Dokter_poliId_fkey";
ALTER TABLE "Dokter" DROP COLUMN "poliId";

-- Foreign keys and indexes
ALTER TABLE "DokterPoli"
ADD CONSTRAINT "DokterPoli_dokterId_fkey"
FOREIGN KEY ("dokterId") REFERENCES "Dokter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DokterPoli"
ADD CONSTRAINT "DokterPoli_poliId_fkey"
FOREIGN KEY ("poliId") REFERENCES "Poli"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JadwalPeriksa"
ADD CONSTRAINT "JadwalPeriksa_poliId_fkey"
FOREIGN KEY ("poliId") REFERENCES "Poli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "DokterPoli_poliId_idx" ON "DokterPoli"("poliId");
CREATE INDEX "JadwalPeriksa_poliId_idx" ON "JadwalPeriksa"("poliId");
