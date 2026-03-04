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
    pasienId?: string;
    jadwalId?: string;
    status?: string;
    page?: string;
    pageSize?: string;
  }>;
};

const statusList: DaftarPoliStatus[] = [
  DaftarPoliStatus.MENUNGGU,
  DaftarPoliStatus.DIPANGGIL,
  DaftarPoliStatus.SELESAI,
  DaftarPoliStatus.BATAL,
];

export default async function AdminAntrianPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const pasienIdFilter = Number(params?.pasienId ?? 0);
  const jadwalIdFilter = Number(params?.jadwalId ?? 0);
  const statusFilter = (params?.status ?? "").trim();
  const page = Math.max(1, Number(params?.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(params?.pageSize ?? 10) || 10));

  const pasiens = await prisma.pasien.findMany({
    orderBy: { id: "desc" },
    include: { user: { select: { name: true } } },
  });
  const jadwals = await prisma.jadwalPeriksa.findMany({
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
    include: {
      dokter: { include: { user: { select: { name: true } } } },
      poli: { select: { namaPoli: true } },
    },
  });

  const whereClause: { pasienId?: number; jadwalId?: number; status?: DaftarPoliStatus } = {};
  if (pasienIdFilter > 0) whereClause.pasienId = pasienIdFilter;
  if (jadwalIdFilter > 0) whereClause.jadwalId = jadwalIdFilter;
  if (statusFilter && statusList.includes(statusFilter as DaftarPoliStatus)) {
    whereClause.status = statusFilter as DaftarPoliStatus;
  }

  const total = await prisma.daftarPoli.count({ where: whereClause });
  const daftarList = await prisma.daftarPoli.findMany({
    where: whereClause,
    orderBy: [{ createdAt: "desc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      pasien: { include: { user: { select: { name: true } } } },
      jadwal: {
        include: {
          dokter: { include: { user: { select: { name: true } } } },
          poli: { select: { namaPoli: true } },
        },
      },
      periksa: { select: { id: true } },
    },
  });

  async function createAntrianAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const pasienId = Number(formData.get("pasienId"));
    const jadwalId = Number(formData.get("jadwalId"));
    const keluhan = String(formData.get("keluhan") ?? "").trim();
    if (!Number.isInteger(pasienId) || !Number.isInteger(jadwalId) || !keluhan) {
      redirect("/admin/antrian?err=Input%20antrian%20tidak%20valid");
    }

    const last = await prisma.daftarPoli.findFirst({
      where: { jadwalId },
      orderBy: { noAntrian: "desc" },
      select: { noAntrian: true },
    });
    const noAntrian = (last?.noAntrian ?? 0) + 1;

    await prisma.daftarPoli.create({
      data: { pasienId, jadwalId, keluhan, noAntrian, status: DaftarPoliStatus.MENUNGGU },
    });
    revalidatePath("/admin/antrian");
    redirect("/admin/antrian?msg=Antrian%20berhasil%20ditambahkan");
  }

  async function updateAntrianAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    const status = String(formData.get("status") ?? "") as DaftarPoliStatus;
    const keluhan = String(formData.get("keluhan") ?? "").trim();
    if (!Number.isInteger(id) || !statusList.includes(status) || !keluhan) {
      redirect("/admin/antrian?err=Data%20antrian%20tidak%20valid");
    }

    await prisma.daftarPoli.update({ where: { id }, data: { status, keluhan } });
    revalidatePath("/admin/antrian");
    redirect("/admin/antrian?msg=Antrian%20berhasil%20diupdate");
  }

  async function cancelAntrianAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) redirect("/admin/antrian?err=ID%20antrian%20tidak%20valid");
    await prisma.daftarPoli.update({ where: { id }, data: { status: DaftarPoliStatus.BATAL } });
    revalidatePath("/admin/antrian");
    redirect("/admin/antrian?msg=Antrian%20dibatalkan");
  }

  async function deleteAntrianAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) redirect("/admin/antrian?err=ID%20antrian%20tidak%20valid");

    const data = await prisma.daftarPoli.findUnique({ where: { id }, include: { periksa: { select: { id: true } } } });
    if (!data) redirect("/admin/antrian?err=Antrian%20tidak%20ditemukan");
    if (data.periksa) redirect("/admin/antrian?err=Antrian%20sudah%20punya%20pemeriksaan,%20tidak%20bisa%20dihapus");

    await prisma.daftarPoli.delete({ where: { id } });
    revalidatePath("/admin/antrian");
    redirect("/admin/antrian?msg=Antrian%20berhasil%20dihapus");
  }

  return (
    <main>
      <h1>Kelola Antrian</h1>
      {msg ? <p>{msg}</p> : null}
      {err ? <p>{err}</p> : null}

      <section>
        <h3>Tambah Antrian</h3>
        <form action={createAntrianAction}>
          <label>
            Pasien
            <select name="pasienId" required>
              <option value="">Pilih Pasien</option>
              {pasiens.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user.name} ({p.noRm})
                </option>
              ))}
            </select>
          </label>
          <label>
            Jadwal
            <select name="jadwalId" required>
              <option value="">Pilih Jadwal</option>
              {jadwals.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.hari} {new Date(j.jamMulai).toISOString().slice(11, 16)} - {new Date(j.jamSelesai).toISOString().slice(11, 16)} | Dr. {j.dokter.user.name} ({j.poli.namaPoli})
                </option>
              ))}
            </select>
          </label>
          <label>
            Keluhan
            <textarea name="keluhan" rows={3} required />
          </label>
          <FormSubmitButton idleLabel="Simpan" pendingLabel="Menyimpan..." />
        </form>
      </section>

      <section>
        <h3>Daftar Antrian</h3>
        <form action="/admin/antrian" method="get">
          <select name="pasienId" defaultValue={pasienIdFilter > 0 ? String(pasienIdFilter) : ""}>
            <option value="">Semua Pasien</option>
            {pasiens.map((p) => (
              <option key={p.id} value={p.id}>{p.user.name}</option>
            ))}
          </select>
          <select name="jadwalId" defaultValue={jadwalIdFilter > 0 ? String(jadwalIdFilter) : ""}>
            <option value="">Semua Jadwal</option>
            {jadwals.map((j) => (
              <option key={j.id} value={j.id}>{j.hari} | Dr. {j.dokter.user.name}</option>
            ))}
          </select>
          <select name="status" defaultValue={statusFilter}>
            <option value="">Semua Status</option>
            {statusList.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <input type="hidden" name="pageSize" value={pageSize} />
          <button type="submit">Filter</button>
          <a
            href={`/admin/antrian/export?${new URLSearchParams({
              pasienId: pasienIdFilter > 0 ? String(pasienIdFilter) : "",
              jadwalId: jadwalIdFilter > 0 ? String(jadwalIdFilter) : "",
              status: statusFilter,
            }).toString()}`}
          >
            Export CSV
          </a>
        </form>

        {daftarList.length === 0 ? (
          <EmptyState
            title="Antrian Tidak Ditemukan"
            description="Belum ada data antrian yang sesuai filter saat ini."
            icon="ðŸŽŸï¸"
          />
        ) : (
        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th >ID</th>
                <th >Pasien</th>
                <th >No RM</th>
                <th >Dokter</th>
                <th >Poli</th>
                <th >Jadwal</th>
                <th >No Antrian</th>
                <th >Keluhan</th>
                <th >Status</th>
                <th >Edit</th>
                <th >Aksi</th>
              </tr>
            </thead>
            <tbody>
              {daftarList.map((d) => (
                  <tr key={d.id}>
                    <td >{d.id}</td>
                    <td >{d.pasien.user.name}</td>
                    <td >{d.pasien.noRm}</td>
                    <td >{d.jadwal.dokter.user.name}</td>
                    <td >{d.jadwal.poli.namaPoli}</td>
                    <td >
                      {d.jadwal.hari} {new Date(d.jadwal.jamMulai).toISOString().slice(11, 16)} - {new Date(d.jadwal.jamSelesai).toISOString().slice(11, 16)}
                    </td>
                    <td >{d.noAntrian}</td>
                    <td >{d.keluhan}</td>
                    <td >{d.status}</td>
                    <td >
                      <form action={updateAntrianAction}>
                        <input type="hidden" name="id" value={d.id} />
                        <textarea name="keluhan" defaultValue={d.keluhan} rows={2} />
                        <select name="status" defaultValue={d.status}>
                          {statusList.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <FormSubmitButton idleLabel="Update" pendingLabel="Mengupdate..." />
                      </form>
                    </td>
                    <td >
                      <div>
                        <form action={cancelAntrianAction}>
                          <input type="hidden" name="id" value={d.id} />
                          <ConfirmSubmitButton
                            type="submit"
                            confirmMessage="Batalkan antrian ini?"
                            disabled={d.status === DaftarPoliStatus.BATAL}
                          >
                            Batalkan
                          </ConfirmSubmitButton>
                        </form>
                        <form action={deleteAntrianAction}>
                          <input type="hidden" name="id" value={d.id} />
                          <ConfirmSubmitButton
                            type="submit"
                            confirmMessage="Hapus antrian ini?"
                            disabled={Boolean(d.periksa)}
                          >
                            Hapus
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        )}
        <PaginationLinks
          basePath="/admin/antrian"
          page={page}
          pageSize={pageSize}
          total={total}
          query={{
            pasienId: pasienIdFilter > 0 ? pasienIdFilter : undefined,
            jadwalId: jadwalIdFilter > 0 ? jadwalIdFilter : undefined,
            status: statusFilter,
          }}
        />
      </section>
    </main>
  );
}




