import Link from "next/link";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import styles from "./jadwal.module.css";
import JadwalFilterForm from "./JadwalFilterForm";

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    poliId?: string;
    hari?: string;
  }>;
};

function formatTime(date: Date) {
  return date.toISOString().slice(11, 16);
}

export default async function PublicJadwalDokterPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const q = (params?.q ?? "").trim();
  const poliIdFilter = Number(params?.poliId ?? 0);
  const dayOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] as const;
  const dayIndex = new Map(dayOrder.map((d, i) => [d, i]));
  const todayName = dayOrder[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const hariParam = (params?.hari ?? "").trim();
  const hariFilter = !hariParam ? todayName : hariParam;

  const polis = await prisma.poli.findMany({ orderBy: { namaPoli: "asc" } });

  const whereClause: {
    dokter?: { user?: { name?: { contains: string; mode: "insensitive" } } };
    poliId?: number;
    hari?: { contains: string; mode: "insensitive" };
  } = {};

  if (poliIdFilter > 0) {
    whereClause.poliId = poliIdFilter;
  }

  if (q) {
    whereClause.dokter = {
      ...(whereClause.dokter ?? {}),
      user: { name: { contains: q, mode: "insensitive" } },
    };
  }

  if (hariFilter !== "all") {
    whereClause.hari = { contains: hariFilter, mode: "insensitive" };
  }

  const jadwals = await prisma.jadwalPeriksa.findMany({
    where: Object.keys(whereClause).length ? whereClause : undefined,
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
    include: {
      dokter: { include: { user: { select: { name: true } } } },
      poli: { select: { namaPoli: true } },
    },
  });

  const sortedJadwals = [...jadwals].sort((a, b) => {
    const dayDiff = (dayIndex.get(a.hari as (typeof dayOrder)[number]) ?? 99) - (dayIndex.get(b.hari as (typeof dayOrder)[number]) ?? 99);
    if (dayDiff !== 0) return dayDiff;
    return a.jamMulai.getTime() - b.jamMulai.getTime();
  });

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1 className={styles.title}>Jadwal Dokter</h1>
          <p className={styles.subtitle}>
            Informasi jadwal praktik dokter per poli, tersusun rapi untuk memudahkan pasien memilih waktu kunjungan.
          </p>
        </div>
        <div className={styles.heroActions}>
          <Link href="/" className={styles.ghostLink}>
            Kembali ke Beranda
          </Link>
          <Link href="/daftar-pengobatan" className={styles.primaryLink}>
            Daftar Pengobatan
          </Link>
        </div>
      </section>

      <section className={styles.filterCard}>
        <JadwalFilterForm
          q={q}
          poliIdFilter={poliIdFilter}
          hariFilter={hariFilter}
          todayName={todayName}
          polis={polis}
        />
      </section>

      <section className={styles.resultCard}>
        <div className={styles.resultHead}>
          <h2>Daftar Jadwal</h2>
          <span className={styles.countBadge}>{sortedJadwals.length} jadwal</span>
        </div>
        {sortedJadwals.length === 0 ? (
          <EmptyState
            title="Jadwal Belum Tersedia"
            description="Belum ada jadwal dokter yang cocok dengan filter saat ini."
            icon="J"
          />
        ) : (
          <div>
            <div className={`${styles.tableOnly} table-scroll`}>
              <table className="data-table" style={{ minWidth: 900 }}>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Dokter</th>
                    <th>Poli</th>
                    <th>Hari</th>
                    <th>Jam Praktik</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedJadwals.map((j, idx) => (
                    <tr key={j.id}>
                      <td>{idx + 1}</td>
                      <td>Dr. {j.dokter.user.name}</td>
                      <td>{j.poli.namaPoli}</td>
                      <td>{j.hari}</td>
                      <td>
                        {formatTime(j.jamMulai)} - {formatTime(j.jamSelesai)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileList}>
              {sortedJadwals.map((j, idx) => (
                <article key={j.id} className={styles.mobileCard}>
                  <div className={styles.mobileHead}>
                    <strong>Dr. {j.dokter.user.name}</strong>
                    <span className={styles.mobileNo}>#{idx + 1}</span>
                  </div>
                  <p className={styles.mobileMeta}>
                    <span>{j.poli.namaPoli}</span>
                    <span>{j.hari}</span>
                  </p>
                  <p className={styles.mobileTime}>
                    {formatTime(j.jamMulai)} - {formatTime(j.jamSelesai)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
