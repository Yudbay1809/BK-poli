import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

function parseDate(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default async function AdminLiburPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  const holidays = await prisma.holiday.findMany({ orderBy: { date: "asc" } });

  async function addHolidayAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const dateText = String(formData.get("date") ?? "");
    const label = String(formData.get("label") ?? "").trim();
    const isClosed = String(formData.get("isClosed") ?? "1") === "1";
    const date = parseDate(dateText);
    if (!date) redirect("/admin/libur?err=Tanggal%20libur%20tidak%20valid");

    await prisma.holiday.upsert({
      where: { date },
      update: { label: label || null, isClosed },
      create: { date, label: label || null, isClosed },
    });
    revalidatePath("/");
    revalidatePath("/admin/libur");
    redirect("/admin/libur?msg=Jadwal%20libur%20berhasil%20disimpan");
  }

  async function deleteHolidayAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) redirect("/admin/libur?err=Data%20libur%20tidak%20valid");
    await prisma.holiday.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/libur");
    redirect("/admin/libur?msg=Jadwal%20libur%20berhasil%20dihapus");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Jadwal Libur</h1>
      <p className="app-subtitle">Atur hari libur nasional/cuti yang mempengaruhi status klinik.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Tambah Libur</h3>
        <form action={addHolidayAction} className="form-layout" style={{ maxWidth: 520 }}>
          <label className="form-field">
            Tanggal
            <input type="date" name="date" required />
          </label>
          <label className="form-field">
            Label
            <input name="label" placeholder="Libur Nasional" />
          </label>
          <label className="form-field">
            Status
            <select name="isClosed" defaultValue="1">
              <option value="1">Tutup</option>
              <option value="0">Tetap Buka</option>
            </select>
          </label>
          <button type="submit">Simpan</button>
        </form>
      </section>

      <section className="flow-sm">
        <h3>Daftar Libur</h3>
        {holidays.length === 0 ? (
          <p>Belum ada data libur.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Label</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h.id}>
                    <td>{new Date(h.date).toLocaleDateString("id-ID")}</td>
                    <td>{h.label ?? "-"}</td>
                    <td>{h.isClosed ? "Tutup" : "Buka"}</td>
                    <td>
                      <form action={deleteHolidayAction}>
                        <input type="hidden" name="id" value={h.id} />
                        <button type="submit">Hapus</button>
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
