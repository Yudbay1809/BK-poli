import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

export default async function SuperAdminOrganizationPage({ searchParams }: PageProps) {
  await requireAuthRole(["SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  const [branches, polis, dokters, mappings] = await Promise.all([
    prisma.clinicBranch.findMany({ orderBy: { name: "asc" } }),
    prisma.poli.findMany({
      orderBy: { namaPoli: "asc" },
      include: { branch: true, _count: { select: { dokterPolis: true } } },
    }),
    prisma.dokter.findMany({
      include: { user: { select: { name: true } }, dokterPolis: { include: { poli: true } } },
    }),
    prisma.dokterPoli.findMany({
      include: { dokter: { include: { user: { select: { name: true } } } }, poli: { select: { namaPoli: true } } },
    }),
  ]);

  async function createBranchAction(formData: FormData) {
    "use server";
    await requireAuthRole(["SUPER_ADMIN"]);
    const name = String(formData.get("name") ?? "").trim();
    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const province = String(formData.get("province") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    if (!name || !code) {
      redirect("/super-admin/organization?err=Nama%20dan%20kode%20cabang%20wajib%20diisi");
    }

    try {
      await prisma.clinicBranch.create({
        data: { name, code, address: address || null, city: city || null, province: province || null, phone: phone || null },
      });
    } catch {
      redirect("/super-admin/organization?err=Kode%20cabang%20sudah%20digunakan");
    }

    revalidatePath("/super-admin/organization");
    redirect("/super-admin/organization?msg=Cabang%20berhasil%20ditambahkan");
  }

  async function updateBranchAction(formData: FormData) {
    "use server";
    await requireAuthRole(["SUPER_ADMIN"]);
    const id = Number(formData.get("id"));
    const name = String(formData.get("name") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const province = String(formData.get("province") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const isActive = String(formData.get("isActive") ?? "") === "true";

    if (!Number.isInteger(id) || id <= 0 || !name) {
      redirect("/super-admin/organization?err=Data%20cabang%20tidak%20valid");
    }

    await prisma.clinicBranch.update({
      where: { id },
      data: { name, address: address || null, city: city || null, province: province || null, phone: phone || null, isActive },
    });
    revalidatePath("/super-admin/organization");
    redirect("/super-admin/organization?msg=Cabang%20berhasil%20diperbarui");
  }

  async function assignPoliBranchAction(formData: FormData) {
    "use server";
    await requireAuthRole(["SUPER_ADMIN"]);
    const poliId = Number(formData.get("poliId"));
    const branchIdValue = String(formData.get("branchId") ?? "").trim();
    let branchId: number | null = null;
    if (branchIdValue) {
      const parsedBranchId = Number(branchIdValue);
      if (!Number.isInteger(parsedBranchId) || parsedBranchId <= 0) {
        redirect("/super-admin/organization?err=Mapping%20poli%20tidak%20valid");
      }
      branchId = parsedBranchId;
    }

    if (!Number.isInteger(poliId) || poliId <= 0) {
      redirect("/super-admin/organization?err=Mapping%20poli%20tidak%20valid");
    }

    await prisma.poli.update({
      where: { id: poliId },
      data: { branchId },
    });
    revalidatePath("/super-admin/organization");
    redirect("/super-admin/organization?msg=Mapping%20poli%20berhasil%20diperbarui");
  }

  async function mapDokterPoliAction(formData: FormData) {
    "use server";
    await requireAuthRole(["SUPER_ADMIN"]);
    const dokterId = Number(formData.get("dokterId"));
    const poliId = Number(formData.get("poliId"));

    if (!Number.isInteger(dokterId) || dokterId <= 0 || !Number.isInteger(poliId) || poliId <= 0) {
      redirect("/super-admin/organization?err=Mapping%20dokter%20tidak%20valid");
    }

    await prisma.dokterPoli.create({
      data: { dokterId, poliId },
    });
    revalidatePath("/super-admin/organization");
    redirect("/super-admin/organization?msg=Dokter%20berhasil%20ditambahkan%20ke%20poli");
  }

  async function removeDokterPoliAction(formData: FormData) {
    "use server";
    await requireAuthRole(["SUPER_ADMIN"]);
    const dokterId = Number(formData.get("dokterId"));
    const poliId = Number(formData.get("poliId"));

    if (!Number.isInteger(dokterId) || dokterId <= 0 || !Number.isInteger(poliId) || poliId <= 0) {
      redirect("/super-admin/organization?err=Data%20mapping%20tidak%20valid");
    }

    await prisma.dokterPoli.delete({
      where: { dokterId_poliId: { dokterId, poliId } },
    });
    revalidatePath("/super-admin/organization");
    redirect("/super-admin/organization?msg=Mapping%20dokter%20dihapus");
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Organisasi</h1>
      <p className="app-subtitle">Kelola cabang klinik, poli, dan mapping dokter.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Cabang Klinik</h3>
        <form action={createBranchAction} className="form-layout" style={{ maxWidth: 760 }}>
          <label className="form-field">
            Nama Cabang
            <input name="name" required />
          </label>
          <label className="form-field">
            Kode Cabang
            <input name="code" required />
          </label>
          <label className="form-field">
            Alamat
            <input name="address" />
          </label>
          <label className="form-field">
            Kota
            <input name="city" />
          </label>
          <label className="form-field">
            Provinsi
            <input name="province" />
          </label>
          <label className="form-field">
            Telepon
            <input name="phone" />
          </label>
          <button type="submit">Tambah Cabang</button>
        </form>

        {branches.length === 0 ? (
          <p>Belum ada cabang terdaftar.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Kode</th>
                  <th>Alamat</th>
                  <th>Kota</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td>{branch.name}</td>
                    <td>{branch.code}</td>
                    <td>{branch.address ?? "-"}</td>
                    <td>{branch.city ?? "-"}</td>
                    <td>{branch.isActive ? "Aktif" : "Nonaktif"}</td>
                    <td>
                      <form action={updateBranchAction} className="form-toolbar">
                        <input type="hidden" name="id" value={branch.id} />
                        <input name="name" defaultValue={branch.name} />
                        <input name="address" defaultValue={branch.address ?? ""} placeholder="Alamat" />
                        <input name="city" defaultValue={branch.city ?? ""} placeholder="Kota" />
                        <input name="province" defaultValue={branch.province ?? ""} placeholder="Provinsi" />
                        <input name="phone" defaultValue={branch.phone ?? ""} placeholder="Telepon" />
                        <select name="isActive" defaultValue={String(branch.isActive)}>
                          <option value="true">Aktif</option>
                          <option value="false">Nonaktif</option>
                        </select>
                        <button type="submit">Simpan</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flow-sm">
        <h3>Mapping Poli ke Cabang</h3>
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th>Poli</th>
                <th>Dokter</th>
                <th>Cabang</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {polis.map((poli) => (
                <tr key={poli.id}>
                  <td>{poli.namaPoli}</td>
                  <td>{poli._count.dokterPolis} dokter</td>
                  <td>{poli.branch?.name ?? "-"}</td>
                  <td>
                    <form action={assignPoliBranchAction} className="form-toolbar">
                      <input type="hidden" name="poliId" value={poli.id} />
                      <select name="branchId" defaultValue={poli.branchId ?? ""}>
                        <option value="">Tanpa Cabang</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                      <button type="submit">Update</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flow-sm">
        <h3>Mapping Dokter ke Poli</h3>
        <form action={mapDokterPoliAction} className="form-layout" style={{ maxWidth: 760 }}>
          <label className="form-field">
            Dokter
            <select name="dokterId" required>
              <option value="">Pilih Dokter</option>
              {dokters.map((d) => (
                <option key={d.id} value={d.id}>{d.user.name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            Poli
            <select name="poliId" required>
              <option value="">Pilih Poli</option>
              {polis.map((p) => (
                <option key={p.id} value={p.id}>{p.namaPoli}</option>
              ))}
            </select>
          </label>
          <button type="submit">Tambah Mapping</button>
        </form>

        {mappings.length === 0 ? (
          <p>Belum ada mapping dokter ke poli.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Dokter</th>
                  <th>Poli</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {mappings.map((m) => (
                  <tr key={`${m.dokterId}-${m.poliId}`}>
                    <td>{m.dokter.user.name}</td>
                    <td>{m.poli.namaPoli}</td>
                    <td>
                      <form action={removeDokterPoliAction}>
                        <input type="hidden" name="dokterId" value={m.dokterId} />
                        <input type="hidden" name="poliId" value={m.poliId} />
                        <button type="submit">Hapus</button>
                      </form>
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
