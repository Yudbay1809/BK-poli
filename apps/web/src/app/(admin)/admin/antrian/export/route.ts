import { NextResponse } from "next/server";
import { DaftarPoliStatus } from "@bk-poli/db";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { toCsv } from "@/lib/csv";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const pasienId = Number(searchParams.get("pasienId") ?? 0);
  const jadwalId = Number(searchParams.get("jadwalId") ?? 0);
  const status = (searchParams.get("status") ?? "").trim();
  const whereClause: { pasienId?: number; jadwalId?: number; status?: DaftarPoliStatus } = {};
  if (pasienId > 0) whereClause.pasienId = pasienId;
  if (jadwalId > 0) whereClause.jadwalId = jadwalId;
  if (status && Object.values(DaftarPoliStatus).includes(status as DaftarPoliStatus)) {
    whereClause.status = status as DaftarPoliStatus;
  }

  const rowsDb = await prisma.daftarPoli.findMany({
    where: whereClause,
    include: {
      pasien: { include: { user: { select: { name: true } } } },
      jadwal: { include: { dokter: { include: { user: { select: { name: true } } } }, poli: { select: { namaPoli: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const csv = toCsv([
    ["id", "pasien", "no_rm", "dokter", "poli", "hari", "no_antrian", "keluhan", "status", "created_at"],
    ...rowsDb.map((a) => [
      a.id,
      a.pasien.user.name,
      a.pasien.noRm,
      a.jadwal.dokter.user.name,
      a.jadwal.poli.namaPoli,
      a.jadwal.hari,
      a.noAntrian,
      a.keluhan,
      a.status,
      a.createdAt.toISOString(),
    ]),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=antrian.csv",
    },
  });
}
