import "dotenv/config";
import bcrypt from "bcryptjs";
import {
  DaftarPoliStatus,
  GuestBookingStatus,
  PaymentMethod,
  PrismaClient,
  Role,
} from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = process.env.DUMMY_PASSWORD ?? "Password123!";

async function upsertUser(params: {
  email: string;
  username: string;
  name: string;
  role: Role;
  passwordHash: string;
}) {
  const { email, username, name, role, passwordHash } = params;
  return prisma.user.upsert({
    where: { email },
    update: { username, name, role, passwordHash, isActive: true },
    create: { email, username, name, role, passwordHash, isActive: true },
  });
}

async function getOrCreatePoli(namaPoli: string, keterangan: string) {
  const found = await prisma.poli.findFirst({ where: { namaPoli } });
  if (found) return found;
  return prisma.poli.create({ data: { namaPoli, keterangan } });
}

async function getOrCreateJadwal(params: {
  dokterId: number;
  poliId: number;
  hari: string;
  jamMulai: Date;
  jamSelesai: Date;
}) {
  const found = await prisma.jadwalPeriksa.findFirst({
    where: {
      dokterId: params.dokterId,
      poliId: params.poliId,
      hari: params.hari,
      jamMulai: params.jamMulai,
      jamSelesai: params.jamSelesai,
    },
  });
  if (found) return found;
  return prisma.jadwalPeriksa.create({ data: params });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL ?? "superadmin@bkpoli.local";
  const superAdminUsername = process.env.SUPER_ADMIN_USERNAME ?? "superadmin";
  await upsertUser({
    email: superAdminEmail,
    username: superAdminUsername,
    name: "Super Admin",
    role: Role.SUPER_ADMIN,
    passwordHash,
  });

  await prisma.appConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      clinicName: "BK Poli",
      weekdayHours: "Senin - Jumat: 08.00 - 20.00",
      saturdayHours: "Sabtu: 08.00 - 14.00",
      holidayHours: "Minggu/Hari Libur: Tutup",
      contactPhone: "(021) 555-0188",
      contactWhatsapp: "0812-0000-8899",
      contactEmail: "layanan@bkpoli.local",
    },
  });

  const admin = await upsertUser({
    email: "admin@bkpoli.local",
    username: "admin",
    name: "Admin Klinik",
    role: Role.ADMIN,
    passwordHash,
  });

  const poliUmum = await getOrCreatePoli("Poli Umum", "Pemeriksaan umum dan keluhan harian.");
  const poliAnak = await getOrCreatePoli("Poli Anak", "Layanan kesehatan bayi dan anak.");
  const poliGigi = await getOrCreatePoli("Poli Gigi", "Pemeriksaan dan tindakan kesehatan gigi.");
  const poliPenyakitDalam = await getOrCreatePoli(
    "Poli Penyakit Dalam",
    "Layanan penyakit dalam dan kontrol kronis."
  );

  const dokterUsers = await Promise.all([
    upsertUser({
      email: "dokter.umum@bkpoli.local",
      username: "drumum",
      name: "Andi Pratama",
      role: Role.DOKTER,
      passwordHash,
    }),
    upsertUser({
      email: "dokter.anak@bkpoli.local",
      username: "dranak",
      name: "Siti Rahma",
      role: Role.DOKTER,
      passwordHash,
    }),
    upsertUser({
      email: "dokter.gigi@bkpoli.local",
      username: "drgigi",
      name: "Rudi Kurnia",
      role: Role.DOKTER,
      passwordHash,
    }),
    upsertUser({
      email: "dokter.pd@bkpoli.local",
      username: "drpd",
      name: "Bunga Lestari",
      role: Role.DOKTER,
      passwordHash,
    }),
    upsertUser({
      email: "dokter.umum2@bkpoli.local",
      username: "drumum2",
      name: "Reza Mahendra",
      role: Role.DOKTER,
      passwordHash,
    }),
    upsertUser({
      email: "dokter.anak2@bkpoli.local",
      username: "dranak2",
      name: "Lina Permata",
      role: Role.DOKTER,
      passwordHash,
    }),
    upsertUser({
      email: "dokter.gigi2@bkpoli.local",
      username: "drgigi2",
      name: "Yoga Wibowo",
      role: Role.DOKTER,
      passwordHash,
    }),
  ]);

  const dokterMap = [
    { user: dokterUsers[0], poliIds: [poliUmum.id, poliPenyakitDalam.id], nip: "DOK-UMUM-001" },
    { user: dokterUsers[1], poliIds: [poliAnak.id], nip: "DOK-ANAK-001" },
    { user: dokterUsers[2], poliIds: [poliGigi.id], nip: "DOK-GIGI-001" },
    { user: dokterUsers[3], poliIds: [poliPenyakitDalam.id], nip: "DOK-PD-001" },
    { user: dokterUsers[4], poliIds: [poliUmum.id], nip: "DOK-UMUM-002" },
    { user: dokterUsers[5], poliIds: [poliAnak.id], nip: "DOK-ANAK-002" },
    { user: dokterUsers[6], poliIds: [poliGigi.id], nip: "DOK-GIGI-002" },
  ];

  const dokters = [];
  for (const d of dokterMap) {
    const dokter = await prisma.dokter.upsert({
      where: { userId: d.user.id },
      update: { nip: d.nip, alamat: "Jl. Klinik Sehat No. 1", noHp: "081200000001" },
      create: {
        userId: d.user.id,
        nip: d.nip,
        alamat: "Jl. Klinik Sehat No. 1",
        noHp: "081200000001",
      },
    });
    await prisma.dokterPoli.deleteMany({ where: { dokterId: dokter.id } });
    await prisma.dokterPoli.createMany({
      data: d.poliIds.map((poliId) => ({ dokterId: dokter.id, poliId })),
      skipDuplicates: true,
    });
    dokters.push(dokter);
  }

  const pasienUsers = await Promise.all([
    upsertUser({
      email: "pasien.satu@bkpoli.local",
      username: "pasien1",
      name: "Budi Santoso",
      role: Role.PASIEN,
      passwordHash,
    }),
    upsertUser({
      email: "pasien.dua@bkpoli.local",
      username: "pasien2",
      name: "Dewi Anggraini",
      role: Role.PASIEN,
      passwordHash,
    }),
    upsertUser({
      email: "pasien.tiga@bkpoli.local",
      username: "pasien3",
      name: "Fajar Hidayat",
      role: Role.PASIEN,
      passwordHash,
    }),
  ]);

  const pasienData = [
    { user: pasienUsers[0], noRm: "202603-00001", noKtp: "3173000000000001" },
    { user: pasienUsers[1], noRm: "202603-00002", noKtp: "3173000000000002" },
    { user: pasienUsers[2], noRm: "202603-00003", noKtp: "3173000000000003" },
  ];

  const pasiens = [];
  for (const p of pasienData) {
    const pasien = await prisma.pasien.upsert({
      where: { userId: p.user.id },
      update: {
        noRm: p.noRm,
        noKtp: p.noKtp,
        alamat: "Jl. Contoh Pasien",
        noHp: "081300000000",
      },
      create: {
        userId: p.user.id,
        noRm: p.noRm,
        noKtp: p.noKtp,
        alamat: "Jl. Contoh Pasien",
        noHp: "081300000000",
      },
    });
    pasiens.push(pasien);
  }

  const weekDays = [
    { hari: "Senin", date: "2026-03-09" },
    { hari: "Selasa", date: "2026-03-10" },
    { hari: "Rabu", date: "2026-03-11" },
    { hari: "Kamis", date: "2026-03-12" },
    { hari: "Jumat", date: "2026-03-13" },
    { hari: "Sabtu", date: "2026-03-14" },
  ];
  const morning = { start: "08:00:00.000Z", end: "11:00:00.000Z" };
  const afternoon = { start: "13:00:00.000Z", end: "16:00:00.000Z" };

  const jadwalTemplates: Array<{
    dokter: (typeof dokters)[number];
    poliId: number;
    hari: string;
    start: string;
    end: string;
  }> = [];

  function addPoliWeeklyShift(
    poliId: number,
    dokterPagi: (typeof dokters)[number],
    dokterSore: (typeof dokters)[number]
  ) {
    for (const d of weekDays) {
      jadwalTemplates.push({
        dokter: dokterPagi,
        poliId,
        hari: d.hari,
        start: `${d.date}T${morning.start}`,
        end: `${d.date}T${morning.end}`,
      });
      jadwalTemplates.push({
        dokter: dokterSore,
        poliId,
        hari: d.hari,
        start: `${d.date}T${afternoon.start}`,
        end: `${d.date}T${afternoon.end}`,
      });
    }
  }

  // Tiap poli buka 6 hari (Senin-Sabtu) dengan dokter shift bergantian pagi/sore.
  addPoliWeeklyShift(poliUmum.id, dokters[0], dokters[4]);
  addPoliWeeklyShift(poliAnak.id, dokters[1], dokters[5]);
  addPoliWeeklyShift(poliGigi.id, dokters[2], dokters[6]);
  addPoliWeeklyShift(poliPenyakitDalam.id, dokters[3], dokters[0]);

  const jadwals = [];
  for (const j of jadwalTemplates) {
    const jadwal = await getOrCreateJadwal({
      dokterId: j.dokter.id,
      poliId: j.poliId,
      hari: j.hari,
      jamMulai: new Date(j.start),
      jamSelesai: new Date(j.end),
    });
    jadwals.push(jadwal);
  }

  const jadwalByPoliHari = new Map<string, (typeof jadwals)[number]>();
  for (const jadwal of jadwals) {
    const key = `${jadwal.poliId}-${jadwal.hari}`;
    if (!jadwalByPoliHari.has(key)) jadwalByPoliHari.set(key, jadwal);
  }
  const pickJadwal = (poliId: number, hari: string) => {
    const found = jadwalByPoliHari.get(`${poliId}-${hari}`);
    if (!found) throw new Error(`Jadwal tidak ditemukan untuk poliId=${poliId}, hari=${hari}`);
    return found;
  };

  const obatSeeds = [
    { namaObat: "Paracetamol", kemasan: "Tablet 500mg", harga: 5000 },
    { namaObat: "Amoxicillin", kemasan: "Kapsul 500mg", harga: 12000 },
    { namaObat: "Ibuprofen", kemasan: "Tablet 400mg", harga: 8000 },
    { namaObat: "Vitamin C", kemasan: "Tablet 500mg", harga: 6000 },
  ];

  const obats = [];
  for (const o of obatSeeds) {
    const found = await prisma.obat.findFirst({ where: { namaObat: o.namaObat } });
    if (found) {
      const updated = await prisma.obat.update({
        where: { id: found.id },
        data: { kemasan: o.kemasan, harga: o.harga },
      });
      obats.push(updated);
    } else {
      obats.push(await prisma.obat.create({ data: o }));
    }
  }

  const daftarPairs = [
    {
      pasien: pasiens[0],
      jadwal: pickJadwal(poliUmum.id, "Senin"),
      noAntrian: 1,
      keluhan: "Demam dan pusing",
      status: DaftarPoliStatus.MENUNGGU,
    },
    {
      pasien: pasiens[1],
      jadwal: pickJadwal(poliAnak.id, "Selasa"),
      noAntrian: 1,
      keluhan: "Batuk pilek anak",
      status: DaftarPoliStatus.DIPANGGIL,
    },
    {
      pasien: pasiens[2],
      jadwal: pickJadwal(poliGigi.id, "Rabu"),
      noAntrian: 1,
      keluhan: "Sakit gigi kanan",
      status: DaftarPoliStatus.SELESAI,
    },
  ];

  const daftarPolis = [];
  for (const d of daftarPairs) {
    const exists = await prisma.daftarPoli.findFirst({
      where: { pasienId: d.pasien.id, jadwalId: d.jadwal.id, noAntrian: d.noAntrian },
    });
    if (exists) {
      const updated = await prisma.daftarPoli.update({
        where: { id: exists.id },
        data: { keluhan: d.keluhan, status: d.status },
      });
      daftarPolis.push(updated);
    } else {
      daftarPolis.push(
        await prisma.daftarPoli.create({
          data: {
            pasienId: d.pasien.id,
            jadwalId: d.jadwal.id,
            noAntrian: d.noAntrian,
            keluhan: d.keluhan,
            status: d.status,
          },
        })
      );
    }
  }

  const periksaTarget = daftarPolis.find((d) => d.status === DaftarPoliStatus.SELESAI);
  if (periksaTarget) {
    const existingPeriksa = await prisma.periksa.findUnique({ where: { daftarPoliId: periksaTarget.id } });
    const periksa =
      existingPeriksa ??
      (await prisma.periksa.create({
        data: {
          daftarPoliId: periksaTarget.id,
          catatan: "Perlu obat anti nyeri dan kontrol 3 hari lagi.",
          biayaPeriksa: 75000,
        },
      }));

    const existingDetails = await prisma.detailPeriksa.count({ where: { periksaId: periksa.id } });
    if (existingDetails === 0) {
      await prisma.detailPeriksa.createMany({
        data: [
          { periksaId: periksa.id, obatId: obats[0].id },
          { periksaId: periksa.id, obatId: obats[2].id },
        ],
      });
    }
  }

  const guestBookingData = [
    {
      bookingCode: "BK-DEMO001",
      nama: "Slamet Riyadi",
      noHp: "081234560001",
      noKtp: "3173000000001001",
      paymentMethod: PaymentMethod.UMUM,
      bpjsNumber: null,
      keluhan: "Batuk 3 hari",
      poliId: poliUmum.id,
      jadwalId: pickJadwal(poliUmum.id, "Senin").id,
      status: GuestBookingStatus.CONFIRMED,
      queueNumber: 2,
    },
    {
      bookingCode: "BK-DEMO002",
      nama: "Rina Aulia",
      noHp: "081234560002",
      noKtp: null,
      paymentMethod: PaymentMethod.BPJS,
      bpjsNumber: "0001234567890",
      keluhan: "Kontrol gula darah",
      poliId: poliPenyakitDalam.id,
      jadwalId: pickJadwal(poliPenyakitDalam.id, "Kamis").id,
      status: GuestBookingStatus.CONFIRMED,
      queueNumber: 1,
    },
  ];

  for (const g of guestBookingData) {
    await prisma.guestBooking.upsert({
      where: { bookingCode: g.bookingCode },
      update: {
        nama: g.nama,
        noHp: g.noHp,
        noKtp: g.noKtp,
        paymentMethod: g.paymentMethod,
        bpjsNumber: g.bpjsNumber,
        keluhan: g.keluhan,
        poliId: g.poliId,
        jadwalId: g.jadwalId,
        status: g.status,
        queueNumber: g.queueNumber,
        otpVerifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      create: {
        bookingCode: g.bookingCode,
        nama: g.nama,
        noHp: g.noHp,
        noKtp: g.noKtp,
        paymentMethod: g.paymentMethod,
        bpjsNumber: g.bpjsNumber,
        keluhan: g.keluhan,
        poliId: g.poliId,
        jadwalId: g.jadwalId,
        status: g.status,
        queueNumber: g.queueNumber,
        otpVerifiedAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  const auditExists = await prisma.auditLog.findFirst({
    where: {
      actorUserId: admin.id,
      action: "SEED_CREATE_DUMMY_DATA",
      entityType: "System",
      entityId: "seed-1",
    },
  });
  if (!auditExists) {
    await prisma.auditLog.create({
      data: {
        actorUserId: admin.id,
        action: "SEED_CREATE_DUMMY_DATA",
        entityType: "System",
        entityId: "seed-1",
        metaJson: JSON.stringify({ source: "prisma/seed.ts" }),
      },
    });
  }

  console.log("Seed dummy selesai.");
  console.log(`Super admin: ${superAdminEmail} (${superAdminUsername})`);
  console.log(`Admin: admin@bkpoli.local (admin)`);
  console.log(`Semua akun dummy menggunakan password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
