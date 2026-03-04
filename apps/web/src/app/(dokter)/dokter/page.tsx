import { requireAuthRole } from "@/lib/require-auth";

export default async function DokterPage() {
  await requireAuthRole(["DOKTER"]);

  return (
    <main className="flow-md">
      <h1 className="app-title">Dokter Dashboard</h1>
      <p className="app-subtitle">Ringkasan jadwal periksa, proses pemeriksaan pasien, dan tindak lanjut riwayat medis.</p>
      <section className="flow-sm">
        <h3 style={{ margin: 0 }}>Fokus Operasional</h3>
        <ul className="quick-list">
          <li>Tinjau jadwal praktik dan antrean pasien aktif.</li>
          <li>Lengkapi catatan pemeriksaan secara real-time.</li>
          <li>Pastikan resep dan rekomendasi tindak lanjut terdokumentasi.</li>
        </ul>
      </section>
    </main>
  );
}

