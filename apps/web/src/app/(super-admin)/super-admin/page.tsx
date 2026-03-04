import { requireAuthRole } from "@/lib/require-auth";

export default async function SuperAdminPage() {
  await requireAuthRole(["SUPER_ADMIN"]);

  return (
    <main className="flow-md">
      <h1 className="app-title">Super Admin Dashboard</h1>
      <p className="app-subtitle">Kontrol penuh sistem klinik multi-role.</p>
      <ul className="quick-list">
        <li>Manajemen User & Role</li>
        <li>Manajemen Organisasi (Poli, Mapping Dokter)</li>
        <li>Kontrol Akses & Keamanan</li>
        <li>Monitoring Sistem dan KPI</li>
        <li>Data Governance dan Export</li>
        <li>Konfigurasi Aplikasi</li>
        <li>Approval dan Override</li>
      </ul>
    </main>
  );
}

