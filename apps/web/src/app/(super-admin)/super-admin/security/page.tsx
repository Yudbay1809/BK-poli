export default function SuperAdminSecurityPage() {
  return (
    <main className="flow-md">
      <h1 className="app-title">Keamanan</h1>
      <p className="app-subtitle">Kebijakan akses, sesi pengguna, dan jejak audit sistem.</p>
      <section className="flow-sm">
        <ul className="quick-list">
          <li>RBAC policy management.</li>
          <li>Audit log akses dan perubahan data.</li>
          <li>Session policy dan force logout.</li>
        </ul>
      </section>
    </main>
  );
}

