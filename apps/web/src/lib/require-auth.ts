import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireAuthRole(allowedRoles: Array<"SUPER_ADMIN" | "ADMIN" | "DOKTER" | "PASIEN">) {
  const session = await auth();
  const userId = Number(session?.user?.id ?? 0);
  const role = session?.user?.role as "SUPER_ADMIN" | "ADMIN" | "DOKTER" | "PASIEN" | undefined;

  if (!userId || !role || !allowedRoles.includes(role)) {
    redirect("/");
  }
  const safeSession = session as NonNullable<typeof session>;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true, sessionVersion: true },
  });

  if (!user || !user.isActive || user.sessionVersion !== safeSession.user.sessionVersion) {
    redirect("/?error=Sesi%20Anda%20sudah%20berakhir.%20Silakan%20login%20ulang.");
  }

  return { session: safeSession, user };
}
