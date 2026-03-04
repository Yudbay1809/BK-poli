import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api-auth";
import { toCsv } from "@/lib/csv";

export async function GET(request: Request) {
  const auth = await requireAdminApi();
  if (!auth) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const dokterId = Number(searchParams.get("dokterId") ?? 0);
  const poliId = Number(searchParams.get("poliId") ?? 0);
  const hari = (searchParams.get("hari") ?? "").trim();
  const whereClause: { dokterId?: number; poliId?: number; hari?: string } = {};
  if (dokterId > 0) whereClause.dokterId = dokterId;
  if (poliId > 0) whereClause.poliId = poliId;
  if (hari) whereClause.hari = hari;

  const rowsDb = await prisma.jadwalPeriksa.findMany({
    where: whereClause,
    include: { dokter: { include: { user: { select: { name: true } } } }, poli: { select: { namaPoli: true } } },
    orderBy: [{ hari: "asc" }, { jamMulai: "asc" }],
  });

  const csv = toCsv([
    ["id", "dokter", "poli", "hari", "jam_mulai", "jam_selesai"],
    ...rowsDb.map((j) => [
      j.id,
      j.dokter.user.name,
      j.poli.namaPoli,
      j.hari,
      new Date(j.jamMulai).toISOString().slice(11, 16),
      new Date(j.jamSelesai).toISOString().slice(11, 16),
    ]),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=jadwal.csv",
    },
  });
}
