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
          { noRm: { contains: q, mode: "insensitive" as const } },
          { noKtp: { contains: q, mode: "insensitive" as const } },
          { user: { name: { contains: q, mode: "insensitive" as const } } },
          { user: { username: { contains: q, mode: "insensitive" as const } } },
          { user: { email: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : undefined;

  const rowsDb = await prisma.pasien.findMany({
    where: whereClause,
    include: { user: { select: { name: true, username: true, email: true, isActive: true } } },
    orderBy: { id: "desc" },
  });

  const csv = toCsv([
    ["id", "name", "username", "email", "no_rm", "no_ktp", "alamat", "no_hp", "is_active"],
    ...rowsDb.map((p) => [
      p.id,
      p.user.name,
      p.user.username,
      p.user.email,
      p.noRm,
      p.noKtp,
      p.alamat ?? "",
      p.noHp ?? "",
      p.user.isActive,
    ]),
  ]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=pasien.csv",
    },
  });
}
