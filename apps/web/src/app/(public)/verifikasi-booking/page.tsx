import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { GuestBookingStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{
    msg?: string;
    err?: string;
    code?: string;
    otp?: string;
    queue?: string;
  }>;
};

function buildOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default async function VerifikasiBookingPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const code = (params?.code ?? "").trim().toUpperCase();
  const devOtp = (params?.otp ?? "").trim();
  const queueNumber = Number(params?.queue ?? 0) || null;

  async function verifyOtpAction(formData: FormData) {
    "use server";

    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    const otp = String(formData.get("otp") ?? "").trim();
    if (!code || otp.length < 4) {
      redirect("/verifikasi-booking?err=Kode%20atau%20OTP%20tidak%20valid");
    }

    const booking = await prisma.guestBooking.findFirst({
      where: { bookingCode: code },
    });
    if (!booking) {
      redirect(`/verifikasi-booking?err=Booking%20tidak%20ditemukan&code=${encodeURIComponent(code)}`);
    }

    const now = new Date();
    const otpRow = await prisma.guestOtp.findFirst({
      where: { bookingId: booking.id, verifiedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" },
    });
    if (!otpRow) {
      redirect(`/verifikasi-booking?err=OTP%20sudah%20kadaluarsa.%20Minta%20OTP%20baru.&code=${encodeURIComponent(code)}`);
    }

    const ok = await bcrypt.compare(otp, otpRow.otpHash);
    if (!ok) {
      await prisma.guestOtp.update({
        where: { id: otpRow.id },
        data: { attemptCount: { increment: 1 } },
      });
      redirect(`/verifikasi-booking?err=OTP%20salah&code=${encodeURIComponent(code)}`);
    }

    const [existingPasien, existingGuest] = await Promise.all([
      prisma.daftarPoli.aggregate({
        where: { jadwalId: booking.jadwalId },
        _max: { noAntrian: true },
      }),
      prisma.guestBooking.aggregate({
        where: { jadwalId: booking.jadwalId, status: { in: [GuestBookingStatus.CONFIRMED, GuestBookingStatus.VERIFIED] } },
        _max: { queueNumber: true },
      }),
    ]);
    const nextQueueNumber = Math.max(existingPasien._max.noAntrian ?? 0, existingGuest._max.queueNumber ?? 0) + 1;

    await prisma.$transaction([
      prisma.guestOtp.update({
        where: { id: otpRow.id },
        data: { verifiedAt: now },
      }),
      prisma.guestBooking.update({
        where: { id: booking.id },
        data: {
          status: GuestBookingStatus.VERIFIED,
          otpVerifiedAt: now,
          queueNumber: nextQueueNumber,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    redirect(`/verifikasi-booking?msg=OTP%20berhasil%20diverifikasi&code=${encodeURIComponent(code)}&queue=${nextQueueNumber}`);
  }

  async function resendOtpAction(formData: FormData) {
    "use server";

    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    if (!code) redirect("/verifikasi-booking?err=Kode%20booking%20wajib%20diisi");

    const booking = await prisma.guestBooking.findFirst({ where: { bookingCode: code } });
    if (!booking) {
      redirect(`/verifikasi-booking?err=Booking%20tidak%20ditemukan&code=${encodeURIComponent(code)}`);
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

    const base = `/verifikasi-booking?msg=${encodeURIComponent("OTP baru dikirim.")}&code=${encodeURIComponent(code)}`;
    const withOtp = process.env.NODE_ENV !== "production" ? `${base}&otp=${otpCode}` : base;
    const redirectTo = withOtp as Route;
    redirect(redirectTo);
  }

  const booking = code
    ? await prisma.guestBooking.findFirst({
        where: { bookingCode: code },
      })
    : null;

  const waDigits = (booking?.noHp ?? "").replace(/\D/g, "");
  const waLink = waDigits
    ? waDigits.startsWith("0")
      ? `https://wa.me/62${waDigits.slice(1)}`
      : `https://wa.me/${waDigits}`
    : "";

  return (
    <main className="layout-container stack-md">
      <h1 className="app-title">Verifikasi Booking</h1>
      <p className="app-subtitle">Masukkan OTP yang dikirim ke nomor HP Anda.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      {devOtp ? (
        <p className="notice-info">OTP demo: <strong>{devOtp}</strong></p>
      ) : null}

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

      <form action={resendOtpAction} className="form-layout" style={{ maxWidth: 420 }}>
        <input type="hidden" name="code" value={code} />
        <button type="submit">Kirim Ulang OTP</button>
      </form>

      {queueNumber ? (
        <section className="stack-sm">
          <h3>Booking Terverifikasi</h3>
          <p>Nomor antrean Anda: <strong>{queueNumber}</strong></p>
          {waLink ? (
            <a href={waLink} target="_blank" rel="noreferrer">
              Kirim notifikasi via WhatsApp
            </a>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
