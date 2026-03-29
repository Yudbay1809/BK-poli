import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentDokterContext } from "@/lib/current-dokter";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

export default async function DokterProfilPage({ searchParams }: PageProps) {
  const { dokter } = await getCurrentDokterContext();
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  async function saveProfileAction(formData: FormData) {
    "use server";
    const { dokter } = await getCurrentDokterContext();
    const name = String(formData.get("name") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim().toLowerCase();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const nip = String(formData.get("nip") ?? "").trim();
    const alamat = String(formData.get("alamat") ?? "").trim();
    const noHp = String(formData.get("noHp") ?? "").trim();

    if (!name || !username || !email || !nip) {
      redirect("/dokter/profil?err=Data%20profil%20tidak%20valid");
    }

    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: dokter.userId },
          data: { name, username, email },
        }),
        prisma.dokter.update({
          where: { id: dokter.id },
          data: {
            nip,
            alamat: alamat || null,
            noHp: noHp || null,
          },
        }),
      ]);
      revalidatePath("/dokter/profil");
      revalidatePath("/dokter");
      redirect("/dokter/profil?msg=Profil%20dokter%20berhasil%20disimpan");
    } catch {
      redirect("/dokter/profil?err=Username%20atau%20email%20sudah%20digunakan");
    }
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Profil Dokter</h1>
      <p className="app-subtitle">Perbarui data akun dan informasi dokter.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <form action={saveProfileAction} className="form-layout" style={{ maxWidth: 760 }}>
        <label className="form-field">
          Nama
          <input name="name" defaultValue={dokter.user.name} required />
        </label>
        <label className="form-field">
          Username
          <input name="username" defaultValue={dokter.user.username} required />
        </label>
        <label className="form-field">
          Email
          <input name="email" type="email" defaultValue={dokter.user.email} required />
        </label>
        <label className="form-field">
          NIP
          <input name="nip" defaultValue={dokter.nip} required />
        </label>
        <label className="form-field">
          Alamat
          <input name="alamat" defaultValue={dokter.alamat ?? ""} />
        </label>
        <label className="form-field">
          No HP
          <input name="noHp" defaultValue={dokter.noHp ?? ""} />
        </label>
        <button type="submit">Simpan Profil</button>
      </form>
    </main>
  );
}
