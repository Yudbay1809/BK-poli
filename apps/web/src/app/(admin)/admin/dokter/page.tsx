import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";
import FormSubmitButton from "@/components/FormSubmitButton";

type PageProps = {
  searchParams?: Promise<{
    msg?: string;
    err?: string;
    q?: string;
    poliId?: string;
  }>;
};

function parsePoliIds(formData: FormData) {
  return Array.from(new Set(formData.getAll("poliIds").map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0)));
}

export default async function AdminDokterPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;

  const msg = params?.msg;
  const err = params?.err;
  const q = (params?.q ?? "").trim();
  const poliIdFilter = Number(params?.poliId ?? 0);

  const polis = await prisma.poli.findMany({ orderBy: { namaPoli: "asc" } });

  const whereClause: {
    dokterPolis?: { some: { poliId: number } };
    OR?: Array<
      | { nip: { contains: string; mode: "insensitive" } }
      | { user: { name: { contains: string; mode: "insensitive" } } }
      | { user: { username: { contains: string; mode: "insensitive" } } }
      | { user: { email: { contains: string; mode: "insensitive" } } }
      | { dokterPolis: { some: { poli: { namaPoli: { contains: string; mode: "insensitive" } } } } }
    >;
  } = {};

  if (Number.isInteger(poliIdFilter) && poliIdFilter > 0) {
    whereClause.dokterPolis = { some: { poliId: poliIdFilter } };
  }

  if (q) {
    whereClause.OR = [
      { nip: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { username: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { dokterPolis: { some: { poli: { namaPoli: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  const dokters = await prisma.dokter.findMany({
    where: whereClause,
    orderBy: { id: "desc" },
    include: {
      user: {
        select: { id: true, name: true, username: true, email: true, isActive: true },
      },
      dokterPolis: {
        include: { poli: { select: { id: true, namaPoli: true } } },
        orderBy: { poli: { namaPoli: "asc" } },
      },
      _count: {
        select: { jadwals: true },
      },
    },
  });

  async function createDokterAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const name = String(formData.get("name") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim().toLowerCase();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const nip = String(formData.get("nip") ?? "").trim();
    const poliIds = parsePoliIds(formData);
    const alamat = String(formData.get("alamat") ?? "").trim();
    const noHp = String(formData.get("noHp") ?? "").trim();

    if (!name || !username || !email || password.length < 8 || !nip || poliIds.length === 0) {
      redirect("/admin/dokter?err=Input%20dokter%20tidak%20valid");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name,
            username,
            email,
            passwordHash,
            role: Role.DOKTER,
            isActive: true,
          },
        });

        const dokter = await tx.dokter.create({
          data: {
            userId: user.id,
            nip,
            alamat: alamat || null,
            noHp: noHp || null,
          },
        });

        await tx.dokterPoli.createMany({
          data: poliIds.map((poliId) => ({ dokterId: dokter.id, poliId })),
          skipDuplicates: true,
        });
      });
      revalidatePath("/admin/dokter");
      redirect("/admin/dokter?msg=Dokter%20berhasil%20ditambahkan");
    } catch {
      redirect("/admin/dokter?err=Username,%20email,%20atau%20NIP%20sudah%20digunakan");
    }
  }

  async function updateDokterAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const dokterId = Number(formData.get("dokterId"));
    const userId = Number(formData.get("userId"));
    const name = String(formData.get("name") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim().toLowerCase();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const nip = String(formData.get("nip") ?? "").trim();
    const poliIds = parsePoliIds(formData);
    const alamat = String(formData.get("alamat") ?? "").trim();
    const noHp = String(formData.get("noHp") ?? "").trim();

    if (
      !Number.isInteger(dokterId) ||
      dokterId <= 0 ||
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !name ||
      !username ||
      !email ||
      !nip ||
      poliIds.length === 0
    ) {
      redirect("/admin/dokter?err=Data%20edit%20dokter%20tidak%20valid");
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { name, username, email },
        });
        await tx.dokter.update({
          where: { id: dokterId },
          data: {
            nip,
            alamat: alamat || null,
            noHp: noHp || null,
          },
        });
        await tx.dokterPoli.deleteMany({ where: { dokterId } });
        await tx.dokterPoli.createMany({
          data: poliIds.map((poliId) => ({ dokterId, poliId })),
          skipDuplicates: true,
        });
      });
      revalidatePath("/admin/dokter");
      redirect("/admin/dokter?msg=Dokter%20berhasil%20diupdate");
    } catch {
      redirect("/admin/dokter?err=Username,%20email,%20atau%20NIP%20sudah%20digunakan");
    }
  }

  async function toggleDokterStatusAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const userId = Number(formData.get("userId"));
    const toActive = String(formData.get("toActive")) === "1";
    if (!Number.isInteger(userId) || userId <= 0) {
      redirect("/admin/dokter?err=User%20dokter%20tidak%20valid");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: toActive,
        deactivatedAt: toActive ? null : new Date(),
        sessionVersion: { increment: 1 },
      },
    });
    revalidatePath("/admin/dokter");
    redirect(`/admin/dokter?msg=Status%20dokter%20berhasil%20diubah`);
  }

  async function deleteDokterAction(formData: FormData) {
    "use server";

    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const dokterId = Number(formData.get("dokterId"));
    const userId = Number(formData.get("userId"));

    if (!Number.isInteger(dokterId) || dokterId <= 0 || !Number.isInteger(userId) || userId <= 0) {
      redirect("/admin/dokter?err=Data%20hapus%20dokter%20tidak%20valid");
    }

    const dokter = await prisma.dokter.findUnique({
      where: { id: dokterId },
      include: { _count: { select: { jadwals: true } } },
    });

    if (!dokter) {
      redirect("/admin/dokter?err=Dokter%20tidak%20ditemukan");
    }

    if (dokter._count.jadwals > 0) {
      redirect("/admin/dokter?err=Dokter%20masih%20punya%20jadwal,%20tidak%20bisa%20dihapus");
    }

    await prisma.$transaction([
      prisma.dokter.delete({ where: { id: dokterId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    revalidatePath("/admin/dokter");
    redirect("/admin/dokter?msg=Dokter%20berhasil%20dihapus");
  }

  return (
    <main className="flow-lg">
      <h1>Kelola Dokter</h1>
      {msg ? <p>{msg}</p> : null}
      {err ? <p>{err}</p> : null}

      <section>
        <h3>Tambah Dokter</h3>
        <form action={createDokterAction}>
          <label>
            Nama
            <input name="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
          <label>
            Username
            <input name="username" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={8}
              required
            />
          </label>
          <label>
            NIP
            <input name="nip" required />
          </label>
          <label>
            Poli (bisa lebih dari satu)
            <select name="poliIds" multiple required>
              {polis.map((poli) => (
                <option key={poli.id} value={poli.id}>
                  {poli.namaPoli}
                </option>
              ))}
            </select>
          </label>
          <label>
            Alamat
            <input name="alamat" />
          </label>
          <label>
            No HP
            <input name="noHp" />
          </label>
          <FormSubmitButton idleLabel="Simpan" pendingLabel="Menyimpan..." />
        </form>
      </section>

      <section>
        <h3>Daftar Dokter</h3>
        <form action="/admin/dokter" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama/username/email/NIP dokter"
          />
          <select name="poliId" defaultValue={poliIdFilter > 0 ? String(poliIdFilter) : ""}>
            <option value="">Semua Poli</option>
            {polis.map((poli) => (
              <option key={poli.id} value={poli.id}>
                {poli.namaPoli}
              </option>
            ))}
          </select>
          <button type="submit">Cari</button>
        </form>

        <div>
          <table className="data-table">
            <thead>
              <tr>
                <th >ID</th>
                <th >Nama</th>
                <th >Username</th>
                <th >Email</th>
                <th >NIP</th>
                <th >Poli</th>
                <th >Alamat</th>
                <th >No HP</th>
                <th >Status</th>
                <th >Jadwal</th>
                <th >Edit</th>
                <th >Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dokters.length === 0 ? (
                <tr>
                  <td colSpan={12} >
                    Belum ada data dokter.
                  </td>
                </tr>
              ) : (
                dokters.map((dokter) => (
                  <tr key={dokter.id}>
                    <td >{dokter.id}</td>
                    <td >{dokter.user.name}</td>
                    <td >{dokter.user.username}</td>
                    <td >{dokter.user.email}</td>
                    <td >{dokter.nip}</td>
                    <td >{dokter.dokterPolis.map((dp) => dp.poli.namaPoli).join(", ") || "-"}</td>
                    <td >{dokter.alamat ?? "-"}</td>
                    <td >{dokter.noHp ?? "-"}</td>
                    <td >{dokter.user.isActive ? "Aktif" : "Nonaktif"}</td>
                    <td >{dokter._count.jadwals}</td>
                    <td >
                      <form action={updateDokterAction}>
                        <input type="hidden" name="dokterId" value={dokter.id} />
                        <input type="hidden" name="userId" value={dokter.user.id} />
                        <input name="name" defaultValue={dokter.user.name} required />
                        <input name="username" defaultValue={dokter.user.username} required />
                        <input name="email" type="email" defaultValue={dokter.user.email} required />
                        <input name="nip" defaultValue={dokter.nip} required />
                        <select name="poliIds" defaultValue={dokter.dokterPolis.map((dp) => String(dp.poliId))} multiple required>
                          {polis.map((poli) => (
                            <option key={poli.id} value={poli.id}>
                              {poli.namaPoli}
                            </option>
                          ))}
                        </select>
                        <input name="alamat" defaultValue={dokter.alamat ?? ""} />
                        <input name="noHp" defaultValue={dokter.noHp ?? ""} />
                        <FormSubmitButton idleLabel="Update" pendingLabel="Mengupdate..." />
                      </form>
                    </td>
                    <td >
                      <div>
                        <form action={toggleDokterStatusAction}>
                          <input type="hidden" name="userId" value={dokter.user.id} />
                          <input type="hidden" name="toActive" value={dokter.user.isActive ? "0" : "1"} />
                          <FormSubmitButton
                            idleLabel={dokter.user.isActive ? "Nonaktifkan" : "Aktifkan"}
                            pendingLabel="Memproses..."
                          />
                        </form>
                        <form action={deleteDokterAction}>
                          <input type="hidden" name="dokterId" value={dokter.id} />
                          <input type="hidden" name="userId" value={dokter.user.id} />
                          <FormSubmitButton idleLabel="Hapus" pendingLabel="Menghapus..." />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
