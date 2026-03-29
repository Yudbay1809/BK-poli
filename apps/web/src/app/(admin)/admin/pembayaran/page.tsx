import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PaymentStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string; status?: string; code?: string }>;
};

const statusOptions = [PaymentStatus.PENDING, PaymentStatus.PAID, PaymentStatus.CANCELLED] as const;

export default async function AdminPembayaranPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const codeFilter = (params?.code ?? "").trim().toUpperCase();
  const statusFilter = (params?.status ?? "").trim() as PaymentStatus | "";

  const whereClause: { bookingCode?: { contains: string; mode: "insensitive" }; paymentStatus?: PaymentStatus } = {};
  if (codeFilter) whereClause.bookingCode = { contains: codeFilter, mode: "insensitive" };
  if (statusFilter && (statusOptions as readonly PaymentStatus[]).includes(statusFilter)) {
    whereClause.paymentStatus = statusFilter;
  }

  const bookings = await prisma.guestBooking.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      poli: { select: { namaPoli: true } },
      jadwal: { select: { hari: true, jamMulai: true, jamSelesai: true } },
    },
    take: 200,
  });

  async function updatePaymentAction(formData: FormData) {
    "use server";
    const { session } = await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    const status = String(formData.get("status") ?? "") as PaymentStatus;
    if (!Number.isInteger(id) || id <= 0 || !(statusOptions as readonly PaymentStatus[]).includes(status)) {
      redirect("/admin/pembayaran?err=Status%20pembayaran%20tidak%20valid");
    }

    await prisma.guestBooking.update({
      where: { id },
      data: {
        paymentStatus: status,
        paidAt: status === PaymentStatus.PAID ? new Date() : null,
        paidByName: status === PaymentStatus.PAID ? (session.user.name ?? "Admin") : null,
      },
    });
    revalidatePath("/admin/pembayaran");
    redirect("/admin/pembayaran?msg=Status%20pembayaran%20diperbarui");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Konfirmasi Pembayaran</h1>
      <p className="app-subtitle">Kelola status pembayaran pendaftaran pengobatan (guest booking).</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <form action="/admin/pembayaran" method="get" className="form-toolbar">
        <input name="code" defaultValue={codeFilter} placeholder="Cari kode booking" />
        <select name="status" defaultValue={statusFilter}>
          <option value="">Semua Status</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button type="submit">Filter</button>
      </form>

      <div className="table-scroll">
        <table className="data-table" style={{ minWidth: 1100 }}>
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama</th>
              <th>Poli</th>
              <th>Jadwal</th>
              <th>Metode</th>
              <th>BPJS</th>
              <th>Status</th>
              <th>Paid At</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.bookingCode}</td>
                <td>{b.nama}</td>
                <td>{b.poli.namaPoli}</td>
                <td>
                  {b.jadwal.hari} {new Date(b.jadwal.jamMulai).toISOString().slice(11, 16)}-
                  {new Date(b.jadwal.jamSelesai).toISOString().slice(11, 16)}
                </td>
                <td>{b.paymentMethod}</td>
                <td>{b.bpjsNumber ?? "-"}</td>
                <td>{b.paymentStatus}</td>
                <td>{b.paidAt ? new Date(b.paidAt).toLocaleString("id-ID") : "-"}</td>
                <td>
                  <form action={updatePaymentAction} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input type="hidden" name="id" value={b.id} />
                    <select name="status" defaultValue={b.paymentStatus}>
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <button type="submit">Simpan</button>
                  </form>
                </td>
              </tr>
            ))}
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={9}>Belum ada data pembayaran.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
