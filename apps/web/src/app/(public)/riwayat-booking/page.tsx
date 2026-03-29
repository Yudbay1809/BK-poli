import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{
    msg?: string;
    err?: string;
    code?: string;
    otp?: string;
  }>;
};

function buildOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default async function RiwayatBookingPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const code = (params?.code ?? "").trim().toUpperCase();
  const devOtp = (params?.otp ?? "").trim();

  async function requestOtpAction(formData: FormData) {
    "use server";

    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    if (!code) redirect("/riwayat-booking?err=Kode%20booking%20wajib%20diisi");

    const booking = await prisma.guestBooking.findFirst({ where: { bookingCode: code } });
    if (!booking) {
      redirect(`/riwayat-booking?err=Booking%20tidak%20ditemukan&code=${encodeURIComponent(code)}`);
    }

    const otpCode = buildOtp();
    const otpHash = await bcrypt.hash(otpCode, 10);
    await prisma.guestOtp.create({
      data: {
        bookingId: booking.id,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const base = `/riwayat-booking?msg=${encodeURIComponent("OTP dikirim ke nomor Anda.")}&code=${encodeURIComponent(code)}`;
    const withOtp = process.env.NODE_ENV !== "production" ? `${base}&otp=${otpCode}` : base;
    const redirectTo = withOtp as Route;
    redirect(redirectTo);
  }

  async function verifyOtpAction(formData: FormData) {
    "use server";

    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    const otp = String(formData.get("otp") ?? "").trim();
    if (!code || otp.length < 4) {
      redirect("/riwayat-booking?err=Kode%20atau%20OTP%20tidak%20valid");
    }

    const booking = await prisma.guestBooking.findFirst({ where: { bookingCode: code } });
    if (!booking) {
      redirect(`/riwayat-booking?err=Booking%20tidak%20ditemukan&code=${encodeURIComponent(code)}`);
    }

    const otpRow = await prisma.guestOtp.findFirst({
      where: { bookingId: booking.id, verifiedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    if (!otpRow) {
      redirect(`/riwayat-booking?err=OTP%20kadaluarsa.%20Minta%20OTP%20baru.&code=${encodeURIComponent(code)}`);
    }

    const ok = await bcrypt.compare(otp, otpRow.otpHash);
    if (!ok) {
      await prisma.guestOtp.update({
        where: { id: otpRow.id },
        data: { attemptCount: { increment: 1 } },
      });
      redirect(`/riwayat-booking?err=OTP%20salah&code=${encodeURIComponent(code)}`);
    }

    await prisma.guestOtp.update({
      where: { id: otpRow.id },
      data: { verifiedAt: new Date() },
    });

    redirect(`/riwayat-booking?msg=OTP%20berhasil%20diverifikasi&code=${encodeURIComponent(code)}`);
  }

  const booking = code
    ? await prisma.guestBooking.findFirst({
        where: { bookingCode: code },
        include: {
          poli: { select: { namaPoli: true } },
          jadwal: { include: { dokter: { include: { user: { select: { name: true } } } } } },
        },
      })
    : null;

  let recentVerification = null;
  if (booking) {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - 30);
    recentVerification = await prisma.guestOtp.findFirst({
      where: {
        bookingId: booking.id,
        verifiedAt: { gt: cutoff },
      },
      orderBy: { verifiedAt: "desc" },
    });
  }

  const showDetail = Boolean(booking && recentVerification);

  return (
    <main className="layout-container stack-md">
      <h1 className="app-title">Riwayat Booking</h1>
      <p className="app-subtitle">Masukkan kode booking dan OTP untuk melihat detail pendaftaran.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}
      {devOtp ? <p className="notice-info">OTP demo: <strong>{devOtp}</strong></p> : null}

      <form action={requestOtpAction} className="form-layout" style={{ maxWidth: 420 }}>
        <label className="form-field">
          Kode Booking
          <input name="code" defaultValue={code} required />
        </label>
        <button type="submit">Kirim OTP</button>
      </form>

      <form action={verifyOtpAction} className="form-layout" style={{ maxWidth: 420 }}>
        <label className="form-field">
          Kode Booking
          <input name="code" defaultValue={code} required />
        </label>
        <label className="form-field">
          OTP
          <input name="otp" required />
        </label>
        <button type="submit">Verifikasi</button>
      </form>

      {showDetail ? (
        <section className="stack-sm">
          <h3>Detail Booking</h3>
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 820 }}>
              <tbody>
                <tr>
                  <th>Kode Booking</th>
                  <td>{booking?.bookingCode}</td>
                </tr>
                <tr>
                  <th>Nama</th>
                  <td>{booking?.nama}</td>
                </tr>
                <tr>
                  <th>Poli</th>
                  <td>{booking?.poli.namaPoli}</td>
                </tr>
                <tr>
                  <th>Dokter</th>
                  <td>{booking?.jadwal.dokter.user.name}</td>
                </tr>
                <tr>
                  <th>Jadwal</th>
                  <td>
                    {booking?.jadwal.hari} {new Date(booking?.jadwal.jamMulai ?? new Date()).toISOString().slice(11, 16)}-
                    {new Date(booking?.jadwal.jamSelesai ?? new Date()).toISOString().slice(11, 16)}
                  </td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>{booking?.status}</td>
                </tr>
                <tr>
                  <th>Status Pembayaran</th>
                  <td>{booking?.paymentStatus ?? "-"}</td>
                </tr>
                <tr>
                  <th>Waktu Pembayaran</th>
                  <td>{booking?.paidAt ? new Date(booking.paidAt).toLocaleString("id-ID") : "-"}</td>
                </tr>
                <tr>
                  <th>Nomor Antrian</th>
                  <td>{booking?.queueNumber ?? "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
