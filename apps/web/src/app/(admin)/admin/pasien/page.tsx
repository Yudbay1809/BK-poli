import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";
import PaginationLinks from "@/components/PaginationLinks";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import EmptyState from "@/components/EmptyState";
import FormSubmitButton from "@/components/FormSubmitButton";

type PageProps = {
  searchParams?: Promise<{
    msg?: string;
    err?: string;
    q?: string;
    page?: string;
    pageSize?: string;
  }>;
};

function generateNoRm() {
  const date = new Date();
  const ym = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const suffix = `${Date.now()}`.slice(-5);
  return `${ym}-${suffix}`;
}

export default async function AdminPasienPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;
  const q = (params?.q ?? "").trim();
  const page = Math.max(1, Number(params?.page ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(5, Number(params?.pageSize ?? 10) || 10));

  const whereClause = q
    ? {
        OR: [
          { noRm: { contains: q, mode: "insensitive" as const } },
          { noKtp: { contains: q, mode: "insensitive" as const } },
          { user: { name: { contains: q, mode: "insensitive" as const } } },
          { user: { username: { contains: q, mode: "insensitive" as const } } },
          { user: { email: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : undefined;

  const total = await prisma.pasien.count({ where: whereClause });
  const pasiens = await prisma.pasien.findMany({
    where: whereClause,
    orderBy: { id: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      user: { select: { id: true, name: true, username: true, email: true, isActive: true } },
      _count: { select: { daftarPoliList: true } },
    },
  });

  async function createPasienAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);

    const name = String(formData.get("name") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim().toLowerCase();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const noKtp = String(formData.get("noKtp") ?? "").trim();
    const alamat = String(formData.get("alamat") ?? "").trim();
    const noHp = String(formData.get("noHp") ?? "").trim();

    if (!name || !username || !email || password.length < 8 || !noKtp) {
      redirect("/admin/pasien?err=Input%20pasien%20tidak%20valid");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const noRm = generateNoRm();

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { name, username, email, passwordHash, role: Role.PASIEN, isActive: true },
        });
        await tx.pasien.create({
          data: {
            userId: user.id,
            noRm,
            noKtp,
            alamat: alamat || null,
            noHp: noHp || null,
          },
        });
      });
      revalidatePath("/admin/pasien");
      redirect("/admin/pasien?msg=Pasien%20berhasil%20ditambahkan");
    } catch {
      redirect("/admin/pasien?err=Username/email/NoKTP/NoRM%20sudah%20digunakan");
    }
  }

  async function updatePasienAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);

    const pasienId = Number(formData.get("pasienId"));
    const userId = Number(formData.get("userId"));
    const name = String(formData.get("name") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim().toLowerCase();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const noKtp = String(formData.get("noKtp") ?? "").trim();
    const alamat = String(formData.get("alamat") ?? "").trim();
    const noHp = String(formData.get("noHp") ?? "").trim();

    if (!Number.isInteger(pasienId) || !Number.isInteger(userId) || !name || !username || !email || !noKtp) {
      redirect("/admin/pasien?err=Data%20edit%20pasien%20tidak%20valid");
    }

    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { name, username, email },
        }),
        prisma.pasien.update({
          where: { id: pasienId },
          data: { noKtp, alamat: alamat || null, noHp: noHp || null },
        }),
      ]);
      revalidatePath("/admin/pasien");
      redirect("/admin/pasien?msg=Pasien%20berhasil%20diupdate");
    } catch {
      redirect("/admin/pasien?err=Username,%20email,%20atau%20NoKTP%20sudah%20digunakan");
    }
  }

  async function togglePasienStatusAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);

    const userId = Number(formData.get("userId"));
    const toActive = String(formData.get("toActive")) === "1";
    if (!Number.isInteger(userId) || userId <= 0) redirect("/admin/pasien?err=User%20pasien%20tidak%20valid");

    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: toActive,
        deactivatedAt: toActive ? null : new Date(),
        sessionVersion: { increment: 1 },
      },
    });
    revalidatePath("/admin/pasien");
    redirect("/admin/pasien?msg=Status%20pasien%20berhasil%20diubah");
  }

  async function deletePasienAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const pasienId = Number(formData.get("pasienId"));
    const userId = Number(formData.get("userId"));
    if (!Number.isInteger(pasienId) || !Number.isInteger(userId)) {
      redirect("/admin/pasien?err=Data%20hapus%20pasien%20tidak%20valid");
    }

    const pasien = await prisma.pasien.findUnique({
      where: { id: pasienId },
      include: { _count: { select: { daftarPoliList: true } } },
    });
    if (!pasien) redirect("/admin/pasien?err=Pasien%20tidak%20ditemukan");
    if (pasien._count.daftarPoliList > 0) {
      redirect("/admin/pasien?err=Pasien%20memiliki%20riwayat%20antrian,%20tidak%20bisa%20dihapus");
    }

    await prisma.$transaction([
      prisma.pasien.delete({ where: { id: pasienId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
    revalidatePath("/admin/pasien");
    redirect("/admin/pasien?msg=Pasien%20berhasil%20dihapus");
  }

  return (
    <main>
      <h1>Kelola Pasien</h1>
      {msg ? <p>{msg}</p> : null}
      {err ? <p>{err}</p> : null}

      <section>
        <h3>Tambah Pasien</h3>
        <form action={createPasienAction}>
          <label>Nama<input name="name" required /></label>
          <label>Username<input name="username" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Password<input name="password" type="password" minLength={8} required /></label>
          <label>No KTP<input name="noKtp" required /></label>
          <label>Alamat<input name="alamat" /></label>
          <label>No HP<input name="noHp" /></label>
          <FormSubmitButton idleLabel="Simpan" pendingLabel="Menyimpan..." />
        </form>
      </section>

      <section>
        <h3>Daftar Pasien</h3>
        <form action="/admin/pasien" method="get">
          <input name="q" defaultValue={q} placeholder="Cari nama/username/email/noRM/noKTP" />
          <input type="hidden" name="pageSize" value={pageSize} />
          <button type="submit">Cari</button>
          <a
            href={`/admin/pasien/export?${new URLSearchParams({ q }).toString()}`}
          >
            Export CSV
          </a>
        </form>
        {pasiens.length === 0 ? (
          <EmptyState
            title="Data Pasien Kosong"
            description="Belum ada pasien yang cocok dengan filter saat ini."
            icon="ðŸ§‘â€âš•ï¸"
          />
        ) : (
        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th >ID</th>
                <th >Nama</th>
                <th >Username</th>
                <th >Email</th>
                <th >No RM</th>
                <th >No KTP</th>
                <th >Alamat</th>
                <th >No HP</th>
                <th >Status</th>
                <th >Riwayat Antrian</th>
                <th >Edit</th>
                <th >Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pasiens.map((pasien) => (
                  <tr key={pasien.id}>
                    <td >{pasien.id}</td>
                    <td >{pasien.user.name}</td>
                    <td >{pasien.user.username}</td>
                    <td >{pasien.user.email}</td>
                    <td >{pasien.noRm}</td>
                    <td >{pasien.noKtp}</td>
                    <td >{pasien.alamat ?? "-"}</td>
                    <td >{pasien.noHp ?? "-"}</td>
                    <td >{pasien.user.isActive ? "Aktif" : "Nonaktif"}</td>
                    <td >{pasien._count.daftarPoliList}</td>
                    <td >
                      <form action={updatePasienAction}>
                        <input type="hidden" name="pasienId" value={pasien.id} />
                        <input type="hidden" name="userId" value={pasien.user.id} />
                        <input name="name" defaultValue={pasien.user.name} required />
                        <input name="username" defaultValue={pasien.user.username} required />
                        <input name="email" type="email" defaultValue={pasien.user.email} required />
                        <input name="noKtp" defaultValue={pasien.noKtp} required />
                        <input name="alamat" defaultValue={pasien.alamat ?? ""} />
                        <input name="noHp" defaultValue={pasien.noHp ?? ""} />
                        <FormSubmitButton idleLabel="Update" pendingLabel="Mengupdate..." />
                      </form>
                    </td>
                    <td >
                      <div>
                        <form action={togglePasienStatusAction}>
                          <input type="hidden" name="userId" value={pasien.user.id} />
                          <input type="hidden" name="toActive" value={pasien.user.isActive ? "0" : "1"} />
                          <ConfirmSubmitButton
                            type="submit"
                            confirmMessage={pasien.user.isActive ? "Nonaktifkan pasien ini?" : "Aktifkan pasien ini?"}
                          >
                            {pasien.user.isActive ? "Nonaktifkan" : "Aktifkan"}
                          </ConfirmSubmitButton>
                        </form>
                        <form action={deletePasienAction}>
                          <input type="hidden" name="pasienId" value={pasien.id} />
                          <input type="hidden" name="userId" value={pasien.user.id} />
                          <ConfirmSubmitButton type="submit" confirmMessage="Hapus pasien ini?">
                            Hapus
                          </ConfirmSubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        )}
        <PaginationLinks basePath="/admin/pasien" page={page} pageSize={pageSize} total={total} query={{ q }} />
      </section>
    </main>
  );
}



