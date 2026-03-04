import { rbacMatrix } from "@/lib/rbac";

const roles = ["SUPER_ADMIN", "ADMIN", "DOKTER", "PASIEN"] as const;
const modules = ["users", "organization", "security", "monitoring", "governance", "settings", "approvals"] as const;

export default function SuperAdminPermissionsPage() {
  return (
    <main className="flow-md">
      <h1 className="app-title">RBAC Matrix</h1>
      <p className="app-subtitle">Matrix permission per role untuk modul inti.</p>
      <div className="table-scroll">
        <table className="data-table" style={{ minWidth: 900 }}>
          <thead>
            <tr>
              <th>Module</th>
              {roles.map((role) => (
                <th key={role}>
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module}>
                <td>{module}</td>
                {roles.map((role) => (
                  <td key={`${module}-${role}`}>
                    {rbacMatrix[role][module].length > 0 ? rbacMatrix[role][module].join(", ") : "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

