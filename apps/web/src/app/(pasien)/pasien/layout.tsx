import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getDefaultRouteByRole } from "@/lib/role-route";

const menus = [
  { href: "/pasien", label: "Dashboard" },
  { href: "/pasien/profil", label: "Profil" },
  { href: "/pasien/daftar-poli", label: "Daftar Poli" },
  { href: "/pasien/riwayat", label: "Riwayat Kunjungan" },
  { href: "/pasien/pembayaran", label: "Pembayaran" },
  { href: "/pasien/dokumen", label: "Dokumen" },
] as const;

export default async function PasienLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role) {
    redirect("/login");
  }

  if (role !== "PASIEN") {
    redirect(getDefaultRouteByRole(role));
  }

  return (
    <div className="layout-container-wide sidebar-layout">
      <aside className="sidebar sidebar--pasien">
        <h3>Pasien</h3>
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
