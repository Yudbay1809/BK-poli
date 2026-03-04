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

export default async function AdminObatPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;

  const msg = params?.msg;
  const err = params?.err;
  const q = (params?.q ?? "").trim();

  const whereClause = q
    ? {
        OR: [
          { namaObat: { contains: q, mode: "insensitive" as const } },
          { kemasan: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const obats = await prisma.obat.findMany({
    where: whereClause,
    orderBy: { id: "desc" },
    include: {
      _count: {
        select: { details: true },
      },
    },
  });

  async function createObatAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const namaObat = String(formData.get("namaObat") ?? "").trim();
    const kemasan = String(formData.get("kemasan") ?? "").trim();
    const harga = Number(formData.get("harga"));

    if (!namaObat || !Number.isFinite(harga) || harga < 0) {
      redirect("/admin/obat?err=Input%20obat%20tidak%20valid");
    }

    await prisma.obat.create({
      data: {
        namaObat,
        kemasan: kemasan || null,
        harga: Math.round(harga),
      },
    });

    revalidatePath("/admin/obat");
    redirect("/admin/obat?msg=Obat%20berhasil%20ditambahkan");
  }

  async function updateObatAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    const namaObat = String(formData.get("namaObat") ?? "").trim();
    const kemasan = String(formData.get("kemasan") ?? "").trim();
    const harga = Number(formData.get("harga"));

    if (!Number.isInteger(id) || id <= 0 || !namaObat || !Number.isFinite(harga) || harga < 0) {
      redirect("/admin/obat?err=Data%20edit%20obat%20tidak%20valid");
    }

    await prisma.obat.update({
      where: { id },
      data: {
        namaObat,
        kemasan: kemasan || null,
        harga: Math.round(harga),
      },
    });

    revalidatePath("/admin/obat");
    redirect("/admin/obat?msg=Obat%20berhasil%20diupdate");
  }

  async function deleteObatAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) {
      redirect("/admin/obat?err=Data%20hapus%20obat%20tidak%20valid");
    }

    const obat = await prisma.obat.findUnique({
      where: { id },
      include: { _count: { select: { details: true } } },
    });

    if (!obat) {
      redirect("/admin/obat?err=Obat%20tidak%20ditemukan");
    }
    if (obat._count.details > 0) {
      redirect("/admin/obat?err=Obat%20sudah%20dipakai%20di%20rekam%20periksa,%20tidak%20bisa%20dihapus");
    }

    await prisma.obat.delete({ where: { id } });
    revalidatePath("/admin/obat");
    redirect("/admin/obat?msg=Obat%20berhasil%20dihapus");
  }

  return (
    <main className="flow-lg">
      <h1>Kelola Obat</h1>
      {msg ? <p>{msg}</p> : null}
      {err ? <p>{err}</p> : null}

      <section>
        <h3>Tambah Obat</h3>
        <form action={createObatAction}>
          <label>
            Nama Obat
            <input name="namaObat" required />
          </label>
          <label>
            Kemasan
            <input name="kemasan" />
          </label>
          <label>
            Harga
            <input name="harga" type="number" min={0} step={1} required />
          </label>
          <FormSubmitButton idleLabel="Simpan" pendingLabel="Menyimpan..." />
        </form>
      </section>

      <section>
        <h3>Daftar Obat</h3>
        <form action="/admin/obat" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama/kemasan obat"
          />
          <button type="submit">
            Cari
          </button>
        </form>

        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Obat</th>
                <th>Kemasan</th>
                <th>Harga</th>
                <th>Dipakai di Detail Periksa</th>
                <th>Edit</th>
                <th>Hapus</th>
              </tr>
            </thead>
            <tbody>
              {obats.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    Belum ada data obat.
                  </td>
                </tr>
              ) : (
                obats.map((obat) => (
                  <tr key={obat.id}>
                    <td>{obat.id}</td>
                    <td>{obat.namaObat}</td>
                    <td>{obat.kemasan ?? "-"}</td>
                    <td>{obat.harga.toLocaleString("id-ID")}</td>
                    <td>{obat._count.details}</td>
                    <td>
                      <form action={updateObatAction}>
                        <input type="hidden" name="id" value={obat.id} />
                        <input name="namaObat" defaultValue={obat.namaObat} required />
                        <input name="kemasan" defaultValue={obat.kemasan ?? ""} />
                        <input name="harga" type="number" min={0} step={1} defaultValue={obat.harga} required />
                        <FormSubmitButton idleLabel="Update" pendingLabel="Mengupdate..." />
                      </form>
                    </td>
                    <td>
                      <form action={deleteObatAction}>
                        <input type="hidden" name="id" value={obat.id} />
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


