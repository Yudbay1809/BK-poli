import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

export default async function SuperAdminGovernancePage({ searchParams }: PageProps) {
  await requireAuthRole(["SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  const config = await prisma.appConfig.findUnique({ where: { id: 1 } });
  const retentionDays = config?.retentionDays ?? 365;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const [oldGuestCount, oldAuditCount] = await Promise.all([
    prisma.guestBooking.count({ where: { createdAt: { lt: cutoff } } }),
    prisma.auditLog.count({ where: { createdAt: { lt: cutoff } } }),
  ]);

  async function saveGovernanceAction(formData: FormData) {
    "use server";
    await requireAuthRole(["SUPER_ADMIN"]);
    const retention = Number(formData.get("retentionDays"));
    const anonymizeEnabled = String(formData.get("anonymizeEnabled") ?? "") === "on";

    if (!Number.isInteger(retention) || retention < 30) {
      redirect("/super-admin/governance?err=Retensi%20minimal%2030%20hari");
    }

    await prisma.appConfig.upsert({
      where: { id: 1 },
      update: { retentionDays: retention, anonymizeEnabled },
      create: { id: 1, retentionDays: retention, anonymizeEnabled },
    });
    revalidatePath("/super-admin/governance");
    redirect("/super-admin/governance?msg=Pengaturan%20governance%20tersimpan");
  }

  async function anonymizeAction() {
    "use server";
    await requireAuthRole(["SUPER_ADMIN"]);
    const config = await prisma.appConfig.findUnique({ where: { id: 1 } });
    if (!config?.anonymizeEnabled) {
      redirect("/super-admin/governance?err=Anonymization%20tidak%20aktif");
    }
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (config?.retentionDays ?? 365));

    await prisma.guestBooking.updateMany({
      where: { createdAt: { lt: cutoff } },
      data: {
        nama: "ANONIM",
        noHp: "0000000000",
        noKtp: null,
        bpjsNumber: null,
      },
    });
    revalidatePath("/super-admin/governance");
    redirect("/super-admin/governance?msg=Data%20lama%20berhasil%20dianonimkan");
  }

  async function purgeAuditAction() {
    "use server";
    await requireAuthRole(["SUPER_ADMIN"]);
    const config = await prisma.appConfig.findUnique({ where: { id: 1 } });
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (config?.retentionDays ?? 365));

    await prisma.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
    revalidatePath("/super-admin/governance");
    redirect("/super-admin/governance?msg=Audit%20log%20lama%20berhasil%20dipurge");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Data Governance</h1>
      <p className="app-subtitle">Atur kebijakan retensi dan anonymization data.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Pengaturan Retensi</h3>
        <form action={saveGovernanceAction} className="form-layout" style={{ maxWidth: 560 }}>
          <label className="form-field">
            Retensi Data (hari)
            <input name="retentionDays" type="number" min={30} defaultValue={retentionDays} required />
          </label>
          <label className="form-field">
            Aktifkan Anonymization
            <input name="anonymizeEnabled" type="checkbox" defaultChecked={config?.anonymizeEnabled ?? true} />
          </label>
          <button type="submit">Simpan Kebijakan</button>
        </form>
      </section>

      <section className="flow-sm">
        <h3>Eksekusi Governance</h3>
        <p>Data guest booking lebih lama dari {retentionDays} hari: {oldGuestCount} entri.</p>
        <p>Audit log lebih lama dari {retentionDays} hari: {oldAuditCount} entri.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <form action={anonymizeAction}>
            <button type="submit">Anonymize Data Lama</button>
          </form>
          <form action={purgeAuditAction}>
            <button type="submit">Purge Audit Logs</button>
          </form>
        </div>
      </section>
    </main>
  );
}
