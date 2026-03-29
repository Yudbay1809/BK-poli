import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Role } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { getCurrentPasienContext } from "@/lib/current-user";
import { saveUploadedFile } from "@/lib/upload";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

export default async function PasienDokumenPage({ searchParams }: PageProps) {
  const { pasien } = await getCurrentPasienContext();
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  const documents = await prisma.patientDocument.findMany({
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

  async function uploadDocumentAction(formData: FormData) {
    "use server";
    const { pasien } = await getCurrentPasienContext();
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      redirect("/pasien/dokumen?err=File%20dokumen%20wajib%20diunggah");
    }

    const saved = await saveUploadedFile(file, "pasien");

    await prisma.patientDocument.create({
      data: {
        pasienId: pasien.id,
        title: title || null,
        category: category || null,
        filePath: saved.filePath,
        fileName: saved.fileName,
        fileType: saved.fileType,
        fileSize: saved.fileSize,
        uploadedByRole: Role.PASIEN,
      },
    });

    revalidatePath("/pasien/dokumen");
    redirect("/pasien/dokumen?msg=Dokumen%20berhasil%20diunggah");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Dokumen Pasien</h1>
      <p className="app-subtitle">Unggah dokumen pendukung seperti rujukan atau hasil lab.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Upload Dokumen</h3>
        <form action={uploadDocumentAction} className="form-layout" style={{ maxWidth: 620 }} encType="multipart/form-data">
          <label className="form-field">
            Judul Dokumen
            <input name="title" placeholder="Contoh: Hasil Lab Darah" />
          </label>
          <label className="form-field">
            Kategori
            <input name="category" placeholder="Contoh: Rujukan / Lab / Radiologi" />
          </label>
          <label className="form-field">
            File Dokumen
            <input name="file" type="file" required />
          </label>
          <button type="submit">Unggah Dokumen</button>
        </form>
      </section>

      <section className="flow-sm">
        <h3>Daftar Dokumen</h3>
        {documents.length === 0 ? (
          <p>Belum ada dokumen yang diunggah.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Kategori</th>
                  <th>Tanggal</th>
                  <th>Relasi Pemeriksaan</th>
                  <th>File</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.title ?? doc.fileName}</td>
                    <td>{doc.category ?? "-"}</td>
                    <td>{new Date(doc.createdAt).toLocaleString("id-ID")}</td>
                    <td>
                      {doc.periksa
                        ? `${doc.periksa.daftarPoli.jadwal.poli.namaPoli} (${new Date(doc.periksa.tglPeriksa).toLocaleDateString("id-ID")})`
                        : "-"}
                    </td>
                    <td>
                      <a href={doc.filePath} target="_blank" rel="noreferrer">
                        Unduh
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
