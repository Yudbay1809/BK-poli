import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DaftarPoliStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { getCurrentPasienContext } from "@/lib/current-user";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import EmptyState from "@/components/EmptyState";
import FormSubmitButton from "@/components/FormSubmitButton";

type PageProps = {
  searchParams?: Promise<{
    msg?: string;
    err?: string;
    poliId?: string;
    q?: string;
    hari?: string;
  }>;
};

export default async function PasienDaftarPoliPage({ searchParams }: PageProps) {
  const { pasien } = await getCurrentPasienContext();
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const poliIdFilter = Number(params?.poliId ?? 0);
  const q = (params?.q ?? "").trim();
  const hariFilter = (params?.hari ?? "").trim();

  const polis = await prisma.poli.findMany({ orderBy: { namaPoli: "asc" } });
  const whereJadwal: {
    dokter?: { user?: { name?: { contains: string; mode: "insensitive" } } };
    poliId?: number;
    hari?: { contains: string; mode: "insensitive" };
  } = {};
  if (poliIdFilter > 0) {
    whereJadwal.poliId = poliIdFilter;
  }
  if (q) {
    whereJadwal.dokter = {
      ...(whereJadwal.dokter ?? {}),
      user: { name: { contains: q, mode: "insensitive" } },
    };
  }
  if (hariFilter) {
    whereJadwal.hari = { contains: hariFilter, mode: "insensitive" };
  }

  const jadwals = await prisma.jadwalPeriksa.findMany({
    where: Object.keys(whereJadwal).length > 0 ? whereJadwal : undefined,
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
    include: {
      dokter: { include: { user: { select: { name: true } } } },
      poli: { select: { namaPoli: true } },
      _count: { select: { daftarPolis: true } },
    },
  });

  const myDaftars = await prisma.daftarPoli.findMany({
    where: { pasienId: pasien.id },
    orderBy: { createdAt: "desc" },
    include: {
      jadwal: {
        include: {
          dokter: { include: { user: { select: { name: true } } } },
          poli: { select: { namaPoli: true } },
        },
      },
      periksa: { select: { id: true } },
    },
    take: 50,
  });

  const dipanggilCount = myDaftars.filter((d) => d.status === DaftarPoliStatus.DIPANGGIL).length;

  async function createDaftarAction(formData: FormData) {
    "use server";
    const { pasien } = await getCurrentPasienContext();
    const jadwalId = Number(formData.get("jadwalId"));
    const keluhan = String(formData.get("keluhan") ?? "").trim();
    if (!Number.isInteger(jadwalId) || jadwalId <= 0 || !keluhan) {
      redirect("/pasien/daftar-poli?err=Input%20pendaftaran%20tidak%20valid");
    }

    const existing = await prisma.daftarPoli.findFirst({
      where: {
        pasienId: pasien.id,
        jadwalId,
        status: { in: [DaftarPoliStatus.MENUNGGU, DaftarPoliStatus.DIPANGGIL] },
      },
    });
    if (existing) {
      redirect("/pasien/daftar-poli?err=Anda%20sudah%20punya%20antrian%20aktif%20di%20jadwal%20ini");
    }

    const last = await prisma.daftarPoli.findFirst({
      where: { jadwalId },
      orderBy: { noAntrian: "desc" },
      select: { noAntrian: true },
    });
    const noAntrian = (last?.noAntrian ?? 0) + 1;

    await prisma.daftarPoli.create({
      data: {
        pasienId: pasien.id,
        jadwalId,
        keluhan,
        noAntrian,
        status: DaftarPoliStatus.MENUNGGU,
      },
    });
    revalidatePath("/pasien/daftar-poli");
    redirect("/pasien/daftar-poli?msg=Pendaftaran%20berhasil");
  }

  async function cancelDaftarAction(formData: FormData) {
    "use server";
    const { pasien } = await getCurrentPasienContext();
    const id = Number(formData.get("id"));
    if (!Number.isInteger(id) || id <= 0) redirect("/pasien/daftar-poli?err=Data%20antrian%20tidak%20valid");

    const data = await prisma.daftarPoli.findUnique({ where: { id }, include: { periksa: { select: { id: true } } } });
    if (!data || data.pasienId !== pasien.id) redirect("/pasien/daftar-poli?err=Antrian%20tidak%20ditemukan");
    if (data.periksa) redirect("/pasien/daftar-poli?err=Antrian%20sudah%20diperiksa,%20tidak%20bisa%20dibatalkan");
    if (!( [DaftarPoliStatus.MENUNGGU, DaftarPoliStatus.DIPANGGIL] as DaftarPoliStatus[]).includes(data.status)) {
      redirect("/pasien/daftar-poli?err=Antrian%20tidak%20bisa%20dibatalkan");
    }

    await prisma.daftarPoli.update({ where: { id }, data: { status: DaftarPoliStatus.BATAL } });
    revalidatePath("/pasien/daftar-poli");
    redirect("/pasien/daftar-poli?msg=Antrian%20dibatalkan");
  }

  return (
    <main>
      <h1>Daftar Poli</h1>
      {msg ? <p>{msg}</p> : null}
      {err ? <p>{err}</p> : null}
      {dipanggilCount > 0 ? (
        <p className="notice-error">Ada {dipanggilCount} antrian berstatus DIPANGGIL. Silakan segera menuju poli.</p>
      ) : null}

      <section>
        <h3>Buat Pendaftaran</h3>
        <form action="/pasien/daftar-poli" method="get">
          <label>
            Filter Poli:
            <select name="poliId" defaultValue={poliIdFilter > 0 ? String(poliIdFilter) : ""}>
              <option value="">Semua Poli</option>
              {polis.map((poli) => (
                <option key={poli.id} value={poli.id}>{poli.namaPoli}</option>
              ))}
            </select>
          </label>
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama dokter"
          />
          <input
            name="hari"
            defaultValue={hariFilter}
            placeholder="Cari hari (contoh: Senin)"
          />
          <button type="submit">Filter</button>
        </form>

        <form action={createDaftarAction}>
          <label>
            Pilih Jadwal
            <select name="jadwalId" required>
              <option value="">Pilih Jadwal</option>
              {jadwals.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.poli.namaPoli} | Dr. {j.dokter.user.name} | {j.hari} {new Date(j.jamMulai).toISOString().slice(11, 16)}-{new Date(j.jamSelesai).toISOString().slice(11, 16)} | antrian saat ini: {j._count.daftarPolis}
                </option>
              ))}
            </select>
          </label>
          <label>
            Keluhan
            <textarea name="keluhan" rows={3} required />
          </label>
          <FormSubmitButton idleLabel="Daftar" pendingLabel="Mendaftarkan..." />
        </form>
      </section>

      <section>
        <h3>Antrian Saya</h3>
        {myDaftars.length === 0 ? (
          <EmptyState
            title="Belum Ada Antrian"
            description="Anda belum memiliki antrian. Gunakan form di atas untuk daftar poli."
            icon="ðŸ§¾"
          />
        ) : (
          <div>
          <table className="data-table">
            <thead>
              <tr>
                <th >ID</th>
                <th >Poli</th>
                <th >Dokter</th>
                <th >Jadwal</th>
                <th >No Antrian</th>
                <th >Keluhan</th>
                <th >Status</th>
                <th >Aksi</th>
              </tr>
            </thead>
            <tbody>
              {myDaftars.map((d) => (
                  <tr key={d.id}>
                    <td >{d.id}</td>
                    <td >{d.jadwal.poli.namaPoli}</td>
                    <td >{d.jadwal.dokter.user.name}</td>
                    <td >{d.jadwal.hari} {new Date(d.jadwal.jamMulai).toISOString().slice(11, 16)}-{new Date(d.jadwal.jamSelesai).toISOString().slice(11, 16)}</td>
                    <td >{d.noAntrian}</td>
                    <td >{d.keluhan}</td>
                    <td >{d.status}</td>
                    <td >
                      <form action={cancelDaftarAction}>
                        <input type="hidden" name="id" value={d.id} />
                          <ConfirmSubmitButton
                            type="submit"
                            confirmMessage="Batalkan antrian ini?"
                            disabled={
                              Boolean(d.periksa) ||
                              !( [DaftarPoliStatus.MENUNGGU, DaftarPoliStatus.DIPANGGIL] as DaftarPoliStatus[]).includes(d.status)
                            }
                          >
                            Batalkan
                          </ConfirmSubmitButton>
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



