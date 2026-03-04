import { auth } from "@/auth";

export async function requireAdminApi() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}
