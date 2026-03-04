export type AppRoute = "/" | "/super-admin" | "/admin" | "/dokter" | "/pasien";

export function getDefaultRouteByRole(role?: string | null): AppRoute {
  if (role === "SUPER_ADMIN") return "/super-admin";
  if (role === "ADMIN") return "/admin";
  if (role === "DOKTER") return "/dokter";
  if (role === "PASIEN") return "/pasien";
  return "/";
}
