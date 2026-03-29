import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getDefaultRouteByRole } from "@/lib/role-route";

const menus = [
  { href: "/dokter", label: "Dashboard" },
  { href: "/dokter/profil", label: "Profil" },
] as const;

export default async function DokterLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role) {
    redirect("/login");
  }

  if (role !== "DOKTER") {
    redirect(getDefaultRouteByRole(role));
  }

  return (
    <div className="layout-container-wide sidebar-layout">
      <aside className="sidebar sidebar--dokter">
        <h3>Dokter</h3>
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
