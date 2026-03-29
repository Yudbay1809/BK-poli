import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

function normalizeBpjs(value: string) {
  return value.replace(/\D/g, "");
}

export default async function AdminBpjsPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  const polis = await prisma.poli.findMany({ orderBy: { namaPoli: "asc" } });

  async function updateBpjsAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const poliId = Number(formData.get("poliId"));
    const bpjsCode = String(formData.get("bpjsCode") ?? "").trim();
    const bpjsName = String(formData.get("bpjsName") ?? "").trim();

    if (!Number.isInteger(poliId) || poliId <= 0) {
      redirect("/admin/bpjs?err=Data%20poli%20tidak%20valid");
    }

    await prisma.poli.update({
      where: { id: poliId },
      data: {
        bpjsCode: bpjsCode || null,
        bpjsName: bpjsName || null,
      },
    });

    revalidatePath("/admin/bpjs");
    revalidatePath("/poli");
    redirect("/admin/bpjs?msg=Mapping%20BPJS%20berhasil%20disimpan");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Manajemen BPJS</h1>
      <p className="app-subtitle">Atur kode layanan BPJS per poli dan validasi nomor BPJS.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Aturan Nomor BPJS</h3>
        <ul className="quick-list">
          <li>Nomor BPJS wajib 13 digit angka.</li>
          <li>Sistem akan menolak input jika format tidak valid.</li>
        </ul>
      </section>

      <section className="flow-sm">
        <h3>Mapping Poli ke BPJS</h3>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 920 }}>
            <thead>
              <tr>
                <th>Poli</th>
                <th>Mapping BPJS</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {polis.map((poli) => (
                <tr key={poli.id}>
                  <td>{poli.namaPoli}</td>
                  <td>
                    <form action={updateBpjsAction} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <input type="hidden" name="poliId" value={poli.id} />
                      <input name="bpjsCode" defaultValue={poli.bpjsCode ?? ""} placeholder="Kode BPJS" />
                      <input name="bpjsName" defaultValue={poli.bpjsName ?? ""} placeholder="Nama layanan" />
                      <button type="submit">Simpan</button>
                    </form>
                  </td>
                  <td>
                    <span className="muted-text">{poli.bpjsCode ? "Aktif" : "Belum diatur"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flow-sm">
        <h3>Validator BPJS (contoh)</h3>
        <p>Contoh nomor valid: <strong>{normalizeBpjs("0001234567890")}</strong></p>
      </section>
    </main>
  );
}
