import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";
import { writeAuditLog } from "@/lib/audit-log";
import EmptyState from "@/components/EmptyState";
import FormSubmitButton from "@/components/FormSubmitButton";

type PageProps = {
  searchParams?: Promise<{
    msg?: string;
    err?: string;
    q?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "DOKTER" | "PASIEN" | "ALL";
    status?: "active" | "inactive" | "all";
  }>;
};

export default async function SuperAdminUsersPage({ searchParams }: PageProps) {
  const { session } = await requireAuthRole(["SUPER_ADMIN"]);
  const meId = Number(session.user.id);
  const params = searchParams ? await searchParams : undefined;

  const q = (params?.q ?? "").trim();
  const roleFilter = params?.role ?? "ALL";
  const statusFilter = params?.status ?? "all";

  const whereClause: {
    OR?: Array<{
      name?: { contains: string; mode: "insensitive" };
      email?: { contains: string; mode: "insensitive" };
      username?: { contains: string; mode: "insensitive" };
    }>;
    role?: "SUPER_ADMIN" | "ADMIN" | "DOKTER" | "PASIEN";
    isActive?: boolean;
  } = {};

  if (q) {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { username: { contains: q, mode: "insensitive" } },
    ];
  }
  if (roleFilter !== "ALL") whereClause.role = roleFilter;
  if (statusFilter === "active") whereClause.isActive = true;
  if (statusFilter === "inactive") whereClause.isActive = false;

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  const msg = params?.msg;
  const err = params?.err;

  async function createAdminAction(formData: FormData) {
    "use server";

    const { session: me } = await requireAuthRole(["SUPER_ADMIN"]);
    const actorId = Number(me.user.id);

    const name = String(formData.get("name") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim().toLowerCase();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");

    if (!name || !username || !email || password.length < 8) {
      redirect("/super-admin/users?err=Input%20tidak%20valid");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const created = await prisma.user.create({
        data: {
          name,
          username,
          email,
          role: "ADMIN",
          passwordHash,
        },
      });
      await writeAuditLog({
        actorUserId: actorId,
        action: "CREATE_ADMIN",
        entityType: "User",
        entityId: String(created.id),
        metaJson: JSON.stringify({ email: created.email }),
      });
      revalidatePath("/super-admin/users");
      redirect("/super-admin/users?msg=Admin%20berhasil%20dibuat");
    } catch {
      redirect("/super-admin/users?err=Username%20atau%20email%20sudah%20digunakan");
    }
  }

  async function resetPasswordAction(formData: FormData) {
    "use server";

    const { session: me } = await requireAuthRole(["SUPER_ADMIN"]);
    const actorId = Number(me.user.id);

    const userId = Number(formData.get("userId"));
    const newPassword = String(formData.get("newPassword") ?? "");

    if (!Number.isInteger(userId) || userId <= 0 || newPassword.length < 8) {
      redirect("/super-admin/users?err=Password%20minimal%208%20karakter");
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    await writeAuditLog({
      actorUserId: actorId,
      action: "RESET_PASSWORD",
      entityType: "User",
      entityId: String(userId),
    });

    revalidatePath("/super-admin/users");
    redirect("/super-admin/users?msg=Password%20berhasil%20direset");
  }

  async function deactivateUserAction(formData: FormData) {
    "use server";

    const { session: me } = await requireAuthRole(["SUPER_ADMIN"]);
    const userId = Number(formData.get("userId"));

    if (!Number.isInteger(userId) || userId <= 0) {
      redirect("/super-admin/users?err=User%20tidak%20valid");
    }

    if (String(userId) === me.user.id) {
      redirect("/super-admin/users?err=Tidak%20bisa%20menonaktifkan%20akun%20sendiri");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deactivatedAt: new Date(),
        sessionVersion: { increment: 1 },
      },
    });
    await writeAuditLog({
      actorUserId: Number(me.user.id),
      action: "DEACTIVATE_USER",
      entityType: "User",
      entityId: String(userId),
    });

    revalidatePath("/super-admin/users");
    redirect("/super-admin/users?msg=User%20berhasil%20dinonaktifkan");
  }

  async function activateUserAction(formData: FormData) {
    "use server";

    const { session: me } = await requireAuthRole(["SUPER_ADMIN"]);
    const userId = Number(formData.get("userId"));

    if (!Number.isInteger(userId) || userId <= 0) {
      redirect("/super-admin/users?err=User%20tidak%20valid");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: true,
        deactivatedAt: null,
      },
    });
    await writeAuditLog({
      actorUserId: Number(me.user.id),
      action: "ACTIVATE_USER",
      entityType: "User",
      entityId: String(userId),
    });

    revalidatePath("/super-admin/users");
    redirect("/super-admin/users?msg=User%20berhasil%20diaktifkan");
  }

  async function forceLogoutAction(formData: FormData) {
    "use server";

    const { session: me } = await requireAuthRole(["SUPER_ADMIN"]);
    const userId = Number(formData.get("userId"));

    if (!Number.isInteger(userId) || userId <= 0) {
      redirect("/super-admin/users?err=User%20tidak%20valid");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { sessionVersion: { increment: 1 } },
    });
    await writeAuditLog({
      actorUserId: Number(me.user.id),
      action: "FORCE_LOGOUT",
      entityType: "User",
      entityId: String(userId),
    });

    revalidatePath("/super-admin/users");
    if (String(userId) === me.user.id) {
      redirect("/?error=Sesi%20Anda%20diputus%20oleh%20aksi%20force%20logout.");
    }
    redirect("/super-admin/users?msg=Force%20logout%20berhasil");
  }

  return (
    <main className="flow-lg">
      <h1 className="app-title">User & Role Management</h1>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Create Admin</h3>
        <form action={createAdminAction} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
          <label>
            Nama
            <input name="name" required style={{ width: "100%", padding: 8, marginTop: 4 }} />
          </label>
          <label>
            Username
            <input name="username" required style={{ width: "100%", padding: 8, marginTop: 4 }} />
          </label>
          <label>
            Email
            <input name="email" type="email" required style={{ width: "100%", padding: 8, marginTop: 4 }} />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={8}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
          <FormSubmitButton idleLabel="Buat Admin" pendingLabel="Membuat..." style={{ padding: 10 }} />
        </form>
      </section>

      <section className="flow-sm">
        <h3>Daftar User</h3>
        <form action="/super-admin/users" method="get" style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Cari nama/username/email"
            style={{ padding: 8, minWidth: 220 }}
          />
          <select name="role" defaultValue={roleFilter} style={{ padding: 8 }}>
            <option value="ALL">Semua Role</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="ADMIN">ADMIN</option>
            <option value="DOKTER">DOKTER</option>
            <option value="PASIEN">PASIEN</option>
          </select>
          <select name="status" defaultValue={statusFilter} style={{ padding: 8 }}>
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button type="submit">Filter</button>
        </form>
        {users.length === 0 ? (
          <EmptyState
            title="User Tidak Ditemukan"
            description="Belum ada data user sesuai filter saat ini."
            icon="ðŸ‘¥"
          />
        ) : (
        <div className="table-scroll">
          <table className="data-table" style={{ minWidth: 1080 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Dibuat</th>
                <th>Reset Password</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.isActive ? "Aktif" : "Nonaktif"}</td>
                  <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("id-ID") : "-"}</td>
                  <td>{new Date(user.createdAt).toLocaleString("id-ID")}</td>
                  <td>
                    <form action={resetPasswordAction} style={{ display: "flex", gap: 8 }}>
                      <input type="hidden" name="userId" value={user.id} />
                      <input
                        name="newPassword"
                        type="password"
                        placeholder="Password baru"
                        minLength={8}
                        required
                        style={{ padding: 6 }}
                      />
                      <FormSubmitButton idleLabel="Reset" pendingLabel="Mereset..." />
                    </form>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {user.isActive ? (
                        <form action={deactivateUserAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" disabled={user.id === meId}>
                            Nonaktifkan
                          </button>
                        </form>
                      ) : (
                        <form action={activateUserAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit">Aktifkan</button>
                        </form>
                      )}
                      <form action={forceLogoutAction}>
                        <input type="hidden" name="userId" value={user.id} />
                        <button type="submit">Force Logout</button>
                      </form>
                    </div>
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

