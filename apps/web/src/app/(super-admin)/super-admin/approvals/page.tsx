export default function SuperAdminApprovalsPage() {
  return (
    <main className="flow-md">
      <h1 className="app-title">Approval & Override</h1>
      <p className="app-subtitle">Kontrol persetujuan untuk aksi kritis operasional klinik.</p>
      <section className="flow-sm">
        <ul className="quick-list">
          <li>Approval penghapusan data medis.</li>
          <li>Approval perubahan tarif layanan.</li>
          <li>Override terbatas dengan audit log wajib.</li>
        </ul>
      </section>
    </main>
  );
}

