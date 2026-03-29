import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Role } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { getCurrentPasienContext } from "@/lib/current-user";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

export default async function PasienRiwayatDetailPage({ params, searchParams }: PageProps) {
  const { pasien } = await getCurrentPasienContext();
  const { id } = await params;
  const query = searchParams ? await searchParams : undefined;
  const msg = query?.msg;
  const err = query?.err;
  const daftarId = Number(id);
  if (!Number.isInteger(daftarId) || daftarId <= 0) {
    redirect("/pasien/riwayat?err=Data%20riwayat%20tidak%20valid");
  }

  const data = await prisma.daftarPoli.findFirst({
    where: { id: daftarId, pasienId: pasien.id },
    include: {
      jadwal: {
        include: {
          poli: { select: { namaPoli: true } },
          dokter: { include: { user: { select: { name: true } } } },
        },
      },
      periksa: {
        include: {
          details: { include: { obat: true } },
          documents: true,
          consultation: {
            include: {
              messages: {
                orderBy: { createdAt: "asc" },
                include: { sender: { select: { name: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!data) {
    redirect("/pasien/riwayat?err=Riwayat%20tidak%20ditemukan");
  }

  async function sendMessageAction(formData: FormData) {
    "use server";
    const { pasien } = await getCurrentPasienContext();
    const periksaId = Number(formData.get("periksaId"));
    const message = String(formData.get("message") ?? "").trim();
    if (!Number.isInteger(periksaId) || periksaId <= 0 || !message) {
      redirect(`/pasien/riwayat/${daftarId}?err=Pesan%20tidak%20valid`);
    }

    const periksa = await prisma.periksa.findFirst({
      where: { id: periksaId, daftarPoli: { pasienId: pasien.id } },
    });
    if (!periksa) {
      redirect(`/pasien/riwayat/${daftarId}?err=Data%20pemeriksaan%20tidak%20ditemukan`);
    }

    const consultation = await prisma.consultation.upsert({
      where: { periksaId },
      update: { status: "OPEN" },
      create: { periksaId, status: "OPEN" },
    });

    await prisma.consultationMessage.create({
      data: {
        consultationId: consultation.id,
        senderRole: Role.PASIEN,
        senderUserId: pasien.userId,
        message,
      },
    });

    revalidatePath(`/pasien/riwayat/${daftarId}`);
    redirect(`/pasien/riwayat/${daftarId}?msg=Pesan%20terkirim`);
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Detail Pemeriksaan</h1>
      <p className="app-subtitle">Ringkasan pemeriksaan dan rekomendasi dokter.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Informasi Kunjungan</h3>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 760 }}>
            <tbody>
              <tr>
                <th>Poli</th>
                <td>{data.jadwal.poli.namaPoli}</td>
              </tr>
              <tr>
                <th>Dokter</th>
                <td>{data.jadwal.dokter.user.name}</td>
              </tr>
              <tr>
                <th>Jadwal</th>
                <td>
                  {data.jadwal.hari} {new Date(data.jadwal.jamMulai).toISOString().slice(11, 16)}-
                  {new Date(data.jadwal.jamSelesai).toISOString().slice(11, 16)}
                </td>
              </tr>
              <tr>
                <th>No Antrian</th>
                <td>{data.noAntrian}</td>
              </tr>
              <tr>
                <th>Keluhan</th>
                <td>{data.keluhan}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>{data.status}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="flow-sm">
        <h3>Hasil Pemeriksaan</h3>
        {!data.periksa ? (
          <p>Belum ada hasil pemeriksaan untuk kunjungan ini.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 760 }}>
              <tbody>
                <tr>
                  <th>Tanggal Periksa</th>
                  <td>{new Date(data.periksa.tglPeriksa).toLocaleString("id-ID")}</td>
                </tr>
                <tr>
                  <th>Catatan Dokter</th>
                  <td>{data.periksa.catatan ?? "-"}</td>
                </tr>
                <tr>
                  <th>Biaya Periksa</th>
                  <td>{data.periksa.biayaPeriksa.toLocaleString("id-ID")}</td>
                </tr>
                <tr>
                  <th>Obat</th>
                  <td>
                    {data.periksa.details.length
                      ? data.periksa.details.map((d) => d.obat.namaObat).join(", ")
                      : "-"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data.periksa ? (
        <section className="flow-sm">
          <h3>Dokumen Pemeriksaan</h3>
          {data.periksa.documents.length === 0 ? (
            <p>Belum ada dokumen pemeriksaan yang diunggah.</p>
          ) : (
            <ul className="quick-list">
              {data.periksa.documents.map((doc) => (
                <li key={doc.id}>
                  <a href={doc.filePath} target="_blank" rel="noreferrer">
                    {doc.title ?? doc.fileName}
                  </a>
                  {doc.category ? ` (${doc.category})` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {data.periksa ? (
        <section className="flow-sm">
          <h3>Konsultasi Lanjutan</h3>
          {data.periksa.consultation?.messages.length ? (
            <div className="flow-sm">
              {data.periksa.consultation.messages.map((msg) => (
                <div key={msg.id} className="notice-info">
                  <strong>{msg.sender?.name ?? msg.senderRole}</strong>
                  <p>{msg.message}</p>
                  <small>{new Date(msg.createdAt).toLocaleString("id-ID")}</small>
                </div>
              ))}
            </div>
          ) : (
            <p>Belum ada pesan konsultasi. Anda bisa bertanya kepada dokter melalui form di bawah.</p>
          )}
          <form action={sendMessageAction} className="form-layout" style={{ maxWidth: 760 }}>
            <input type="hidden" name="periksaId" value={data.periksa.id} />
            <label className="form-field">
              Pesan untuk Dokter
              <textarea name="message" rows={3} required />
            </label>
            <button type="submit">Kirim Pesan</button>
          </form>
        </section>
      ) : null}

      <Link href="/pasien/riwayat">Kembali ke Riwayat</Link>
    </main>
  );
}
