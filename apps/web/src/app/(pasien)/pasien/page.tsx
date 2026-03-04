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

