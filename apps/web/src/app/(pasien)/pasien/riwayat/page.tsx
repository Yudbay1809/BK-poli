import { prisma } from "@/lib/prisma";
import { getCurrentPasienContext } from "@/lib/current-user";
import PaginationLinks from "@/components/PaginationLinks";
import EmptyState from "@/components/EmptyState";

type PageProps = {
  searchParams?: Promise<{ page?: string; pageSize?: string }>;
};

export default async function PasienRiwayatPage({ searchParams }: PageProps) {
  const { pasien } = await getCurrentPasienContext();
  const params = searchParams ? await searchParams : undefined;
  const page = Math.max(1, Number(params?.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(params?.pageSize ?? 10) || 10));

  const total = await prisma.daftarPoli.count({ where: { pasienId: pasien.id } });

  const riwayat = await prisma.daftarPoli.findMany({
    where: { pasienId: pasien.id },
    orderBy: { createdAt: "desc" },
    include: {
      jadwal: {
        include: {
          dokter: { include: { user: { select: { name: true } } } },
          poli: { select: { namaPoli: true } },
        },
      },
      periksa: {
        include: {
          details: { include: { obat: true } },
        },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <main>
      <h1>Riwayat Kunjungan & Hasil Periksa</h1>
      {riwayat.length === 0 ? (
        <EmptyState
          title="Riwayat Belum Tersedia"
          description="Riwayat kunjungan dan hasil pemeriksaan akan muncul setelah Anda melakukan pendaftaran."
          icon="ðŸ“„"
        />
      ) : (
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th >Tanggal Daftar</th>
              <th >Poli</th>
              <th >Dokter</th>
              <th >Jadwal</th>
              <th >No Antrian</th>
              <th >Keluhan</th>
              <th >Status</th>
              <th >Tanggal Periksa</th>
              <th >Catatan Dokter</th>
              <th >Biaya Periksa</th>
              <th >Obat</th>
              <th >Detail</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.map((r) => (
                <tr key={r.id}>
                  <td >{new Date(r.createdAt).toLocaleString("id-ID")}</td>
                  <td >{r.jadwal.poli.namaPoli}</td>
                  <td >{r.jadwal.dokter.user.name}</td>
                  <td >
                    {r.jadwal.hari} {new Date(r.jadwal.jamMulai).toISOString().slice(11, 16)}-{new Date(r.jadwal.jamSelesai).toISOString().slice(11, 16)}
                  </td>
                  <td >{r.noAntrian}</td>
                  <td >{r.keluhan}</td>
                  <td >{r.status}</td>
                  <td >{r.periksa ? new Date(r.periksa.tglPeriksa).toLocaleString("id-ID") : "-"}</td>
                  <td >{r.periksa?.catatan ?? "-"}</td>
                  <td >{r.periksa ? r.periksa.biayaPeriksa.toLocaleString("id-ID") : "-"}</td>
                  <td >
                    {r.periksa?.details.length
                      ? r.periksa.details.map((d) => d.obat.namaObat).join(", ")
                      : "-"}
                  </td>
                  <td >
                    <a href={`/pasien/riwayat/${r.id}`}>Lihat</a>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      )}
      <PaginationLinks basePath="/pasien/riwayat" page={page} pageSize={pageSize} total={total} />
    </main>
  );
}


