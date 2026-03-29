import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentPasienContext } from "@/lib/current-user";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

export default async function PasienProfilPage({ searchParams }: PageProps) {
  const { pasien } = await getCurrentPasienContext();
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  async function saveProfileAction(formData: FormData) {
    "use server";
    const { pasien } = await getCurrentPasienContext();
    const name = String(formData.get("name") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim().toLowerCase();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const alamat = String(formData.get("alamat") ?? "").trim();
    const noHp = String(formData.get("noHp") ?? "").trim();
    const noKtp = String(formData.get("noKtp") ?? "").trim();

    if (!name || !username || !email || !noKtp) {
      redirect("/pasien/profil?err=Data%20profil%20tidak%20valid");
    }

    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: pasien.userId },
          data: { name, username, email },
        }),
        prisma.pasien.update({
          where: { id: pasien.id },
          data: {
            alamat: alamat || null,
            noHp: noHp || null,
            noKtp,
          },
        }),
      ]);
      revalidatePath("/pasien/profil");
      redirect("/pasien/profil?msg=Profil%20berhasil%20disimpan");
    } catch {
      redirect("/pasien/profil?err=Username%20atau%20email%20sudah%20digunakan");
    }
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Profil Pasien</h1>
      <p className="app-subtitle">Perbarui data akun dan identitas dasar Anda.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <form action={saveProfileAction} className="form-layout" style={{ maxWidth: 760 }}>
        <label className="form-field">
          Nama
          <input name="name" defaultValue={pasien.user.name} required />
        </label>
        <label className="form-field">
          Username
          <input name="username" defaultValue={pasien.user.username} required />
        </label>
        <label className="form-field">
          Email
          <input name="email" type="email" defaultValue={pasien.user.email} required />
        </label>
        <label className="form-field">
          No KTP
          <input name="noKtp" defaultValue={pasien.noKtp} required />
        </label>
        <label className="form-field">
          Alamat
          <input name="alamat" defaultValue={pasien.alamat ?? ""} />
        </label>
        <label className="form-field">
          No HP
          <input name="noHp" defaultValue={pasien.noHp ?? ""} />
        </label>
        <button type="submit">Simpan Profil</button>
      </form>
    </main>
  );
}
