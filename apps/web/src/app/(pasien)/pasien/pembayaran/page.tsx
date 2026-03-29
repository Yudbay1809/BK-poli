import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentPasienContext } from "@/lib/current-user";

export default async function PasienPembayaranPage() {
  const { pasien } = await getCurrentPasienContext();

  const payments = await prisma.patientPayment.findMany({
    where: { pasienId: pasien.id },
    orderBy: { createdAt: "desc" },
    include: {
      periksa: {
        include: {
          daftarPoli: {
            include: {
              jadwal: { include: { poli: { select: { namaPoli: true } } } },
            },
          },
        },
      },
    },
  });

  return (
    <main className="flow-md">
      <h1 className="app-title">Riwayat Pembayaran</h1>
      <p className="app-subtitle">Lihat status pembayaran dan unduh invoice layanan Anda.</p>

      {payments.length === 0 ? (
        <p>Belum ada data pembayaran.</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Poli</th>
                <th>Tanggal</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Total</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.invoiceNumber}</td>
                  <td>{payment.periksa.daftarPoli.jadwal.poli.namaPoli}</td>
                  <td>{new Date(payment.createdAt).toLocaleDateString("id-ID")}</td>
                  <td>{payment.method}</td>
                  <td>{payment.status}</td>
                  <td>{payment.amount.toLocaleString("id-ID")}</td>
                  <td>
                    <Link href={`/pasien/pembayaran/${payment.id}`}>Lihat Invoice</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
