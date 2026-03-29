import Link from "next/link";
import { GuestBookingStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import styles from "./landing.module.css";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    poliId?: string;
    sort?: string;
    hari?: string;
    timeRange?: string;
    branchId?: string;
  }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
  const now = new Date();
  const todayName = dayNames[now.getDay()];
  const params = searchParams ? await searchParams : undefined;
  const q = (params?.q ?? "").trim();
  const poliIdFilter = Number(params?.poliId ?? 0);
  const rawSort = (params?.sort ?? "").trim();
  const hariParam = (params?.hari ?? "").trim();
  const timeRange = (params?.timeRange ?? "").trim();
  const branchIdFilter = Number(params?.branchId ?? 0);
  const sort: "queue_low" | "time_early" | "doctor_az" =
    rawSort === "queue_low" || rawSort === "doctor_az" ? rawSort : "time_early";
  const hariFilter = !hariParam ? todayName : hariParam;

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(todayStart.getDate() + 1);

  const [totalPoli, totalDokter, totalPasien, totalJadwal, polis, allPolis, appConfig, branches, jadwalsFiltered, holidaysToday, educations] = await Promise.all([
    prisma.poli.count(),
    prisma.dokter.count(),
    prisma.pasien.count(),
    prisma.jadwalPeriksa.count(),
    prisma.poli.findMany({
      where: poliIdFilter > 0 ? { id: poliIdFilter } : undefined,
      orderBy: { namaPoli: "asc" },
      select: {
        id: true,
        namaPoli: true,
        keterangan: true,
        _count: { select: { dokterPolis: true } },
      },
    }),
    prisma.poli.findMany({
      orderBy: { namaPoli: "asc" },
      select: { id: true, namaPoli: true },
    }),
    prisma.appConfig.findUnique({ where: { id: 1 } }),
    prisma.clinicBranch.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.jadwalPeriksa.findMany({
      where: {
        ...(hariFilter !== "all" ? { hari: { contains: hariFilter, mode: "insensitive" } } : {}),
        ...(poliIdFilter > 0 ? { poliId: poliIdFilter } : {}),
        ...(branchIdFilter > 0 ? { poli: { branchId: branchIdFilter } } : {}),
        ...(q ? { dokter: { user: { name: { contains: q, mode: "insensitive" } } } } : {}),
      },
      orderBy: [{ jamMulai: "asc" }],
      include: {
        dokter: {
          include: {
            user: { select: { name: true } },
          },
        },
        poli: { select: { id: true, namaPoli: true } },
      },
      take: 24,
    }),
    prisma.holiday.findMany({
      where: { date: { gte: todayStart, lt: tomorrowStart }, isClosed: true },
    }),
    prisma.healthEducation.findMany({
      where: { isActive: true, publishAt: { lte: now } },
      orderBy: { publishAt: "desc" },
      take: 4,
    }),
  ]);

  const highlights = [
    {
      title: "Akses Cepat Layanan",
      description: "Cari poli, lihat jadwal, dan daftar kunjungan dalam alur yang singkat dan jelas.",
    },
    {
      title: "Pemantauan Real-Time",
      description: "Perubahan jadwal dokter dan status layanan ditampilkan langsung dari sistem.",
    },
    {
      title: "Ramah Semua Pengguna",
      description: "Tampilan sederhana, kontras nyaman, dan kompatibel mode gelap maupun terang.",
    },
  ];

  const clinicInfo = [
    "Layanan pasien umum dan kontrol rutin dengan alur pendaftaran terstruktur.",
    "Pendaftaran poli, antrean, dan rekam kunjungan terintegrasi secara digital.",
    "Rujukan internal antar poli untuk penanganan pasien yang berkelanjutan.",
  ];

  const featuredServices = [
    {
      icon: "PC",
      title: "Pemeriksaan Umum",
      description: "Layanan konsultasi awal untuk keluhan kesehatan harian dan skrining dasar.",
    },
    {
      icon: "KR",
      title: "Kontrol Penyakit Kronis",
      description: "Pendampingan kontrol berkala untuk hipertensi, diabetes, dan kondisi kronis lain.",
    },
    {
      icon: "TD",
      title: "Tindakan Dasar",
      description: "Tindakan medis ringan sesuai arahan dokter dengan alur yang aman dan cepat.",
    },
    {
      icon: "RT",
      title: "Rujukan Terintegrasi",
      description: "Koordinasi antar poli untuk kebutuhan pemeriksaan lanjutan secara tertata.",
    },
  ];

  const faqs = [
    {
      q: "Apakah harus login untuk melihat jadwal dokter?",
      a: "Tidak. Jadwal dokter dapat dilihat publik. Login diperlukan saat ingin mendaftar dan memantau riwayat kunjungan.",
    },
    {
      q: "Bagaimana jika lupa password akun?",
      a: "Silakan hubungi petugas admin klinik. Password dapat direset melalui menu manajemen pengguna.",
    },
    {
      q: "Apakah antrean bisa dibatalkan?",
      a: "Bisa, selama belum diproses menjadi pemeriksaan. Pembatalan dapat dilakukan melalui petugas/admin.",
    },
    {
      q: "Apakah layanan ini bisa diakses dari ponsel?",
      a: "Bisa. Seluruh halaman utama dirancang responsif untuk mobile maupun desktop.",
    },
  ];

  const isHoliday = holidaysToday.length > 0;
  const openStatusLabel = isHoliday ? "Libur Hari Ini" : "Buka Setiap Hari";
  const openStatusDetail = isHoliday
    ? `Hari ini libur: ${holidaysToday[0]?.label ?? "Libur Nasional"}.`
    : "Klinik tetap buka setiap hari, status tiap poli mengikuti jadwal dokter hari ini.";
  const waDigits = (appConfig?.contactWhatsapp ?? "081200008899").replace(/\D/g, "");
  const waLink = waDigits.startsWith("0") ? `https://wa.me/62${waDigits.slice(1)}` : `https://wa.me/${waDigits}`;
  const isPoliOpenToday = todayName !== "Minggu" && !isHoliday;
  const jadwalsTimeFiltered = timeRange
    ? jadwalsFiltered.filter((j) => {
        const hour = j.jamMulai.getHours();
        if (timeRange === "morning") return hour < 12;
        if (timeRange === "afternoon") return hour >= 12 && hour < 16;
        if (timeRange === "evening") return hour >= 16;
        return true;
      })
    : jadwalsFiltered;
  const jadwalIds = jadwalsTimeFiltered.map((j) => j.id);
  const [pasienQueueCounts, guestQueueCounts] = await Promise.all([
    prisma.daftarPoli.groupBy({
      by: ["jadwalId"],
      where: { jadwalId: { in: jadwalIds } },
      _count: { _all: true },
    }),
    prisma.guestBooking.groupBy({
      by: ["jadwalId"],
      where: { jadwalId: { in: jadwalIds }, status: { in: [GuestBookingStatus.CONFIRMED, GuestBookingStatus.VERIFIED] } },
      _count: { _all: true },
    }),
  ]);
  const pasienQueueMap = new Map(pasienQueueCounts.map((r) => [r.jadwalId, r._count._all]));
  const guestQueueMap = new Map(guestQueueCounts.map((r) => [r.jadwalId, r._count._all]));
  const jadwalsTodayWithQueue = jadwalsTimeFiltered.map((j) => ({
    ...j,
    totalQueue: (pasienQueueMap.get(j.id) ?? 0) + (guestQueueMap.get(j.id) ?? 0),
  }));
  const sortedJadwals = [...jadwalsTodayWithQueue].sort((a, b) => {
    if (sort === "queue_low") return a.totalQueue - b.totalQueue || a.jamMulai.getTime() - b.jamMulai.getTime();
    if (sort === "doctor_az") return a.dokter.user.name.localeCompare(b.dokter.user.name) || a.jamMulai.getTime() - b.jamMulai.getTime();
    return a.jamMulai.getTime() - b.jamMulai.getTime();
  });

  const visibleJadwals = sortedJadwals.slice(0, 4);
  const visiblePolis = polis.slice(0, 4);
  const hasMoreJadwals = sortedJadwals.length > 4;
  const hasMorePolis = polis.length > 4 || (poliIdFilter === 0 && totalPoli > 4);
  const scheduleLabel = hariFilter === "all" ? "Semua Hari" : hariFilter;

  return (
    <main className={styles.page}>
      <section className={styles.heroWrap}>
        <div className={styles.heroBadge}>Layanan Terpadu Klinik {appConfig?.clinicName ?? "BK Poli"}</div>
        <div className={styles.heroGrid}>
          <div>
            <h1 className={styles.heroTitle}>Informasi Kesehatan dan Layanan Poliklinik dalam Satu Portal</h1>
            <p className={styles.heroText}>
              BK Poli Digital Care memudahkan masyarakat mengakses informasi poli, jadwal dokter, serta edukasi
              kesehatan harian dengan tampilan yang cepat dan nyaman.
            </p>
            <div className={styles.heroCtas}>
              <a href="/daftar-pengobatan" className={styles.ctaPrimary}>
                Daftar Pengobatan
              </a>
              <a href="/jadwal-dokter" className={styles.ctaSecondary}>
                Cek Jadwal Dokter
              </a>
            </div>
          </div>

          <div className={styles.heroPanel}>
            <h2>Ringkasan Layanan</h2>
            <p>Data layanan diperbarui langsung dari sistem untuk memudahkan pasien memilih layanan yang tepat.</p>
            <div className={styles.stats}>
              <Card title="Total Poli" value={String(totalPoli)} />
              <Card title="Total Dokter" value={String(totalDokter)} />
              <Card title="Total Pasien" value={String(totalPasien)} />
              <Card title="Jadwal Tersedia" value={String(totalJadwal)} />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.fastAccessStrip}>
        <article className={styles.fastAccessCard}>
          <h3>Status Klinik</h3>
          <p className={styles.statusOpen}>{openStatusLabel}</p>
          <small>{openStatusDetail}</small>
        </article>
        <article className={styles.fastAccessCard}>
          <h3>Kontak Cepat</h3>
          <p>Telp: {appConfig?.contactPhone ?? "(021) 555-0188"}</p>
          <p>WA: {appConfig?.contactWhatsapp ?? "0812-0000-8899"}</p>
        </article>
        <article className={styles.fastAccessCard}>
          <h3>Aksi Utama</h3>
          <div className={styles.fastButtons}>
            <a href="/daftar-pengobatan" className={styles.ctaPrimary}>
              Daftar Sekarang
            </a>
            <a href="/cek-booking" className={styles.ctaSecondary}>
              Cek Booking
            </a>
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <h2 className={styles.panelTitle}>Filter Cepat Dokter & Poli</h2>
          {(q || poliIdFilter > 0 || sort !== "time_early" || hariFilter !== todayName || timeRange || branchIdFilter > 0) ? (
            <Link href="/" className={styles.ctaSecondary}>
              Reset Filter
            </Link>
          ) : null}
        </div>
        <form action="/" method="get" className={styles.quickFilter}>
          <input name="q" defaultValue={q} placeholder="Cari nama dokter" />
          <select name="poliId" defaultValue={poliIdFilter > 0 ? String(poliIdFilter) : ""}>
            <option value="">Semua Poli</option>
            {allPolis.map((poli) => (
              <option key={poli.id} value={poli.id}>
                {poli.namaPoli}
              </option>
            ))}
          </select>
          <select name="hari" defaultValue={hariFilter}>
            <option value="all">Semua Hari</option>
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
            <option value="Sabtu">Sabtu</option>
            <option value="Minggu">Minggu</option>
          </select>
          <select name="timeRange" defaultValue={timeRange}>
            <option value="">Semua Jam</option>
            <option value="morning">Pagi (sampai 12.00)</option>
            <option value="afternoon">Siang (12.00-16.00)</option>
            <option value="evening">Sore (16.00+)</option>
          </select>
          <select name="branchId" defaultValue={branchIdFilter > 0 ? String(branchIdFilter) : ""}>
            <option value="">Semua Cabang</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
          <select name="sort" defaultValue={sort}>
            <option value="time_early">Paling Pagi</option>
            <option value="queue_low">Antrean Terpendek</option>
            <option value="doctor_az">Nama Dokter A-Z</option>
          </select>
          <button type="submit">Terapkan</button>
        </form>
      </section>

      <section className={styles.todayBoard}>
        <article className={styles.todayPanel}>
          <div className={styles.sectionHead}>
            <h3>Jadwal Dokter ({scheduleLabel})</h3>
            <a href="/jadwal-dokter" className={styles.cardLink}>Lihat Semua</a>
          </div>
          {visibleJadwals.length === 0 ? (
            <p>Belum ada jadwal dokter untuk hari ini.</p>
          ) : (
            <ul className={styles.todayList}>
              {visibleJadwals.map((j) => (
                <li key={j.id} className={styles.todayItem}>
                  <strong>Dr. {j.dokter.user.name}</strong>
                  <span>{j.poli.namaPoli}</span>
                  <small>
                    {formatTime(j.jamMulai)} - {formatTime(j.jamSelesai)}
                  </small>
                </li>
              ))}
            </ul>
          )}
          {hasMoreJadwals ? <small className={styles.mutedText}>Menampilkan 4 dari {sortedJadwals.length} jadwal.</small> : null}
        </article>
        <article className={styles.todayPanel}>
          <div className={styles.sectionHead}>
            <h3>Status Poli Hari Ini</h3>
            <small className={styles.mutedText}>{visiblePolis.length} poli ditampilkan</small>
          </div>
          <ul className={styles.poliStatusList}>
            {visiblePolis.map((poli) => {
              const isOpen = isPoliOpenToday;
              return (
                <li key={poli.id} className={styles.poliStatusItem}>
                  <div className={styles.poliStatusInfo}>
                    <span className={styles.poliStatusName}>{poli.namaPoli}</span>
                    <small className={styles.poliStatusMeta}>
                      Hari libur poli: Minggu
                    </small>
                  </div>
                  <span className={isOpen ? styles.statusBadgeOpen : styles.statusBadgeClosed}>
                    {isOpen ? "Buka" : "Tutup"}
                  </span>
                </li>
              );
            })}
          </ul>
          {hasMorePolis ? (
            <a href="/poli" className={styles.cardLink}>Lihat Semua Poli</a>
          ) : null}
        </article>
      </section>

      <section className={styles.content}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Kenapa Menggunakan BK Poli Digital Care?</h2>
          <div className={styles.cards}>
            {highlights.map((item) => (
              <article key={item.title} className={styles.infoCard}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className={styles.stepPanel}>
            <h3>Informasi Poliklinik</h3>
            <ul className={styles.stepList}>
              {clinicInfo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Edukasi Kesehatan</h2>
          <p>Konten edukasi terjadwal berdasarkan kategori kesehatan.</p>
          {educations.length === 0 ? (
            <p>Belum ada konten edukasi yang ditayangkan.</p>
          ) : (
            <div className={styles.cards}>
              {educations.map((edu) => (
                <article key={edu.id} className={styles.infoCard}>
                  <small>{edu.category} • {new Date(edu.publishAt).toLocaleDateString("id-ID")}</small>
                  <h3>{edu.title}</h3>
                  <p>{edu.summary ?? edu.content.slice(0, 120)}...</p>
                </article>
              ))}
            </div>
          )}
          <a href="/edukasi" className={styles.cardLink}>
            Lihat semua edukasi kesehatan
          </a>
        </section>
      </section>

      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>Layanan Unggulan</h2>
        <div className={styles.serviceGrid}>
          {featuredServices.map((service) => (
            <article key={service.title} className={styles.serviceCard}>
              <div className={styles.serviceIcon} aria-hidden>
                {service.icon}
              </div>
              <div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.infoStrip}>
        <article className={styles.infoStripCard}>
          <h3>Jam Operasional</h3>
          <p>{appConfig?.weekdayHours ?? "Senin - Jumat: 08.00 - 20.00"}</p>
          <p>{appConfig?.saturdayHours ?? "Sabtu: 08.00 - 14.00"}</p>
          <p>{appConfig?.holidayHours ?? "Minggu/Hari Libur: Tutup"}</p>
        </article>
        <article className={styles.infoStripCard}>
          <h3>Kontak Klinik</h3>
          <p>Telepon: {appConfig?.contactPhone ?? "(021) 555-0188"}</p>
          <p>WhatsApp: {appConfig?.contactWhatsapp ?? "0812-0000-8899"}</p>
          <p>Email: {appConfig?.contactEmail ?? "layanan@bkpoli.local"}</p>
        </article>
        <article className={styles.infoStripCard}>
          <h3>Aksi Cepat</h3>
          <div className={styles.quickActions}>
            <a href="/jadwal-dokter" className={styles.ctaSecondary}>
              Lihat Jadwal
            </a>
            <a href="/poli" className={styles.ctaSecondary}>
              Daftar Poli
            </a>
            <a href="/login" className={styles.ctaSecondary}>
              Login
            </a>
            <a href="/cek-booking" className={styles.ctaSecondary}>
              Cek Booking
            </a>
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <h2 className={styles.panelTitle}>Poliklinik Tersedia</h2>
          <a href="/poli" className={styles.cardLink}>Lihat Semua</a>
        </div>
        {visiblePolis.length === 0 ? (
          <p>Data poliklinik belum tersedia.</p>
        ) : (
          <div className={styles.poliGrid}>
            {visiblePolis.map((poli) => (
              <article key={poli.id} className={styles.poliCard}>
                <h3>{poli.namaPoli}</h3>
                <p>{poli.keterangan || "Layanan pemeriksaan sesuai jadwal dokter di poli ini."}</p>
                <small>{poli._count.dokterPolis} dokter terdaftar</small>
              </article>
            ))}
          </div>
        )}
        {hasMorePolis ? <small className={styles.mutedText}>Menampilkan 4 dari {poliIdFilter > 0 ? polis.length : totalPoli} poli.</small> : null}
      </section>

      <section className={styles.content}>
        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Pertanyaan Umum (FAQ)</h2>
          <div className={styles.faqList}>
            {faqs.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <h2 className={styles.panelTitle}>Kepercayaan Layanan</h2>
          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <strong>{totalDokter}+</strong>
              <span>Dokter aktif</span>
            </div>
            <div className={styles.trustCard}>
              <strong>{totalPoli}+</strong>
              <span>Poliklinik layanan</span>
            </div>
            <div className={styles.trustCard}>
              <strong>{totalPasien}+</strong>
              <span>Pasien terdaftar</span>
            </div>
            <div className={styles.trustCard}>
              <strong>{totalJadwal}+</strong>
              <span>Slot jadwal tercatat</span>
            </div>
          </div>
          <p className={styles.disclaimer}>
            Informasi di halaman ini bersifat edukatif dan tidak menggantikan pemeriksaan langsung oleh tenaga medis.
          </p>
        </article>
      </section>

      <nav className={styles.mobileActionBar} aria-label="Aksi cepat mobile">
        <a href="/daftar-pengobatan" className={styles.mobileActionPrimary}>
          Daftar
        </a>
        <a href="/cek-booking" className={styles.mobileActionSecondary}>
          Cek Booking
        </a>
        <a href={waLink} className={styles.mobileActionSecondary} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </nav>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <article className={styles.statCard}>
      <div className={styles.statLabel}>{title}</div>
      <div className={styles.statValue}>{value}</div>
    </article>
  );
}

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

