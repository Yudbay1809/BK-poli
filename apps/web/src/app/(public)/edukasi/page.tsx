import Link from "next/link";
import { prisma } from "@/lib/prisma";

type PageProps = {
  searchParams?: Promise<{ category?: string }>;
};

export default async function PublicEdukasiPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : undefined;
  const category = (params?.category ?? "").trim();
  const now = new Date();

  const [categories, items, scheduled] = await Promise.all([
    prisma.healthEducation.findMany({
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
    prisma.healthEducation.findMany({
      where: {
        isActive: true,
        publishAt: { lte: now },
        ...(category ? { category } : {}),
      },
      orderBy: { publishAt: "desc" },
    }),
    prisma.healthEducation.findMany({
      where: { isActive: true, publishAt: { gt: now } },
      orderBy: { publishAt: "asc" },
      take: 6,
    }),
  ]);

  return (
    <main className="flow-md layout-container">
      <h1 className="app-title">Edukasi Kesehatan</h1>
      <p className="app-subtitle">Materi kesehatan terjadwal untuk keluarga dan pasien.</p>

      <section className="flow-sm">
        <form action="/edukasi" method="get" className="form-toolbar">
          <select name="category" defaultValue={category}>
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.category} value={c.category}>{c.category}</option>
            ))}
          </select>
          <button type="submit">Filter</button>
        </form>
      </section>

      <section className="flow-sm">
        <h3>Konten Tayang</h3>
        {items.length === 0 ? (
          <p>Belum ada konten edukasi tersedia.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Publikasi</th>
                  <th>Ringkasan</th>
                </tr>
              </thead>
              <tbody>
                {items.map((edu) => (
                  <tr key={edu.id}>
                    <td>{edu.title}</td>
                    <td>{edu.category}</td>
                    <td>{new Date(edu.publishAt).toLocaleDateString("id-ID")}</td>
                    <td>{edu.summary ?? `${edu.content.slice(0, 140)}...`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flow-sm">
        <h3>Jadwal Publikasi Berikutnya</h3>
        {scheduled.length === 0 ? (
          <p>Belum ada konten terjadwal.</p>
        ) : (
          <ul className="quick-list">
            {scheduled.map((edu) => (
              <li key={edu.id}>
                {new Date(edu.publishAt).toLocaleDateString("id-ID")} • {edu.title} ({edu.category})
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/">Kembali ke Beranda</Link>
    </main>
  );
}
