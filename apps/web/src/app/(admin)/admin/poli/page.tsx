import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";
import FormSubmitButton from "@/components/FormSubmitButton";

type PageProps = {
  searchParams?: Promise<{
    msg?: string;
    err?: string;
    q?: string;
  }>;
};

export default async function AdminPoliPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;

  const msg = params?.msg;
  const err = params?.err;
  const q = (params?.q ?? "").trim();

  const whereClause = q
    ? {
        OR: [
          { namaPoli: { contains: q, mode: "insensitive" as const } },
          { keterangan: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const polis = await prisma.poli.findMany({
    where: whereClause,
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: { dokterPolis: true },
      },
    },
  });

  async function createPoliAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const namaPoli = String(formData.get("namaPoli") ?? "").trim();
    const keterangan = String(formData.get("keterangan") ?? "").trim();

    if (!namaPoli) redirect("/admin/poli?err=Nama%20poli%20wajib%20diisi");

    await prisma.poli.create({
      data: {
        namaPoli,
        keterangan: keterangan || null,
      },
    });

    revalidatePath("/admin/poli");
    redirect("/admin/poli?msg=Poli%20berhasil%20ditambahkan");
  }

  async function updatePoliAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    const namaPoli = String(formData.get("namaPoli") ?? "").trim();
    const keterangan = String(formData.get("keterangan") ?? "").trim();

    if (!Number.isInteger(id) || id <= 0 || !namaPoli) {
      redirect("/admin/poli?err=Data%20edit%20tidak%20valid");
    }

    await prisma.poli.update({
      where: { id },
      data: {
        namaPoli,
        keterangan: keterangan || null,
      },
    });

    revalidatePath("/admin/poli");
    redirect("/admin/poli?msg=Poli%20berhasil%20diupdate");
  }

  async function deletePoliAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      redirect("/admin/poli?err=Data%20hapus%20tidak%20valid");
    }

    const poli = await prisma.poli.findUnique({
      where: { id },
      include: { _count: { select: { dokterPolis: true } } },
    });

    if (!poli) {
      redirect("/admin/poli?err=Poli%20tidak%20ditemukan");
    }

    if (poli._count.dokterPolis > 0) {
      redirect("/admin/poli?err=Poli%20masih%20dipakai%20dokter,%20tidak%20bisa%20dihapus");
    }

    await prisma.poli.delete({ where: { id } });
    revalidatePath("/admin/poli");
    redirect("/admin/poli?msg=Poli%20berhasil%20dihapus");
  }

  return (
    <main className="flow-lg">
      <h1>Kelola Poli</h1>
      {msg ? <p>{msg}</p> : null}
      {err ? <p>{err}</p> : null}

      <section>
        <h3>Tambah Poli</h3>
        <form action={createPoliAction}>
          <label>
            Nama Poli
            <input name="namaPoli" required />
          </label>
          <label>
            Keterangan
            <textarea name="keterangan" rows={3} />
          </label>
          <FormSubmitButton idleLabel="Simpan" pendingLabel="Menyimpan..." />
        </form>
      </section>

      <section>
        <h3>Daftar Poli</h3>
        <form action="/admin/poli" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama/keterangan poli"
          />
          <button type="submit">
            Cari
          </button>
        </form>

        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th >ID</th>
                <th >Nama Poli</th>
                <th >Keterangan</th>
                <th >Jumlah Dokter</th>
                <th >Edit</th>
                <th >Hapus</th>
              </tr>
            </thead>
            <tbody>
              {polis.length === 0 ? (
                <tr>
                  <td colSpan={6} >
                    Belum ada data poli.
                  </td>
                </tr>
              ) : (
                polis.map((poli) => (
                  <tr key={poli.id}>
                    <td >{poli.id}</td>
                    <td >{poli.namaPoli}</td>
                    <td >{poli.keterangan ?? "-"}</td>
                    <td >{poli._count.dokterPolis}</td>
                    <td >
                      <form action={updatePoliAction}>
                        <input type="hidden" name="id" value={poli.id} />
                        <input name="namaPoli" defaultValue={poli.namaPoli} required />
                        <textarea name="keterangan" defaultValue={poli.keterangan ?? ""} rows={2} />
                        <FormSubmitButton idleLabel="Update" pendingLabel="Mengupdate..." />
                      </form>
                    </td>
                    <td >
                      <form action={deletePoliAction}>
                        <input type="hidden" name="id" value={poli.id} />
                        <FormSubmitButton idleLabel="Hapus" pendingLabel="Menghapus..." />
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}


