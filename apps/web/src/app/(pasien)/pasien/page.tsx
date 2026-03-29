import { DaftarPoliStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { getCurrentPasienContext } from "@/lib/current-user";

export default async function PasienPage() {
  const { pasien } = await getCurrentPasienContext();

  const [totalDaftar, menungguCount, selesaiCount] = await Promise.all([
    prisma.daftarPoli.count({ where: { pasienId: pasien.id } }),
    prisma.daftarPoli.count({ where: { pasienId: pasien.id, status: { in: [DaftarPoliStatus.MENUNGGU, DaftarPoliStatus.DIPANGGIL] } } }),
    prisma.daftarPoli.count({ where: { pasienId: pasien.id, status: DaftarPoliStatus.SELESAI } }),
  ]);

  const activeQueues = await prisma.daftarPoli.findMany({
    where: { pasienId: pasien.id, status: { in: [DaftarPoliStatus.MENUNGGU, DaftarPoliStatus.DIPANGGIL] } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      jadwal: {
        include: {
          dokter: { include: { user: { select: { name: true } } } },
          poli: { select: { namaPoli: true } },
        },
      },
    },
    take: 10,
  });

  return (
    <main className="flow-md">
      <h1 className="app-title">Pasien Dashboard</h1>
      <p>
        Selamat datang, <strong>{pasien.user.name}</strong> ({pasien.noRm})
      </p>
      <div className="stats-grid">
        <Card title="Total Pendaftaran" value={String(totalDaftar)} />
        <Card title="Antrian Aktif" value={String(menungguCount)} />
        <Card title="Kunjungan Selesai" value={String(selesaiCount)} />
      </div>

      <section className="flow-sm">
        <h3>Status Antrian</h3>
        {activeQueues.length === 0 ? (
          <p>Belum ada antrian aktif.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th>Poli</th>
                  <th>Dokter</th>
                  <th>Jadwal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activeQueues.map((q) => (
                  <tr key={q.id}>
                    <td>{q.jadwal.poli.namaPoli}</td>
                    <td>{q.jadwal.dokter.user.name}</td>
                    <td>
                      {q.jadwal.hari} {new Date(q.jadwal.jamMulai).toISOString().slice(11, 16)}-
                      {new Date(q.jadwal.jamSelesai).toISOString().slice(11, 16)}
                    </td>
                    <td>
                      {q.status === DaftarPoliStatus.DIPANGGIL ? (
                        <strong className="notice-error">DIPANGGIL</strong>
                      ) : (
                        q.status
                      )}
                    </td>
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

