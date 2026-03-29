import Link from "next/link";
import type { Route } from "next";

const menus = [
  { href: "/dokter", label: "Dashboard" },
  { href: "/dokter/profil", label: "Profil" },
] as const;

export default function DokterLayout({ children }: { children: React.ReactNode }) {
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
