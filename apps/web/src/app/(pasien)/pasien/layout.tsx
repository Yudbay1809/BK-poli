import Link from "next/link";
import type { Route } from "next";

const menus = [
  { href: "/pasien", label: "Dashboard" },
  { href: "/pasien/daftar-poli", label: "Daftar Poli" },
  { href: "/pasien/riwayat", label: "Riwayat Kunjungan" },
] as const;

export default function PasienLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout-container-wide sidebar-layout">
      <aside className="sidebar">
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

