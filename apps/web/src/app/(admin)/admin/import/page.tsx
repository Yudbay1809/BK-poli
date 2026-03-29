import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

type PageProps = {
  searchParams?: Promise<{ msg?: string; err?: string }>;
};

function parseCsvLines(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(",").map((v) => v.trim()));
}

export default async function AdminImportPage({ searchParams }: PageProps) {
  await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
  const params = searchParams ? await searchParams : undefined;
  const msg = params?.msg;
  const err = params?.err;

  async function importPoliAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const raw = String(formData.get("csv") ?? "");
    const rows = parseCsvLines(raw);
    if (rows.length === 0) redirect("/admin/import?err=CSV%20poli%20kosong");

    let created = 0;
    let updated = 0;
    for (const row of rows) {
      if (row[0]?.toLowerCase() === "namapoli") continue;
      const namaPoli = row[0] ?? "";
      const keterangan = row[1] ?? "";
      if (!namaPoli) continue;
      const exists = await prisma.poli.findFirst({ where: { namaPoli } });
      if (exists) {
        await prisma.poli.update({
          where: { id: exists.id },
          data: { keterangan: keterangan || null },
        });
        updated += 1;
      } else {
        await prisma.poli.create({ data: { namaPoli, keterangan: keterangan || null } });
        created += 1;
      }
    }
    revalidatePath("/admin/poli");
    redirect(`/admin/import?msg=Import%20poli%20selesai.%20Tambah:${created}%20Update:${updated}`);
  }

  async function importObatAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const raw = String(formData.get("csv") ?? "");
    const rows = parseCsvLines(raw);
    if (rows.length === 0) redirect("/admin/import?err=CSV%20obat%20kosong");

    let created = 0;
    let updated = 0;
    for (const row of rows) {
      if (row[0]?.toLowerCase() === "namaobat") continue;
      const namaObat = row[0] ?? "";
      const kemasan = row[1] ?? "";
      const harga = Number(row[2] ?? 0);
      if (!namaObat || !Number.isFinite(harga) || harga < 0) continue;
      const exists = await prisma.obat.findFirst({ where: { namaObat } });
      if (exists) {
        await prisma.obat.update({
          where: { id: exists.id },
          data: { kemasan: kemasan || null, harga: Math.round(harga) },
        });
        updated += 1;
      } else {
        await prisma.obat.create({ data: { namaObat, kemasan: kemasan || null, harga: Math.round(harga) } });
        created += 1;
      }
    }
    revalidatePath("/admin/obat");
    redirect(`/admin/import?msg=Import%20obat%20selesai.%20Tambah:${created}%20Update:${updated}`);
  }

  async function importDokterAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const raw = String(formData.get("csv") ?? "");
    const rows = parseCsvLines(raw);
    if (rows.length === 0) redirect("/admin/import?err=CSV%20dokter%20kosong");

    let created = 0;
    let skipped = 0;
    for (const row of rows) {
      if (row[0]?.toLowerCase() === "name") continue;
      const name = row[0] ?? "";
      const username = (row[1] ?? "").toLowerCase();
      const email = (row[2] ?? "").toLowerCase();
      const password = row[3] ?? "";
      const nip = row[4] ?? "";
      const poliIdsRaw = row[5] ?? "";
      const poliIds = poliIdsRaw
        .split("|")
        .map((v) => Number(v))
        .filter((n) => Number.isInteger(n) && n > 0);

      if (!name || !username || !email || password.length < 8 || !nip || poliIds.length === 0) {
        skipped += 1;
        continue;
      }

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
      });
      if (existingUser) {
        skipped += 1;
        continue;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { name, username, email, passwordHash, role: "DOKTER", isActive: true },
        });
        const dokter = await tx.dokter.create({
          data: { userId: user.id, nip },
        });
        await tx.dokterPoli.createMany({
          data: poliIds.map((poliId) => ({ dokterId: dokter.id, poliId })),
          skipDuplicates: true,
        });
      });
      created += 1;
    }
    revalidatePath("/admin/dokter");
    redirect(`/admin/import?msg=Import%20dokter%20selesai.%20Tambah:${created}%20Lewat:${skipped}`);
  }

  function generateNoRm() {
    const date = new Date();
    const ym = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
    const suffix = `${Date.now()}`.slice(-5);
    return `${ym}-${suffix}`;
  }

  async function importPasienAction(formData: FormData) {
    "use server";
    await requireAuthRole(["ADMIN", "SUPER_ADMIN"]);
    const raw = String(formData.get("csv") ?? "");
    const rows = parseCsvLines(raw);
    if (rows.length === 0) redirect("/admin/import?err=CSV%20pasien%20kosong");

    let created = 0;
    let skipped = 0;
    for (const row of rows) {
      if (row[0]?.toLowerCase() === "name") continue;
      const name = row[0] ?? "";
      const username = (row[1] ?? "").toLowerCase();
      const email = (row[2] ?? "").toLowerCase();
      const password = row[3] ?? "";
      const noKtp = row[4] ?? "";
      const noRm = row[5] ?? generateNoRm();
      const alamat = row[6] ?? "";
      const noHp = row[7] ?? "";

      if (!name || !username || !email || password.length < 8 || !noKtp) {
        skipped += 1;
        continue;
      }

      const exists = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
      });
      if (exists) {
        skipped += 1;
        continue;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { name, username, email, passwordHash, role: "PASIEN", isActive: true },
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
      created += 1;
    }
    revalidatePath("/admin/pasien");
    redirect(`/admin/import?msg=Import%20pasien%20selesai.%20Tambah:${created}%20Lewat:${skipped}`);
  }

  return (
    <main className="flow-md">
      <h1 className="app-title">Import Data Master</h1>
      <p className="app-subtitle">Import data poli, obat, dan dokter dari CSV sederhana.</p>

      {msg ? <p className="notice-success">{msg}</p> : null}
      {err ? <p className="notice-error">{err}</p> : null}

      <section className="flow-sm">
        <h3>Import Poli</h3>
        <p>Format CSV: `namaPoli,keterangan`</p>
        <form action={importPoliAction} className="form-layout" style={{ maxWidth: 760 }}>
          <textarea name="csv" rows={6} placeholder="Poli Umum,Pemeriksaan umum" />
          <button type="submit">Import Poli</button>
        </form>
      </section>

      <section className="flow-sm">
        <h3>Import Obat</h3>
        <p>Format CSV: `namaObat,kemasan,harga`</p>
        <form action={importObatAction} className="form-layout" style={{ maxWidth: 760 }}>
          <textarea name="csv" rows={6} placeholder="Paracetamol,Tablet 500mg,5000" />
          <button type="submit">Import Obat</button>
        </form>
      </section>

      <section className="flow-sm">
        <h3>Import Dokter</h3>
        <p>Format CSV: `name,username,email,password,nip,poliIds` (poliIds pakai `|`)</p>
        <form action={importDokterAction} className="form-layout" style={{ maxWidth: 760 }}>
          <textarea name="csv" rows={7} placeholder="Andi,drandi,andi@bkpoli.local,Password123!,DOK-001,1|2" />
          <button type="submit">Import Dokter</button>
        </form>
      </section>

      <section className="flow-sm">
        <h3>Import Pasien</h3>
        <p>Format CSV: `name,username,email,password,noKtp,noRm,alamat,noHp`</p>
        <form action={importPasienAction} className="form-layout" style={{ maxWidth: 760 }}>
          <textarea name="csv" rows={7} placeholder="Budi,pasien4,budi@bkpoli.local,Password123!,3173000000000009,202603-00009,Jl. Contoh,081200000009" />
          <button type="submit">Import Pasien</button>
        </form>
      </section>
    </main>
  );
}
