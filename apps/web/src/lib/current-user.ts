import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

export async function getCurrentPasienContext() {
  const { session } = await requireAuthRole(["PASIEN"]);
  const userId = Number(session.user.id);

  const pasien = await prisma.pasien.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!pasien) {
    redirect("/?error=Data%20pasien%20tidak%20ditemukan");
  }

  return { session, pasien };
}
