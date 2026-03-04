import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DaftarPoliStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";
import PaginationLinks from "@/components/PaginationLinks";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import EmptyState from "@/components/EmptyState";
import FormSubmitButton from "@/components/FormSubmitButton";

type PageProps = {
  searchParams?: Promise<{
    msg?: string;
    err?: string;
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
};

export default async function AdminPemeriksaanPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const q = (params?.q ?? "").trim();
  const page = Math.max(1, Number(params?.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(params?.pageSize ?? 10) || 10));

  const antrianForCreate = await prisma.daftarPoli.findMany({
    where: {
      periksa: null,
      status: { not: DaftarPoliStatus.BATAL },
    },
    orderBy: { createdAt: "desc" },
    include: {
      pasien: { include: { user: { select: { name: true } } } },
      jadwal: {
        include: {
          dokter: { include: { user: { select: { name: true } } } },
          poli: { select: { namaPoli: true } },
        },
      },
    },
    take: 200,
  });

  const obats = await prisma.obat.findMany({ orderBy: { namaObat: "asc" } });

  const wherePeriksa = q
    ? {
        OR: [
          { daftarPoli: { pasien: { user: { name: { contains: q, mode: "insensitive" as const } } } } },
          { daftarPoli: { jadwal: { dokter: { user: { name: { contains: q, mode: "insensitive" as const } } } } } },
          { daftarPoli: { jadwal: { poli: { namaPoli: { contains: q, mode: "insensitive" as const } } } } },
        ],
      }
    : undefined;

  const total = await prisma.periksa.count({ where: wherePeriksa });
  const periksas = await prisma.periksa.findMany({
    where: wherePeriksa,
    orderBy: { tglPeriksa: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      daftarPoli: {
        include: {
          pasien: { include: { user: { select: { name: true } } } },
          jadwal: {
            include: {
              dokter: { include: { user: { select: { name: true } } } },
              poli: { select: { namaPoli: true } },
            },
          },
        },
      },
      details: { include: { obat: true } },
    },
  });

  async function createPeriksaAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);

    const daftarPoliId = Number(formData.get("daftarPoliId"));
    const tglPeriksaText = String(formData.get("tglPeriksa") ?? "");
    const catatan = String(formData.get("catatan") ?? "").trim();
    const biayaPeriksa = Number(formData.get("biayaPeriksa"));
    const obatIds = formData.getAll("obatIds").map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0);

    if (!Number.isInteger(daftarPoliId) || !tglPeriksaText || !Number.isFinite(biayaPeriksa) || biayaPeriksa < 0) {
      redirect("/admin/pemeriksaan?err=Input%20pemeriksaan%20tidak%20valid");
    }

    const exists = await prisma.periksa.findUnique({ where: { daftarPoliId } });
    if (exists) redirect("/admin/pemeriksaan?err=Antrian%20ini%20sudah%20memiliki%20pemeriksaan");

    const tglPeriksa = new Date(tglPeriksaText);
    if (Number.isNaN(tglPeriksa.getTime())) redirect("/admin/pemeriksaan?err=Tanggal%20pemeriksaan%20tidak%20valid");

    await prisma.$transaction(async (tx) => {
      const periksa = await tx.periksa.create({
        data: {
          daftarPoliId,
          tglPeriksa,
          catatan: catatan || null,
          biayaPeriksa: Math.round(biayaPeriksa),
        },
      });

      if (obatIds.length > 0) {
        await tx.detailPeriksa.createMany({
          data: obatIds.map((obatId) => ({ periksaId: periksa.id, obatId })),
        });
      }

      await tx.daftarPoli.update({
        where: { id: daftarPoliId },
        data: { status: DaftarPoliStatus.SELESAI },
      });
    });

    revalidatePath("/admin/pemeriksaan");
    redirect("/admin/pemeriksaan?msg=Pemeriksaan%20berhasil%20ditambahkan");
  }

  async function updatePeriksaAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    const tglPeriksaText = String(formData.get("tglPeriksa") ?? "");
    const catatan = String(formData.get("catatan") ?? "").trim();
    const biayaPeriksa = Number(formData.get("biayaPeriksa"));
    const obatIds = formData.getAll("obatIds").map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0);

    if (!Number.isInteger(id) || !tglPeriksaText || !Number.isFinite(biayaPeriksa) || biayaPeriksa < 0) {
      redirect("/admin/pemeriksaan?err=Data%20edit%20pemeriksaan%20tidak%20valid");
    }

    const tglPeriksa = new Date(tglPeriksaText);
    if (Number.isNaN(tglPeriksa.getTime())) redirect("/admin/pemeriksaan?err=Tanggal%20pemeriksaan%20tidak%20valid");

    await prisma.$transaction(async (tx) => {
      await tx.periksa.update({
        where: { id },
        data: {
          tglPeriksa,
          catatan: catatan || null,
          biayaPeriksa: Math.round(biayaPeriksa),
        },
      });
      await tx.detailPeriksa.deleteMany({ where: { periksaId: id } });
      if (obatIds.length > 0) {
        await tx.detailPeriksa.createMany({
          data: obatIds.map((obatId) => ({ periksaId: id, obatId })),
        });
      }
    });
    revalidatePath("/admin/pemeriksaan");
    redirect("/admin/pemeriksaan?msg=Pemeriksaan%20berhasil%20diupdate");
  }

  async function deletePeriksaAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) redirect("/admin/pemeriksaan?err=ID%20pemeriksaan%20tidak%20valid");

    const data = await prisma.periksa.findUnique({ where: { id }, select: { daftarPoliId: true } });
    if (!data) redirect("/admin/pemeriksaan?err=Pemeriksaan%20tidak%20ditemukan");

    await prisma.$transaction([
      prisma.detailPeriksa.deleteMany({ where: { periksaId: id } }),
      prisma.periksa.delete({ where: { id } }),
      prisma.daftarPoli.update({
        where: { id: data.daftarPoliId },
        data: { status: DaftarPoliStatus.DIPANGGIL },
      }),
    ]);
    revalidatePath("/admin/pemeriksaan");
    redirect("/admin/pemeriksaan?msg=Pemeriksaan%20berhasil%20dihapus");
  }

  return (
    <main>
      <h1>Kelola Pemeriksaan</h1>
      {msg ? <p>{msg}</p> : null}
      {err ? <p>{err}</p> : null}

      <section>
        <h3>Tambah Pemeriksaan</h3>
        <form action={createPeriksaAction}>
          <label>
            Antrian Pasien
            <select name="daftarPoliId" required>
              <option value="">Pilih Antrian</option>
              {antrianForCreate.map((a) => (
                <option key={a.id} value={a.id}>
                  #{a.noAntrian} | {a.pasien.user.name} | Dr. {a.jadwal.dokter.user.name} ({a.jadwal.poli.namaPoli}) | {a.jadwal.hari}
                </option>
              ))}
            </select>
          </label>
          <label>Tanggal Periksa<input type="datetime-local" name="tglPeriksa" required /></label>
          <label>Catatan<textarea name="catatan" rows={3} /></label>
          <label>Biaya Periksa<input name="biayaPeriksa" type="number" min={0} step={1} required /></label>
          <label>
            Obat (boleh lebih dari satu)
            <select name="obatIds" multiple>
              {obats.map((o) => (
                <option key={o.id} value={o.id}>{o.namaObat} ({o.harga.toLocaleString("id-ID")})</option>
              ))}
            </select>
          </label>
          <FormSubmitButton idleLabel="Simpan" pendingLabel="Menyimpan..." />
        </form>
      </section>

      <section>
        <h3>Daftar Pemeriksaan</h3>
        <form action="/admin/pemeriksaan" method="get">
          <input name="q" defaultValue={q} placeholder="Cari pasien/dokter/poli" />
          <input type="hidden" name="pageSize" value={pageSize} />
          <button type="submit">Cari</button>
          <a href={`/admin/pemeriksaan/export?${new URLSearchParams({ q }).toString()}`}>
            Export CSV
          </a>
        </form>

        {periksas.length === 0 ? (
          <EmptyState
            title="Pemeriksaan Belum Ada"
            description="Belum ada data pemeriksaan untuk kriteria pencarian ini."
            icon="ðŸ§ª"
          />
        ) : (
        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th >ID</th>
                <th >Pasien</th>
                <th >Dokter</th>
                <th >Poli</th>
                <th >Antrian</th>
                <th >Tgl Periksa</th>
                <th >Catatan</th>
                <th >Biaya</th>
                <th >Obat</th>
                <th >Edit</th>
                <th >Hapus</th>
              </tr>
            </thead>
            <tbody>
              {periksas.map((p) => (
                  <tr key={p.id}>
                    <td >{p.id}</td>
                    <td >{p.daftarPoli.pasien.user.name}</td>
                    <td >{p.daftarPoli.jadwal.dokter.user.name}</td>
                    <td >{p.daftarPoli.jadwal.poli.namaPoli}</td>
                    <td >#{p.daftarPoli.noAntrian}</td>
                    <td >{new Date(p.tglPeriksa).toLocaleString("id-ID")}</td>
                    <td >{p.catatan ?? "-"}</td>
                    <td >{p.biayaPeriksa.toLocaleString("id-ID")}</td>
                    <td >{p.details.map((d) => d.obat.namaObat).join(", ") || "-"}</td>
                    <td >
                      <form action={updatePeriksaAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          name="tglPeriksa"
                          type="datetime-local"
                          defaultValue={new Date(p.tglPeriksa).toISOString().slice(0, 16)}
                          required
                        />
                        <textarea name="catatan" defaultValue={p.catatan ?? ""} rows={2} />
                        <input name="biayaPeriksa" type="number" min={0} step={1} defaultValue={p.biayaPeriksa} required />
                        <select
                          name="obatIds"
                          multiple
                          defaultValue={p.details.map((d) => String(d.obatId))}
                        >
                          {obats.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.namaObat}
                            </option>
                          ))}
                        </select>
                        <FormSubmitButton idleLabel="Update" pendingLabel="Mengupdate..." />
                      </form>
                    </td>
                    <td >
                      <form action={deletePeriksaAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmSubmitButton type="submit" confirmMessage="Hapus pemeriksaan ini?">
                          Hapus
                        </ConfirmSubmitButton>
                      </form>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        )}
        <PaginationLinks basePath="/admin/pemeriksaan" page={page} pageSize={pageSize} total={total} query={{ q }} />
      </section>
    </main>
  );
}



