import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentPasienContext } from "@/lib/current-user";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PasienInvoicePage({ params }: PageProps) {
  const { pasien } = await getCurrentPasienContext();
  const { id } = await params;
  const paymentId = Number(id);

  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    redirect("/pasien/pembayaran");
  }

  const payment = await prisma.patientPayment.findFirst({
    where: { id: paymentId, pasienId: pasien.id },
    include: {
      periksa: {
        include: {
          details: { include: { obat: true } },
          daftarPoli: {
            include: {
              jadwal: { include: { poli: { select: { namaPoli: true } }, dokter: { include: { user: { select: { name: true } } } } } },
            },
          },
        },
      },
    },
  });

  if (!payment) {
    redirect("/pasien/pembayaran");
  }

  const layanan = payment.periksa.daftarPoli;
  const dokterName = layanan.jadwal.dokter.user.name;
  const poliName = layanan.jadwal.poli.namaPoli;

  return (
    <main className="flow-md">
      <h1 className="app-title">Invoice Pembayaran</h1>
      <p className="app-subtitle">Ringkasan biaya pemeriksaan dan obat.</p>

      <section className="flow-sm">
        <h3>Informasi Invoice</h3>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 760 }}>
            <tbody>
              <tr>
                <th>No Invoice</th>
                <td>{payment.invoiceNumber}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>{payment.status}</td>
              </tr>
              <tr>
                <th>Metode</th>
                <td>{payment.method}</td>
              </tr>
              <tr>
                <th>Dibayar Pada</th>
                <td>{payment.paidAt ? new Date(payment.paidAt).toLocaleString("id-ID") : "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="flow-sm">
        <h3>Detail Layanan</h3>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 760 }}>
            <tbody>
              <tr>
                <th>Poli</th>
                <td>{poliName}</td>
              </tr>
              <tr>
                <th>Dokter</th>
                <td>{dokterName}</td>
              </tr>
              <tr>
                <th>Tanggal Periksa</th>
                <td>{new Date(payment.periksa.tglPeriksa).toLocaleString("id-ID")}</td>
              </tr>
              <tr>
                <th>Catatan Dokter</th>
                <td>{payment.periksa.catatan ?? "-"}</td>
              </tr>
              <tr>
                <th>Obat</th>
                <td>{payment.periksa.details.map((d) => d.obat.namaObat).join(", ") || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="flow-sm">
        <h3>Ringkasan Biaya</h3>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 420 }}>
            <tbody>
              <tr>
                <th>Biaya Pemeriksaan</th>
                <td>{payment.amount.toLocaleString("id-ID")}</td>
              </tr>
              <tr>
                <th>Total Dibayar</th>
                <td>{payment.amount.toLocaleString("id-ID")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <Link href="/pasien/pembayaran">Kembali ke Pembayaran</Link>
    </main>
  );
}
