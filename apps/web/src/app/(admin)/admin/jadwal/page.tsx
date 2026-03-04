import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";
import PaginationLinks from "@/components/PaginationLinks";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import EmptyState from "@/components/EmptyState";
import FormSubmitButton from "@/components/FormSubmitButton";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string; dokterId?: string; poliId?: string; hari?: string; page?: string; pageSize?: string }>;
};

function asTimeDate(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`);
}

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;

export default async function AdminJadwalPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const dokterIdFilter = Number(params?.dokterId ?? 0);
  const poliIdFilter = Number(params?.poliId ?? 0);
  const hariFilter = (params?.hari ?? "").trim();
  const page = Math.max(1, Number(params?.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(params?.pageSize ?? 10) || 10));

  const [dokters, polis] = await Promise.all([
    prisma.dokter.findMany({
      orderBy: { id: "desc" },
      include: {
        user: { select: { name: true } },
        dokterPolis: { include: { poli: { select: { id: true, namaPoli: true } } }, orderBy: { poli: { namaPoli: "asc" } } },
      },
    }),
    prisma.poli.findMany({ orderBy: { namaPoli: "asc" } }),
  ]);

  const whereClause: { dokterId?: number; poliId?: number; hari?: string } = {};
  if (dokterIdFilter > 0) whereClause.dokterId = dokterIdFilter;
  if (poliIdFilter > 0) whereClause.poliId = poliIdFilter;
  if (hariFilter) whereClause.hari = hariFilter;

  const total = await prisma.jadwalPeriksa.count({ where: whereClause });
  const jadwals = await prisma.jadwalPeriksa.findMany({
    where: whereClause,
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      dokter: {
        include: {
          user: { select: { name: true } },
          _count: { select: { jadwals: true } },
        },
      },
      poli: { select: { id: true, namaPoli: true } },
      _count: { select: { daftarPolis: true } },
    },
  });

  async function createJadwalAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);

    const dokterId = Number(formData.get("dokterId"));
    const poliId = Number(formData.get("poliId"));
    const hari = String(formData.get("hari") ?? "");
    const jamMulaiText = String(formData.get("jamMulai") ?? "");
    const jamSelesaiText = String(formData.get("jamSelesai") ?? "");
    if (!Number.isInteger(dokterId) || dokterId <= 0 || !Number.isInteger(poliId) || poliId <= 0 || !hari || !jamMulaiText || !jamSelesaiText) {
      redirect("/admin/jadwal?err=Input%20jadwal%20tidak%20valid");
    }

    const mapped = await prisma.dokterPoli.findUnique({ where: { dokterId_poliId: { dokterId, poliId } } });
    if (!mapped) redirect("/admin/jadwal?err=Dokter%20tidak%20terkait%20dengan%20poli%20tersebut");

    const jamMulai = asTimeDate(jamMulaiText);
    const jamSelesai = asTimeDate(jamSelesaiText);
    if (jamMulai >= jamSelesai) redirect("/admin/jadwal?err=Jam%20mulai%20harus%20lebih%20awal");

    const bentrok = await prisma.jadwalPeriksa.findFirst({
      where: {
        dokterId,
        hari,
        AND: [{ jamMulai: { lt: jamSelesai } }, { jamSelesai: { gt: jamMulai } }],
      },
    });
    if (bentrok) redirect("/admin/jadwal?err=Jadwal%20dokter%20bentrok");

    await prisma.jadwalPeriksa.create({ data: { dokterId, poliId, hari, jamMulai, jamSelesai } });
    revalidatePath("/admin/jadwal");
    redirect("/admin/jadwal?msg=Jadwal%20berhasil%20ditambahkan");
  }

  async function updateJadwalAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    const dokterId = Number(formData.get("dokterId"));
    const poliId = Number(formData.get("poliId"));
    const hari = String(formData.get("hari") ?? "");
    const jamMulaiText = String(formData.get("jamMulai") ?? "");
    const jamSelesaiText = String(formData.get("jamSelesai") ?? "");
    if (!Number.isInteger(id) || !Number.isInteger(dokterId) || !Number.isInteger(poliId) || !hari || !jamMulaiText || !jamSelesaiText) {
      redirect("/admin/jadwal?err=Data%20edit%20jadwal%20tidak%20valid");
    }

    const mapped = await prisma.dokterPoli.findUnique({ where: { dokterId_poliId: { dokterId, poliId } } });
    if (!mapped) redirect("/admin/jadwal?err=Dokter%20tidak%20terkait%20dengan%20poli%20tersebut");

    const jamMulai = asTimeDate(jamMulaiText);
    const jamSelesai = asTimeDate(jamSelesaiText);
    if (jamMulai >= jamSelesai) redirect("/admin/jadwal?err=Jam%20mulai%20harus%20lebih%20awal");

    const bentrok = await prisma.jadwalPeriksa.findFirst({
      where: {
        dokterId,
        hari,
        id: { not: id },
        AND: [{ jamMulai: { lt: jamSelesai } }, { jamSelesai: { gt: jamMulai } }],
      },
    });
    if (bentrok) redirect("/admin/jadwal?err=Jadwal%20dokter%20bentrok");

    await prisma.jadwalPeriksa.update({ where: { id }, data: { dokterId, poliId, hari, jamMulai, jamSelesai } });
    revalidatePath("/admin/jadwal");
    redirect("/admin/jadwal?msg=Jadwal%20berhasil%20diupdate");
  }

  async function deleteJadwalAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) redirect("/admin/jadwal?err=Data%20hapus%20jadwal%20tidak%20valid");

    const jadwal = await prisma.jadwalPeriksa.findUnique({
      where: { id },
      include: { _count: { select: { daftarPolis: true } } },
    });
    if (!jadwal) redirect("/admin/jadwal?err=Jadwal%20tidak%20ditemukan");
    if (jadwal._count.daftarPolis > 0) redirect("/admin/jadwal?err=Jadwal%20sudah%20dipakai%20antrian,%20tidak%20bisa%20dihapus");

    await prisma.jadwalPeriksa.delete({ where: { id } });
    revalidatePath("/admin/jadwal");
    redirect("/admin/jadwal?msg=Jadwal%20berhasil%20dihapus");
  }

  return (
    <main>
      <h1>Kelola Jadwal Periksa</h1>
      {msg ? <p>{msg}</p> : null}
      {err ? <p>{err}</p> : null}

      <section>
        <h3>Tambah Jadwal</h3>
        <form action={createJadwalAction}>
          <label>
            Dokter
            <select name="dokterId" required>
              <option value="">Pilih Dokter</option>
              {dokters.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.user.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Poli
            <select name="poliId" required>
              <option value="">Pilih Poli</option>
              {polis.map((p) => (
                <option key={p.id} value={p.id}>{p.namaPoli}</option>
              ))}
            </select>
          </label>
          <label>
            Hari
            <select name="hari" required>
              <option value="">Pilih Hari</option>
              {days.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </label>
          <label>Jam Mulai<input type="time" name="jamMulai" required /></label>
          <label>Jam Selesai<input type="time" name="jamSelesai" required /></label>
          <FormSubmitButton idleLabel="Simpan" pendingLabel="Menyimpan..." />
        </form>
      </section>

      <section>
        <h3>Daftar Jadwal</h3>
        <form action="/admin/jadwal" method="get">
          <select name="dokterId" defaultValue={dokterIdFilter > 0 ? String(dokterIdFilter) : ""}>
            <option value="">Semua Dokter</option>
            {dokters.map((d) => (
              <option key={d.id} value={d.id}>{d.user.name}</option>
            ))}
          </select>
          <select name="poliId" defaultValue={poliIdFilter > 0 ? String(poliIdFilter) : ""}>
            <option value="">Semua Poli</option>
            {polis.map((p) => (
              <option key={p.id} value={p.id}>{p.namaPoli}</option>
            ))}
          </select>
          <select name="hari" defaultValue={hariFilter}>
            <option value="">Semua Hari</option>
            {days.map((day) => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
          <input type="hidden" name="pageSize" value={pageSize} />
          <button type="submit">Filter</button>
          <a
            href={`/admin/jadwal/export?${new URLSearchParams({
              dokterId: dokterIdFilter > 0 ? String(dokterIdFilter) : "",
              poliId: poliIdFilter > 0 ? String(poliIdFilter) : "",
              hari: hariFilter,
            }).toString()}`}
          >
            Export CSV
          </a>
        </form>

        {jadwals.length === 0 ? (
          <EmptyState
            title="Jadwal Tidak Ditemukan"
            description="Belum ada jadwal yang sesuai dengan filter dokter/hari."
            icon="J"
          />
        ) : (
        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th >ID</th>
                <th >Dokter</th>
                <th >Poli</th>
                <th >Hari</th>
                <th >Jam Mulai</th>
                <th >Jam Selesai</th>
                <th >Antrian</th>
                <th >Edit</th>
                <th >Hapus</th>
              </tr>
            </thead>
            <tbody>
              {jadwals.map((j) => (
                  <tr key={j.id}>
                    <td >{j.id}</td>
                    <td >{j.dokter.user.name}</td>
                    <td >{j.poli.namaPoli}</td>
                    <td >{j.hari}</td>
                    <td >{new Date(j.jamMulai).toISOString().slice(11, 16)}</td>
                    <td >{new Date(j.jamSelesai).toISOString().slice(11, 16)}</td>
                    <td >{j._count.daftarPolis}</td>
                    <td >
                      <form action={updateJadwalAction}>
                        <input type="hidden" name="id" value={j.id} />
                        <select name="dokterId" defaultValue={String(j.dokterId)} required>
                          {dokters.map((d) => (
                            <option key={d.id} value={d.id}>{d.user.name}</option>
                          ))}
                        </select>
                        <select name="poliId" defaultValue={String(j.poliId)} required>
                          {polis.map((p) => (
                            <option key={p.id} value={p.id}>{p.namaPoli}</option>
                          ))}
                        </select>
                        <select name="hari" defaultValue={j.hari} required>
                          {days.map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                        <input name="jamMulai" type="time" defaultValue={new Date(j.jamMulai).toISOString().slice(11, 16)} required />
                        <input name="jamSelesai" type="time" defaultValue={new Date(j.jamSelesai).toISOString().slice(11, 16)} required />
                        <FormSubmitButton idleLabel="Update" pendingLabel="Mengupdate..." />
                      </form>
                    </td>
                    <td >
                      <form action={deleteJadwalAction}>
                        <input type="hidden" name="id" value={j.id} />
                        <ConfirmSubmitButton type="submit" confirmMessage="Hapus jadwal ini?">
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
        <PaginationLinks
          basePath="/admin/jadwal"
          page={page}
          pageSize={pageSize}
          total={total}
          query={{ dokterId: dokterIdFilter > 0 ? dokterIdFilter : undefined, poliId: poliIdFilter > 0 ? poliIdFilter : undefined, hari: hariFilter }}
        />
      </section>
    </main>
  );
}
