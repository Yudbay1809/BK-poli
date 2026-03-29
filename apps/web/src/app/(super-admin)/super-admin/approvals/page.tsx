import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ApprovalStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

const statusOptions = [ApprovalStatus.PENDING, ApprovalStatus.APPROVED, ApprovalStatus.REJECTED] as const;

export default async function SuperAdminApprovalsPage({ searchParams }: PageProps) {
  await requireAuthRole(["SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  const approvals = await prisma.approvalRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { requester: { select: { name: true } }, approver: { select: { name: true } } },
    take: 50,
  });

  async function createApprovalAction(formData: FormData) {
    "use server";
    const { session } = await requireAuthRole(["SUPER_ADMIN"]);
    const action = String(formData.get("action") ?? "").trim();
    const entityType = String(formData.get("entityType") ?? "").trim();
    const entityId = String(formData.get("entityId") ?? "").trim();
    const reason = String(formData.get("reason") ?? "").trim();

    if (!action || !entityType || !entityId) {
      redirect("/super-admin/approvals?err=Data%20approval%20tidak%20lengkap");
    }

    await prisma.approvalRequest.create({
      data: {
        requestedByUserId: Number(session.user.id),
        action,
        entityType,
        entityId,
        reason: reason || null,
      },
    });
    revalidatePath("/super-admin/approvals");
    redirect("/super-admin/approvals?msg=Approval%20baru%20ditambahkan");
  }

  async function updateApprovalAction(formData: FormData) {
    "use server";
    const { session } = await requireAuthRole(["SUPER_ADMIN"]);
    const approvalId = Number(formData.get("approvalId"));
    const status = String(formData.get("status") ?? "") as ApprovalStatus;

    if (!Number.isInteger(approvalId) || approvalId <= 0 || !(statusOptions as readonly ApprovalStatus[]).includes(status)) {
      redirect("/super-admin/approvals?err=Status%20approval%20tidak%20valid");
    }

    await prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        status,
        approvedByUserId: Number(session.user.id),
        decidedAt: new Date(),
      },
    });
    revalidatePath("/super-admin/approvals");
    redirect("/super-admin/approvals?msg=Status%20approval%20diperbarui");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Approval & Override</h1>
      <p className="app-subtitle">Kelola approval untuk aksi kritis atau perubahan data.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Buat Approval Baru</h3>
        <form action={createApprovalAction} className="form-layout" style={{ maxWidth: 720 }}>
          <label className="form-field">
            Aksi
            <input name="action" placeholder="Contoh: DELETE_PATIENT" required />
          </label>
          <label className="form-field">
            Entity
            <input name="entityType" placeholder="Contoh: Patient" required />
          </label>
          <label className="form-field">
            Entity ID
            <input name="entityId" placeholder="Contoh: 123" required />
          </label>
          <label className="form-field">
            Alasan
            <textarea name="reason" rows={2} />
          </label>
          <button type="submit">Ajukan Approval</button>
        </form>
      </section>

      <section className="flow-sm">
        <h3>Daftar Approval</h3>
        {approvals.length === 0 ? (
          <p>Belum ada approval yang diajukan.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 920 }}>
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Aksi</th>
                  <th>Entity</th>
                  <th>Status</th>
                  <th>Pemohon</th>
                  <th>Approver</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <tr key={approval.id}>
                    <td>{new Date(approval.createdAt).toLocaleString("id-ID")}</td>
                    <td>{approval.action}</td>
                    <td>{approval.entityType} / {approval.entityId}</td>
                    <td>{approval.status}</td>
                    <td>{approval.requester.name}</td>
                    <td>{approval.approver?.name ?? "-"}</td>
                    <td>
                      <form action={updateApprovalAction} className="form-toolbar">
                        <input type="hidden" name="approvalId" value={approval.id} />
                        <select name="status" defaultValue={approval.status}>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button type="submit">Simpan</button>
                      </form>
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
