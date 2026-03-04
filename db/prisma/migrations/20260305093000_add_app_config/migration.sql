CREATE TABLE "AppConfig" (
    "id" INTEGER NOT NULL,
    "clinicName" TEXT NOT NULL DEFAULT 'BK Poli',
    "weekdayHours" TEXT NOT NULL DEFAULT 'Senin - Jumat: 08.00 - 20.00',
    "saturdayHours" TEXT NOT NULL DEFAULT 'Sabtu: 08.00 - 14.00',
    "holidayHours" TEXT NOT NULL DEFAULT 'Minggu/Hari Libur: Tutup',
    "contactPhone" TEXT NOT NULL DEFAULT '(021) 555-0188',
    "contactWhatsapp" TEXT NOT NULL DEFAULT '0812-0000-8899',
    "contactEmail" TEXT NOT NULL DEFAULT 'layanan@bkpoli.local',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AppConfig" (
  "id",
  "clinicName",
  "weekdayHours",
  "saturdayHours",
  "holidayHours",
  "contactPhone",
  "contactWhatsapp",
  "contactEmail",
  "updatedAt"
) VALUES (
  1,
  'BK Poli',
  'Senin - Jumat: 08.00 - 20.00',
  'Sabtu: 08.00 - 14.00',
  'Minggu/Hari Libur: Tutup',
  '(021) 555-0188',
  '0812-0000-8899',
  'layanan@bkpoli.local',
  NOW()
)
ON CONFLICT ("id") DO NOTHING;
