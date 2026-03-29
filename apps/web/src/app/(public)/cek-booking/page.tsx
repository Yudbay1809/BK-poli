import { GuestBookingStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{
    code?: string;
  }>;
};

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("id-ID");
}

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

function statusLabel(status: GuestBookingStatus) {
  if (status === GuestBookingStatus.CONFIRMED) return "Terkonfirmasi";
  if (status === GuestBookingStatus.PENDING_OTP) return "Menunggu OTP";
  if (status === GuestBookingStatus.EXPIRED) return "Kadaluarsa";
  if (status === GuestBookingStatus.CANCELLED) return "Dibatalkan";
  if (status === GuestBookingStatus.VERIFIED) return "Terverifikasi";
  return status;
}

export default async function CekBookingPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const code = (params?.code ?? "").trim().toUpperCase();

  const booking =
    code
      ? await prisma.guestBooking.findFirst({
          where: { bookingCode: code },
          include: {
            poli: { select: { namaPoli: true } },
            jadwal: {
              include: {
                dokter: { include: { user: { select: { name: true } } } },
              },
            },
          },
        })
      : null;

  return (
    <main className="layout-container stack-md">
      <h1 className="app-title">Cek Status Booking</h1>
      <p className="app-subtitle">Masukkan kode booking yang Anda dapat setelah mendaftar.</p>

      <section className="stack-sm">
        <form action="/cek-booking" method="get" className="form-layout" style={{ maxWidth: 480 }}>
          <label className="form-field">
            Kode Booking
            <input name="code" defaultValue={code} placeholder="contoh: BK-1A2B3C4D" required />
          </label>
          <button type="submit">Cek Booking</button>
        </form>
      </section>

      {code ? (
        <section className="stack-sm">
          <h3>Hasil Pencarian</h3>
          {!booking ? (
            <p className="notice-error">Booking tidak ditemukan. Pastikan kode booking benar.</p>
          ) : (
            <div className="table-scroll">
              <table className="data-table">
                <tbody>
                  <tr>
                    <th>Kode Booking</th>
                    <td>{booking.bookingCode}</td>
                  </tr>
                  <tr>
                    <th>Nama</th>
                    <td>{booking.nama}</td>
                  </tr>
                  <tr>
                    <th>Poli</th>
                    <td>{booking.poli.namaPoli}</td>
                  </tr>
                  <tr>
                    <th>Dokter</th>
                    <td>{booking.jadwal.dokter.user.name}</td>
                  </tr>
                  <tr>
                    <th>Jadwal</th>
                    <td>
                      {booking.jadwal.hari} {formatTime(booking.jadwal.jamMulai)}-{formatTime(booking.jadwal.jamSelesai)}
                    </td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>{statusLabel(booking.status)}</td>
                  </tr>
                  <tr>
                    <th>Status Pembayaran</th>
                    <td>{booking.paymentStatus}</td>
                  </tr>
                  <tr>
                    <th>Waktu Pembayaran</th>
                    <td>{booking.paidAt ? formatDateTime(booking.paidAt) : "-"}</td>
                  </tr>
                  <tr>
                    <th>Pembiayaan</th>
                    <td>{booking.paymentMethod === "BPJS" ? "BPJS" : "Umum"}</td>
                  </tr>
                  {booking.paymentMethod === "BPJS" ? (
                    <tr>
                      <th>No BPJS</th>
                      <td>{booking.bpjsNumber ?? "-"}</td>
                    </tr>
                  ) : null}
                  <tr>
                    <th>Nomor Antrian</th>
                    <td>{booking.queueNumber ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Dibuat</th>
                    <td>{formatDateTime(booking.createdAt)}</td>
                  </tr>
                  <tr>
                    <th>Berlaku Sampai</th>
                    <td>{formatDateTime(booking.expiresAt)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </main>
  );
}
