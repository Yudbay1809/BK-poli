import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { DaftarPoliStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { getCurrentDokterContext } from "@/lib/current-dokter";
import EmptyState from "@/components/EmptyState";
import FormSubmitButton from "@/components/FormSubmitButton";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string; q?: string; poliId?: string; status?: string }>;
};

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

const statusOptions = [DaftarPoliStatus.MENUNGGU, DaftarPoliStatus.DIPANGGIL, DaftarPoliStatus.SELESAI] as const;

export default async function DokterPage({ searchParams }: PageProps) {
  const { dokter } = await getCurrentDokterContext();
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const q = (params?.q ?? "").trim();
  const poliIdFilter = Number(params?.poliId ?? 0);
  const statusFilter = (params?.status ?? "").trim() as DaftarPoliStatus | "";

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
  const todayName = dayNames[new Date().getDay()];

  const poliOptions = dokter.dokterPolis.map((dp) => dp.poli).sort((a, b) => a.namaPoli.localeCompare(b.namaPoli));

  const jadwalsToday = await prisma.jadwalPeriksa.findMany({
    where: {
      dokterId: dokter.id,
      hari: { contains: todayName, mode: "insensitive" },
    },
    orderBy: [{ jamMulai: "asc" }],
    include: { poli: { select: { id: true, namaPoli: true } } },
  });

  const jadwalIds = jadwalsToday.map((j) => j.id);
  const queueWhere: {
    jadwalId?: { in: number[] };
    status?: { in: DaftarPoliStatus[] } | DaftarPoliStatus;
    pasien?: { user?: { name?: { contains: string; mode: "insensitive" } } };
    jadwal?: { poliId?: number };
  } = {};

  if (jadwalIds.length) {
    queueWhere.jadwalId = { in: jadwalIds };
  }

  if (statusFilter && (statusOptions as readonly DaftarPoliStatus[]).includes(statusFilter)) {
    queueWhere.status = statusFilter;
  } else {
    queueWhere.status = { in: [DaftarPoliStatus.MENUNGGU, DaftarPoliStatus.DIPANGGIL] };
  }

  if (q) {
    queueWhere.pasien = { user: { name: { contains: q, mode: "insensitive" } } };
  }

  if (poliIdFilter > 0) {
    queueWhere.jadwal = { poliId: poliIdFilter };
  }

  const activeQueues = jadwalIds.length
    ? await prisma.daftarPoli.findMany({
        where: queueWhere,
        orderBy: [{ status: "asc" }, { noAntrian: "asc" }],
        include: {
          pasien: { include: { user: { select: { name: true, email: true } } } },
          jadwal: {
            include: {
              poli: { select: { namaPoli: true } },
            },
          },
          periksa: { include: { details: { include: { obat: true } } } },
        },
      })
    : [];

  const obats = await prisma.obat.findMany({ orderBy: { namaObat: "asc" } });

  const [totalQueueToday, totalSelesaiToday] = jadwalIds.length
    ? await Promise.all([
        prisma.daftarPoli.count({ where: { jadwalId: { in: jadwalIds } } }),
        prisma.daftarPoli.count({ where: { jadwalId: { in: jadwalIds }, status: DaftarPoliStatus.SELESAI } }),
      ])
    : [0, 0];

  const riwayat = await prisma.periksa.findMany({
    where: { daftarPoli: { jadwal: { dokterId: dokter.id } } },
    orderBy: { tglPeriksa: "desc" },
    take: 20,
    include: {
      daftarPoli: {
        include: {
          pasien: { include: { user: { select: { name: true } } } },
          jadwal: { include: { poli: { select: { namaPoli: true } } } },
        },
      },
      details: { include: { obat: true } },
    },
  });

  async function updateStatusAction(formData: FormData) {
    "use server";

    const { dokter } = await getCurrentDokterContext();
    const daftarId = Number(formData.get("daftarId"));
    const nextStatus = String(formData.get("status") ?? "") as DaftarPoliStatus;

    if (!Number.isInteger(daftarId) || daftarId <= 0 || !(statusOptions as readonly DaftarPoliStatus[]).includes(nextStatus)) {
      redirect("/dokter?err=Status%20antrian%20tidak%20valid");
    }

    const daftar = await prisma.daftarPoli.findUnique({
      where: { id: daftarId },
      include: { jadwal: { select: { dokterId: true } }, periksa: { select: { id: true } } },
    });

    if (!daftar || daftar.jadwal.dokterId !== dokter.id) {
      redirect("/dokter?err=Antrian%20tidak%20ditemukan");
    }

    if (nextStatus === DaftarPoliStatus.SELESAI && !daftar.periksa) {
      redirect("/dokter?err=Isi%20pemeriksaan%20sebelum%20menandai%20selesai");
    }

    await prisma.daftarPoli.update({
      where: { id: daftarId },
      data: { status: nextStatus },
    });

    revalidatePath("/dokter");
    redirect("/dokter?msg=Status%20antrian%20diperbarui");
  }

  async function savePeriksaAction(formData: FormData) {
    "use server";

    const { dokter } = await getCurrentDokterContext();
    const daftarPoliId = Number(formData.get("daftarPoliId"));
    const catatan = String(formData.get("catatan") ?? "").trim();
    const biayaPeriksa = Number(formData.get("biayaPeriksa"));
    const obatIds = formData
      .getAll("obatIds")
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0);

    if (!Number.isInteger(daftarPoliId) || daftarPoliId <= 0 || !Number.isFinite(biayaPeriksa) || biayaPeriksa < 0) {
      redirect("/dokter?err=Input%20pemeriksaan%20tidak%20valid");
    }

    const daftar = await prisma.daftarPoli.findUnique({
      where: { id: daftarPoliId },
      include: { jadwal: { select: { dokterId: true } } },
    });
    if (!daftar || daftar.jadwal.dokterId !== dokter.id) {
      redirect("/dokter?err=Antrian%20tidak%20ditemukan");
    }

    await prisma.$transaction(async (tx) => {
      const existing = await tx.periksa.findUnique({ where: { daftarPoliId } });
      if (!existing) {
        const periksa = await tx.periksa.create({
          data: {
            daftarPoliId,
            tglPeriksa: new Date(),
            catatan: catatan || null,
            biayaPeriksa: Math.round(biayaPeriksa),
          },
        });
        if (obatIds.length > 0) {
          await tx.detailPeriksa.createMany({
            data: obatIds.map((obatId) => ({ periksaId: periksa.id, obatId })),
          });
        }
      } else {
        await tx.periksa.update({
          where: { id: existing.id },
          data: {
            catatan: catatan || null,
            biayaPeriksa: Math.round(biayaPeriksa),
          },
        });
        await tx.detailPeriksa.deleteMany({ where: { periksaId: existing.id } });
        if (obatIds.length > 0) {
          await tx.detailPeriksa.createMany({
            data: obatIds.map((obatId) => ({ periksaId: existing.id, obatId })),
          });
        }
      }

      await tx.daftarPoli.update({
        where: { id: daftarPoliId },
        data: { status: DaftarPoliStatus.SELESAI },
      });
    });

    revalidatePath("/dokter");
    redirect("/dokter?msg=Pemeriksaan%20berhasil%20disimpan");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Dokter Dashboard</h1>
      <p className="app-subtitle">Jadwal hari ini, antrean aktif, input pemeriksaan, dan riwayat pasien.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/dokter/profil">Profil Dokter</Link>
      </div>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="stats-grid">
        <Card title="Jadwal Hari Ini" value={String(jadwalsToday.length)} />
        <Card title="Antrean Hari Ini" value={String(totalQueueToday)} />
        <Card title="Selesai Hari Ini" value={String(totalSelesaiToday)} />
      </section>

      <section className="flow-sm">
        <h3>Jadwal Dokter Hari Ini ({todayName})</h3>
        {jadwalsToday.length === 0 ? (
          <EmptyState
            title="Belum Ada Jadwal Hari Ini"
            description="Jadwal praktik Anda akan muncul di sini."
            icon="J"
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th>Poli</th>
                  <th>Jam Praktik</th>
                </tr>
              </thead>
              <tbody>
                {jadwalsToday.map((j) => (
                  <tr key={j.id}>
                    <td>{j.poli.namaPoli}</td>
                    <td>{formatTime(j.jamMulai)} - {formatTime(j.jamSelesai)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flow-sm">
        <h3>Filter Antrean</h3>
        <form action="/dokter" method="get" className="form-toolbar">
          <input name="q" defaultValue={q} placeholder="Cari nama pasien" />
          <select name="poliId" defaultValue={poliIdFilter > 0 ? String(poliIdFilter) : ""}>
            <option value="">Semua Poli</option>
            {poliOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.namaPoli}</option>
            ))}
          </select>
          <select name="status" defaultValue={statusFilter}>
            <option value="">Aktif (Menunggu/Dipanggil)</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button type="submit">Terapkan</button>
        </form>
      </section>

      <section className="flow-sm">
        <h3>Antrean Aktif</h3>
        {activeQueues.length === 0 ? (
          <EmptyState
            title="Antrean Kosong"
            description="Belum ada pasien yang mendaftar di jadwal Anda hari ini."
            icon="A"
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 980 }}>
              <thead>
                <tr>
                  <th>No</th>
                  <th>Pasien</th>
                  <th>Poli</th>
                  <th>Jadwal</th>
                  <th>Keluhan</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {activeQueues.map((q) => (
                  <tr key={q.id}>
                    <td>#{q.noAntrian}</td>
                    <td>{q.pasien.user.name}</td>
                    <td>{q.jadwal.poli.namaPoli}</td>
                    <td>{q.jadwal.hari} {formatTime(q.jadwal.jamMulai)}-{formatTime(q.jadwal.jamSelesai)}</td>
                    <td>{q.keluhan}</td>
                    <td>{q.status}</td>
                    <td>
                      <form action={updateStatusAction} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <input type="hidden" name="daftarId" value={q.id} />
                        <select name="status" defaultValue={q.status}>
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <FormSubmitButton idleLabel="Update" pendingLabel="Memproses..." />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flow-sm">
        <h3>Input Pemeriksaan</h3>
        {activeQueues.length === 0 ? (
          <p>Tidak ada antrean aktif untuk diperiksa.</p>
        ) : (
          <form action={savePeriksaAction} className="form-layout" style={{ maxWidth: 820 }}>
            <label className="form-field">
              Pilih Antrian
              <select name="daftarPoliId" required>
                <option value="">Pilih Antrian</option>
                {activeQueues.map((q) => (
                  <option key={q.id} value={q.id}>
                    #{q.noAntrian} | {q.pasien.user.name} | {q.jadwal.poli.namaPoli} | {q.jadwal.hari}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              Catatan Dokter
              <textarea name="catatan" rows={3} />
            </label>
            <label className="form-field">
              Biaya Periksa
              <input name="biayaPeriksa" type="number" min={0} step={1} required />
            </label>
            <label className="form-field">
              Obat (boleh lebih dari satu)
              <select name="obatIds" multiple>
                {obats.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.namaObat} ({o.harga.toLocaleString("id-ID")})
                  </option>
                ))}
              </select>
            </label>
            <FormSubmitButton idleLabel="Simpan Pemeriksaan" pendingLabel="Menyimpan..." />
          </form>
        )}
      </section>

      <section className="flow-sm">
        <h3>Riwayat Pemeriksaan Terakhir</h3>
        {riwayat.length === 0 ? (
          <EmptyState
            title="Belum Ada Riwayat"
            description="Riwayat pemeriksaan akan muncul setelah Anda menangani pasien."
            icon="R"
          />
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 980 }}>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Pasien</th>
                  <th>Poli</th>
                  <th>Biaya</th>
                  <th>Catatan</th>
                  <th>Obat</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.map((r) => (
                  <tr key={r.id}>
                    <td>{new Date(r.tglPeriksa).toLocaleString("id-ID")}</td>
                    <td>{r.daftarPoli.pasien.user.name}</td>
                    <td>{r.daftarPoli.jadwal.poli.namaPoli}</td>
                    <td>{r.biayaPeriksa.toLocaleString("id-ID")}</td>
                    <td>{r.catatan ?? "-"}</td>
                    <td>{r.details.map((d) => d.obat.namaObat).join(", ") || "-"}</td>
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

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="stats-card">
      <div className="stats-label">{title}</div>
      <div className="stats-value">{value}</div>
    </div>
  );
}
