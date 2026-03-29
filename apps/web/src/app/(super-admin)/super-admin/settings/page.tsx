import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

export default async function SuperAdminSettingsPage({ searchParams }: PageProps) {
  await requireAuthRole(["SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  const [config, branches] = await Promise.all([
    prisma.appConfig.findUnique({ where: { id: 1 } }),
    prisma.clinicBranch.findMany({ orderBy: { name: "asc" } }),
  ]);

  async function saveConfigAction(formData: FormData) {
    "use server";
    await requireAuthRole(["SUPER_ADMIN"]);

    const clinicName = String(formData.get("clinicName") ?? "").trim();
    const weekdayHours = String(formData.get("weekdayHours") ?? "").trim();
    const saturdayHours = String(formData.get("saturdayHours") ?? "").trim();
    const holidayHours = String(formData.get("holidayHours") ?? "").trim();
    const contactPhone = String(formData.get("contactPhone") ?? "").trim();
    const contactWhatsapp = String(formData.get("contactWhatsapp") ?? "").trim();
    const contactEmail = String(formData.get("contactEmail") ?? "").trim();
    const multiBranchEnabled = String(formData.get("multiBranchEnabled") ?? "") === "on";
    const defaultBranchIdValue = String(formData.get("defaultBranchId") ?? "").trim();
    let defaultBranchId: number | null = null;
    if (defaultBranchIdValue) {
      const parsedBranchId = Number(defaultBranchIdValue);
      if (!Number.isInteger(parsedBranchId) || parsedBranchId <= 0) {
        redirect("/super-admin/settings?err=Cabang%20default%20tidak%20valid");
      }
      defaultBranchId = parsedBranchId;
    }

    if (!clinicName || !weekdayHours || !saturdayHours || !holidayHours || !contactPhone || !contactWhatsapp || !contactEmail) {
      redirect("/super-admin/settings?err=Semua%20field%20wajib%20diisi");
    }
    if (defaultBranchIdValue && defaultBranchId === null) {
      redirect("/super-admin/settings?err=Cabang%20default%20tidak%20valid");
    }

    await prisma.appConfig.upsert({
      where: { id: 1 },
      update: {
        clinicName,
        weekdayHours,
        saturdayHours,
        holidayHours,
        contactPhone,
        contactWhatsapp,
        contactEmail,
        multiBranchEnabled,
        defaultBranchId,
      },
      create: {
        id: 1,
        clinicName,
        weekdayHours,
        saturdayHours,
        holidayHours,
        contactPhone,
        contactWhatsapp,
        contactEmail,
        multiBranchEnabled,
        defaultBranchId,
      },
    });

    revalidatePath("/");
    revalidatePath("/super-admin/settings");
    redirect("/super-admin/settings?msg=Pengaturan%20berhasil%20disimpan");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Pengaturan Aplikasi</h1>
      <p className="app-subtitle">Atur informasi umum yang tampil di landing page.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Informasi Klinik Publik</h3>
        <form action={saveConfigAction} className="form-layout" style={{ maxWidth: 760 }}>
          <label className="form-field">
            Nama Klinik
            <input name="clinicName" defaultValue={config?.clinicName ?? "BK Poli"} required />
          </label>
          <label className="form-field">
            Jam Operasional Hari Kerja
            <input name="weekdayHours" defaultValue={config?.weekdayHours ?? "Senin - Jumat: 08.00 - 20.00"} required />
          </label>
          <label className="form-field">
            Jam Operasional Sabtu
            <input name="saturdayHours" defaultValue={config?.saturdayHours ?? "Sabtu: 08.00 - 14.00"} required />
          </label>
          <label className="form-field">
            Jam Operasional Hari Libur
            <input name="holidayHours" defaultValue={config?.holidayHours ?? "Minggu/Hari Libur: Tutup"} required />
          </label>
          <label className="form-field">
            Kontak Telepon
            <input name="contactPhone" defaultValue={config?.contactPhone ?? "(021) 555-0188"} required />
          </label>
          <label className="form-field">
            Kontak WhatsApp
            <input name="contactWhatsapp" defaultValue={config?.contactWhatsapp ?? "0812-0000-8899"} required />
          </label>
          <label className="form-field">
            Kontak Email
            <input name="contactEmail" type="email" defaultValue={config?.contactEmail ?? "layanan@bkpoli.local"} required />
          </label>
          <label className="form-field">
            Multi Cabang Aktif
            <input name="multiBranchEnabled" type="checkbox" defaultChecked={config?.multiBranchEnabled ?? false} />
          </label>
          <label className="form-field">
            Cabang Default
            <select name="defaultBranchId" defaultValue={config?.defaultBranchId ?? ""}>
              <option value="">Pilih Cabang</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </label>
          <button type="submit">Simpan Pengaturan</button>
        </form>
      </section>
    </main>
  );
}
