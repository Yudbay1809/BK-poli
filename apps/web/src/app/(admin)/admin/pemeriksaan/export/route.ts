import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { toCsv } from "@/lib/csv";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const whereClause = q
    ? {
        OR: [
          { daftarPoli: { pasien: { user: { name: { contains: q, mode: "insensitive" as const } } } } },
          { daftarPoli: { jadwal: { dokter: { user: { name: { contains: q, mode: "insensitive" as const } } } } } },
          { daftarPoli: { jadwal: { poli: { namaPoli: { contains: q, mode: "insensitive" as const } } } } },
        ],
      }
    : undefined;

  const rowsDb = await prisma.periksa.findMany({
    where: whereClause,
    include: {
      daftarPoli: {
        include: {
          pasien: { include: { user: { select: { name: true } } } },
          jadwal: { include: { dokter: { include: { user: { select: { name: true } } } }, poli: { select: { namaPoli: true } } } },
        },
      },
      details: { include: { obat: true } },
    },
    orderBy: { tglPeriksa: "desc" },
  });

  const csv = toCsv([
    ["id", "pasien", "dokter", "poli", "no_antrian", "tgl_periksa", "catatan", "biaya", "obat"],
    ...rowsDb.map((p) => [
      p.id,
      p.daftarPoli.pasien.user.name,
      p.daftarPoli.jadwal.dokter.user.name,
      p.daftarPoli.jadwal.poli.namaPoli,
      p.daftarPoli.noAntrian,
      p.tglPeriksa.toISOString(),
      p.catatan ?? "",
      p.biayaPeriksa,
      p.details.map((d) => d.obat.namaObat).join("; "),
    ]),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=pemeriksaan.csv",
    },
  });
}
