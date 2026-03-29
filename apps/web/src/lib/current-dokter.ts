import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuthRole } from "@/lib/require-auth";

export async function getCurrentDokterContext() {
  const { session } = await requireAuthRole(["DOKTER"]);
  const userId = Number(session.user.id);

  const dokter = await prisma.dokter.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      dokterPolis: { include: { poli: { select: { id: true, namaPoli: true } } } },
    },
  });

  if (!dokter) {
    redirect("/?error=Data%20dokter%20tidak%20ditemukan");
  }

  return { session, dokter };
}
