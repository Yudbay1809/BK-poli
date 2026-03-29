import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";

export default async function PublicPoliPage() {
  const polis = await prisma.poli.findMany({
    orderBy: { namaPoli: "asc" },
    include: { _count: { select: { dokterPolis: true } }, branch: true },
  });

  return (
    <main className="layout-container">
      <h1 className="app-title">Daftar Poli</h1>
      <p className="app-subtitle">Informasi poli yang tersedia di BK Poli.</p>
      {polis.length === 0 ? (
        <EmptyState
          title="Belum Ada Data Poli"
          description="Data poli akan tampil di sini setelah admin menambahkan layanan poli."
          icon="??"
        />
      ) : (
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Poli</th>
                <th>Keterangan</th>
                <th>Lokasi</th>
                <th>Jumlah Dokter</th>
              </tr>
            </thead>
            <tbody>
              {polis.map((poli) => (
                <tr key={poli.id}>
                  <td>{poli.id}</td>
                  <td>{poli.namaPoli}</td>
                  <td>{poli.keterangan ?? "-"}</td>
                  <td>{poli.branch?.name ?? "-"}</td>
                  <td>{poli._count.dokterPolis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/">Kembali ke Beranda</Link>
        <Link href="/jadwal-dokter">Lihat Jadwal Dokter</Link>
      </div>
    </main>
  );
}

