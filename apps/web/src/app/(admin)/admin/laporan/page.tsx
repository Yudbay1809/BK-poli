import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default async function AdminLaporanPage() {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const todayStart = startOfToday();
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const [
    totalPoli,
    totalDokter,
    totalPasien,
    totalObat,
    totalJadwal,
    antrianHariIni,
    pemeriksaanHariIni,
    totalPendapatanHariIni,
  ] = await Promise.all([
    prisma.poli.count(),
    prisma.dokter.count(),
    prisma.pasien.count(),
    prisma.obat.count(),
    prisma.jadwalPeriksa.count(),
    prisma.daftarPoli.count({
      where: { createdAt: { gte: todayStart, lt: tomorrowStart } },
    }),
    prisma.periksa.count({
      where: { tglPeriksa: { gte: todayStart, lt: tomorrowStart } },
    }),
    prisma.periksa.aggregate({
      where: { tglPeriksa: { gte: todayStart, lt: tomorrowStart } },
      _sum: { biayaPeriksa: true },
    }),
  ]);

  return (
    <main className="flow-md">
      <h1 className="app-title">Laporan Dasar</h1>
      <p className="app-subtitle">Ringkasan metrik operasional hari ini dan total data master.</p>

      <section className="stats-grid">
        <Card title="Total Poli" value={String(totalPoli)} />
        <Card title="Total Dokter" value={String(totalDokter)} />
        <Card title="Total Pasien" value={String(totalPasien)} />
        <Card title="Total Obat" value={String(totalObat)} />
        <Card title="Total Jadwal" value={String(totalJadwal)} />
      </section>

      <section className="stats-grid">
        <Card title="Antrian Hari Ini" value={String(antrianHariIni)} />
        <Card title="Pemeriksaan Hari Ini" value={String(pemeriksaanHariIni)} />
        <Card
          title="Pendapatan Hari Ini"
          value={(totalPendapatanHariIni._sum.biayaPeriksa ?? 0).toLocaleString("id-ID")}
        />
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="stats-card">
      <div className="stats-label">{title}</div>
      <div className="stats-value">{value}</div>
    </div>
  );
}
