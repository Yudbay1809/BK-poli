import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { GuestBookingStatus, PaymentMethod } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import PaymentMethodFields from "@/components/PaymentMethodFields";

type PageProps = {
  searchParams?: Promise<{
    msg?: string;
    err?: string;
    code?: string;
    queue?: string;
    poliId?: string;
  }>;
};

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

function buildCode() {
  return `BK-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function buildOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function queueDensity(totalQueue: number) {
  if (totalQueue >= 16) {
    return {
      label: "Padat",
      color: "#8f1f1f",
      bg: "#ffe2e2",
      border: "#ffb0b0",
    };
  }
  if (totalQueue >= 8) {
    return {
      label: "Sedang",
      color: "#7a5411",
      bg: "#fff1d6",
      border: "#f3d08b",
    };
  }
  return {
    label: "Sepi",
    color: "#0c6b3d",
    bg: "#ddf8ea",
    border: "#74d8a6",
  };
}

export default async function DaftarPengobatanPage({ searchParams }: PageProps) {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
  const todayName = dayNames[new Date().getDay()];
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const codeParam = (params?.code ?? "").trim().toUpperCase();
  const queueParam = Number(params?.queue ?? 0) || null;
  const poliIdFilter = Number(params?.poliId ?? 0);

  const [polis, jadwals, guestQueueCounts, todayQueues] = await Promise.all([
    prisma.poli.findMany({ orderBy: { namaPoli: "asc" } }),
    prisma.jadwalPeriksa.findMany({
      where: poliIdFilter > 0 ? { poliId: poliIdFilter } : undefined,
      orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
      include: {
        dokter: { include: { user: { select: { name: true } } } },
        poli: { select: { namaPoli: true } },
        _count: { select: { daftarPolis: true } },
      },
    }),
    prisma.guestBooking.groupBy({
      by: ["jadwalId"],
      where: { status: { in: [GuestBookingStatus.CONFIRMED, GuestBookingStatus.VERIFIED] } },
      _count: { _all: true },
    }),
    prisma.guestBooking.findMany({
      where: {
        status: { in: [GuestBookingStatus.CONFIRMED, GuestBookingStatus.VERIFIED] },
        jadwal: { hari: { contains: todayName, mode: "insensitive" } },
        ...(poliIdFilter > 0 ? { poliId: poliIdFilter } : {}),
      },
      orderBy: [{ queueNumber: "asc" }, { createdAt: "asc" }],
      include: {
        poli: { select: { namaPoli: true } },
        jadwal: { select: { hari: true, jamMulai: true, jamSelesai: true } },
      },
      take: 100,
    }),
  ]);

  const guestCountByJadwal = new Map(guestQueueCounts.map((g) => [g.jadwalId, g._count._all]));

  const jadwalsWithQueue = jadwals.map((j) => ({
    ...j,
    totalQueue: j._count.daftarPolis + (guestCountByJadwal.get(j.id) ?? 0),
  }));

  const jadwalQueueLookup = new Map(jadwalsWithQueue.map((j) => [j.id, j.totalQueue]));

  const antrianTersedia = todayQueues.map((q) => ({
    ...q,
    totalQueue: jadwalQueueLookup.get(q.jadwalId) ?? 0,
  }));

  const jadwalsForSelect = jadwalsWithQueue;

  async function createBookingAction(formData: FormData) {
    "use server";

    const nama = String(formData.get("nama") ?? "").trim();
    const noHp = String(formData.get("noHp") ?? "").trim();
    const jadwalId = Number(formData.get("jadwalId"));
    const keluhan = String(formData.get("keluhan") ?? "").trim();
    const noKtp = String(formData.get("noKtp") ?? "").trim() || null;
    const paymentMethodRaw = String(formData.get("paymentMethod") ?? "UMUM").trim().toUpperCase();
    const bpjsNumber = String(formData.get("bpjsNumber") ?? "").trim() || null;
    const paymentMethod = paymentMethodRaw === "BPJS" ? PaymentMethod.BPJS : PaymentMethod.UMUM;

    if (!nama || !noHp || !keluhan || !Number.isInteger(jadwalId) || jadwalId <= 0) {
      redirect("/daftar-pengobatan?err=Input%20belum%20lengkap");
    }

    if (paymentMethod === PaymentMethod.BPJS && !bpjsNumber) {
      redirect("/daftar-pengobatan?err=Nomor%20BPJS%20wajib%20diisi%20jika%20memilih%20BPJS");
    }

    const jadwal = await prisma.jadwalPeriksa.findUnique({ where: { id: jadwalId } });
    if (!jadwal) {
      redirect("/daftar-pengobatan?err=Jadwal%20tidak%20ditemukan");
    }

    const otpCode = buildOtp();
    const otpHash = await bcrypt.hash(otpCode, 10);

    let bookingCode = "";
    for (let i = 0; i < 5; i += 1) {
      const candidate = buildCode();
      try {
        const booking = await prisma.guestBooking.create({
          data: {
            bookingCode: candidate,
            nama,
            noHp,
            noKtp,
            paymentMethod,
            bpjsNumber,
            keluhan,
            poliId: jadwal.poliId,
            jadwalId,
            status: GuestBookingStatus.PENDING_OTP,
            queueNumber: null,
            otpVerifiedAt: null,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
        await prisma.guestOtp.create({
          data: {
            bookingId: booking.id,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        });
        bookingCode = candidate;
        break;
      } catch {
        continue;
      }
    }

    if (!bookingCode) {
      redirect("/daftar-pengobatan?err=Gagal%20membuat%20booking,%20silakan%20coba%20lagi");
    }

    const base = `/verifikasi-booking?msg=${encodeURIComponent("Kode booking dibuat. Masukkan OTP yang dikirim ke nomor Anda.")}&code=${encodeURIComponent(
      bookingCode
    )}`;
    const withOtp = process.env.NODE_ENV !== "production" ? `${base}&otp=${otpCode}` : base;
    const redirectTo = withOtp as Route;
    redirect(redirectTo);
  }

  return (
    <main className="layout-container stack-md">
      <h1 className="app-title">Daftar Pengobatan Cepat</h1>
      <p className="app-subtitle">Isi data singkat, pilih BPJS/Umum, lalu langsung dapat nomor antrian.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      {codeParam ? (
        <section className="stack-sm">
          <h3>Booking Anda</h3>
          <div className="table-scroll">
            <table className="data-table" style={{ maxWidth: 520 }}>
              <tbody>
                <tr>
                  <th>Kode Booking</th>
                  <td>{codeParam}</td>
                </tr>
                <tr>
                  <th>Nomor Antrian</th>
                  <td>{queueParam ?? "-"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Simpan kode ini. Cek status di <a href="/cek-booking">halaman cek booking</a>.
          </p>
        </section>
      ) : null}

      <section className="stack-sm">
        <h3>Form Daftar Pengobatan</h3>
        <form action="/daftar-pengobatan" method="get" className="form-toolbar">
          <select name="poliId" defaultValue={poliIdFilter > 0 ? String(poliIdFilter) : ""}>
            <option value="">Semua Poli</option>
            {polis.map((poli) => (
              <option key={poli.id} value={poli.id}>
                {poli.namaPoli}
              </option>
            ))}
          </select>
          <button type="submit">Filter Jadwal</button>
        </form>

        <form action={createBookingAction} className="form-layout" style={{ maxWidth: 760 }}>
          <label className="form-field">
            Nama Lengkap
            <input name="nama" required />
          </label>
          <label className="form-field">
            Nomor HP
            <input name="noHp" required />
          </label>
          <PaymentMethodFields />
          <label className="form-field">
            No KTP (opsional)
            <input name="noKtp" />
          </label>
          <label className="form-field">
            Pilih Jadwal
            <select name="jadwalId" required>
              <option value="">Pilih Jadwal</option>
              {jadwalsForSelect.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.poli.namaPoli} | Dr. {j.dokter.user.name} | {j.hari} {formatTime(j.jamMulai)}-{formatTime(j.jamSelesai)} | antrean {j.totalQueue} ({queueDensity(j.totalQueue).label})
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Keluhan
            <textarea name="keluhan" rows={3} required />
          </label>
          <button type="submit">Daftar Pengobatan</button>
        </form>
      </section>

      <section className="stack-sm">
        <h3>Antrian Pendaftaran Pengobatan Hari Ini ({todayName})</h3>
        {antrianTersedia.length === 0 ? (
          <p>Belum ada antrean pengobatan untuk hari ini.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th>No Antrian</th>
                  <th>Poli</th>
                  <th>Jadwal</th>
                  <th>Tipe Bayar</th>
                  <th>Total Antrean Jadwal</th>
                  <th>Kepadatan</th>
                </tr>
              </thead>
              <tbody>
                {antrianTersedia.map((q) => {
                  const density = queueDensity(q.totalQueue);
                  return (
                    <tr key={q.id}>
                      <td>{q.queueNumber ?? "-"}</td>
                      <td>{q.poli.namaPoli}</td>
                      <td>
                        {q.jadwal.hari} {formatTime(q.jadwal.jamMulai)}-{formatTime(q.jadwal.jamSelesai)}
                      </td>
                      <td>{q.paymentMethod === PaymentMethod.BPJS ? "BPJS" : "UMUM"}</td>
                      <td>{q.totalQueue}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            borderRadius: 999,
                            padding: "3px 10px",
                            fontSize: 12,
                            fontWeight: 800,
                            color: density.color,
                            background: density.bg,
                            border: `1px solid ${density.border}`,
                          }}
                        >
                          {density.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
