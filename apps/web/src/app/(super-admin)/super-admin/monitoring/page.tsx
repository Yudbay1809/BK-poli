import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

export default async function SuperAdminMonitoringPage() {
  await requireAuthRole(["SUPER_ADMIN"]);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const [
    totalUsers,
    totalDokter,
    totalPasien,
    totalPoli,
    totalJadwal,
    antreanHariIni,
    periksaHariIni,
    auditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.dokter.count(),
    prisma.pasien.count(),
    prisma.poli.count(),
    prisma.jadwalPeriksa.count(),
    prisma.daftarPoli.count({ where: { createdAt: { gte: todayStart, lt: tomorrowStart } } }),
    prisma.periksa.count({ where: { tglPeriksa: { gte: todayStart, lt: tomorrowStart } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { actor: { select: { name: true } } } }),
  ]);

  return (
    <main className="flow-md">
      <h1 className="app-title">Monitoring Sistem</h1>
      <p className="app-subtitle">Ringkasan performa layanan dan status transaksi.</p>

      <section className="stats-grid">
        <Card title="Total User" value={String(totalUsers)} />
        <Card title="Total Dokter" value={String(totalDokter)} />
        <Card title="Total Pasien" value={String(totalPasien)} />
        <Card title="Total Poli" value={String(totalPoli)} />
        <Card title="Total Jadwal" value={String(totalJadwal)} />
        <Card title="Antrean Hari Ini" value={String(antreanHariIni)} />
        <Card title="Pemeriksaan Hari Ini" value={String(periksaHariIni)} />
      </section>

      <section className="flow-sm">
        <h3>Audit Log Terbaru</h3>
        {auditLogs.length === 0 ? (
          <p>Belum ada audit log tercatat.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Actor</th>
                  <th>Aksi</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                    <td>{log.actor.name}</td>
                    <td>{log.action}</td>
                    <td>{log.entityType} / {log.entityId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
