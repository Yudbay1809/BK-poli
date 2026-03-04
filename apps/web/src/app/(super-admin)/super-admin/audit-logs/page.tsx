import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";
import EmptyState from "@/components/EmptyState";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    action?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function SuperAdminAuditLogsPage({ searchParams }: PageProps) {
  await requireAuthRole(["SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;

  const q = (params?.q ?? "").trim();
  const action = (params?.action ?? "ALL").trim();
  const from = (params?.from ?? "").trim();
  const to = (params?.to ?? "").trim();

  const whereClause: {
    action?: string;
    createdAt?: { gte?: Date; lte?: Date };
    actor?: {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      }>;
    };
  } = {};

  if (action !== "ALL") {
    whereClause.action = action;
  }

  const createdAtFilter: { gte?: Date; lte?: Date } = {};
  if (from) {
    const d = new Date(`${from}T00:00:00`);
    if (!Number.isNaN(d.getTime())) createdAtFilter.gte = d;
  }
  if (to) {
    const d = new Date(`${to}T23:59:59.999`);
    if (!Number.isNaN(d.getTime())) createdAtFilter.lte = d;
  }
  if (createdAtFilter.gte || createdAtFilter.lte) {
    whereClause.createdAt = createdAtFilter;
  }

  if (q) {
    whereClause.actor = {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const logs = await prisma.auditLog.findMany({
    where: whereClause,
    include: {
      actor: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  const actionOptions = Array.from(new Set(logs.map((l) => l.action))).sort();

  return (
    <main className="flow-md">
      <h1 className="app-title">Audit Logs</h1>
      <p className="app-subtitle">Menampilkan maksimal 300 log terbaru sesuai filter.</p>

      <form action="/super-admin/audit-logs" method="get" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari actor (nama/email)"
          style={{ padding: 8, minWidth: 220 }}
        />
        <select name="action" defaultValue={action} style={{ padding: 8 }}>
          <option value="ALL">Semua Action</option>
          {actionOptions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          From
          <input type="date" name="from" defaultValue={from} style={{ padding: 8 }} />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          To
          <input type="date" name="to" defaultValue={to} style={{ padding: 8 }} />
        </label>
        <button type="submit">Filter</button>
      </form>

      {logs.length === 0 ? (
        <EmptyState
          title="Audit Log Kosong"
          description="Tidak ada log aktivitas untuk filter yang dipilih."
          icon="ðŸ§­"
        />
      ) : (
      <div className="table-scroll">
        <table className="data-table" style={{ minWidth: 1100 }}>
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Actor</th>
              <th>Role</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>Meta</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                  <td>
                    {log.actor.name}
                    <br />
                    <small>{log.actor.email}</small>
                  </td>
                  <td>{log.actor.role}</td>
                  <td>{log.action}</td>
                  <td>{log.entityType}</td>
                  <td>{log.entityId}</td>
                  <td>
                    <code style={{ whiteSpace: "pre-wrap" }}>{log.metaJson ?? "-"}</code>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      )}
    </main>
  );
}

