import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentPasienContext } from "@/lib/current-user";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PasienRiwayatDetailPage({ params }: PageProps) {
  const { pasien } = await getCurrentPasienContext();
  const { id } = await params;
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
        },
      },
    },
  });

  if (!data) {
    redirect("/pasien/riwayat?err=Riwayat%20tidak%20ditemukan");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Detail Pemeriksaan</h1>
      <p className="app-subtitle">Ringkasan pemeriksaan dan rekomendasi dokter.</p>

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

      <Link href="/pasien/riwayat">Kembali ke Riwayat</Link>
    </main>
  );
}
