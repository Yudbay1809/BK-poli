import { requireAuthRole } from "@/lib/require-auth";

export default async function AdminPage() {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);

  return (
    <main className="flow-md">
      <h1 className="app-title">Admin Dashboard</h1>
      <p className="app-subtitle">Operasional poli, dokter, pasien, jadwal, antrian, dan pemeriksaan.</p>
      <section className="flow-sm">
        <h3>Prioritas Hari Ini</h3>
        <ul className="quick-list">
          <li>Validasi data master poli, dokter, dan jadwal.</li>
          <li>Pantau antrian dan status pemeriksaan yang berjalan.</li>
          <li>Pastikan data pasien dan obat tetap sinkron.</li>
        </ul>
      </section>
    </main>
  );
}

