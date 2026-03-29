import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getDefaultRouteByRole } from "@/lib/role-route";

const menus = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/poli", label: "Kelola Poli" },
  { href: "/admin/obat", label: "Kelola Obat" },
  { href: "/admin/dokter", label: "Kelola Dokter" },
  { href: "/admin/pasien", label: "Kelola Pasien" },
  { href: "/admin/jadwal", label: "Kelola Jadwal" },
  { href: "/admin/antrian", label: "Kelola Antrian" },
  { href: "/admin/pemeriksaan", label: "Kelola Pemeriksaan" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect(getDefaultRouteByRole(role));
  }

  return (
    <div className="layout-container-wide sidebar-layout">
      <aside className="sidebar sidebar--admin">
        <h3>Admin</h3>
        <nav className="sidebar-nav">
          {menus.map((menu) => (
            <Link key={menu.href} href={menu.href as Route}>
              {menu.label}
            </Link>
          ))}
        </nav>
      </aside>
      <section>{children}</section>
    </div>
  );
}
