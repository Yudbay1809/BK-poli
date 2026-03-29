import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getDefaultRouteByRole } from "@/lib/role-route";

const menus = [
  { href: "/super-admin", label: "Dashboard" },
  { href: "/super-admin/users", label: "User & Role" },
  { href: "/super-admin/organization", label: "Organisasi" },
  { href: "/super-admin/security", label: "Keamanan" },
  { href: "/super-admin/monitoring", label: "Monitoring" },
  { href: "/super-admin/governance", label: "Governance" },
  { href: "/super-admin/settings", label: "Pengaturan" },
  { href: "/super-admin/approvals", label: "Approval" },
  { href: "/super-admin/audit-logs", label: "Audit Logs" },
  { href: "/super-admin/permissions", label: "RBAC Matrix" },
] as const;

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role;

  if (!role) {
    redirect("/login");
  }

  if (role !== "SUPER_ADMIN") {
    redirect(getDefaultRouteByRole(role));
  }

  return (
    <div className="layout-container-wide sidebar-layout">
      <aside className="sidebar sidebar--admin">
        <h3>Super Admin</h3>
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
