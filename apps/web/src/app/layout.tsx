import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit, Fraunces } from "next/font/google";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getDefaultRouteByRole } from "@/lib/role-route";
import ThemeToggle from "@/components/ThemeToggle";
import QueryToast from "@/components/QueryToast";
import RouteProgress from "@/components/RouteProgress";
import GlobalGetFormNavigation from "@/components/GlobalGetFormNavigation";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BK Poli Modern",
  description: "Sistem klinik multi-role dengan Super Admin",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const dashboardRoute = getDefaultRouteByRole(session?.user?.role);

  async function logoutAction() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          // Ensure theme is applied before first paint to avoid white flash on refresh/navigation.
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var key = 'bk-theme-mode';
                  var saved = localStorage.getItem(key);
                  var mode = (saved === 'light' || saved === 'dark')
                    ? saved
                    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  var root = document.documentElement;
                  root.setAttribute('data-theme', mode);
                  root.style.colorScheme = mode;
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${outfit.variable} ${fraunces.variable}`}>
        <a href="#main-content" className="skip-link">
          Lewati ke konten
        </a>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="brand">
              BK Poli
            </Link>
            <nav className="top-nav">
              <Link href="/poli">Poli</Link>
              <Link href="/jadwal-dokter">Jadwal Dokter</Link>
              <Link href="/daftar-pengobatan">Daftar Pengobatan</Link>
              {session?.user ? (
                <>
                  <Link href={dashboardRoute}>Dashboard</Link>
                  <form action={logoutAction}>
                    <button type="submit" className="top-nav-button">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login">Login</Link>
              )}
            </nav>
            {session?.user ? (
              <div className="top-user-meta" aria-label="Informasi pengguna">
                <span className="top-user-name">Halo, {session.user.username ?? session.user.name ?? "User"}</span>
                <span className="top-user-role">{session.user.role}</span>
              </div>
            ) : null}
            <ThemeToggle />
          </div>
        </header>
        <RouteProgress />
        <GlobalGetFormNavigation />
        <div className="bg-orb bg-orb-a" aria-hidden />
        <div className="bg-orb bg-orb-b" aria-hidden />
        <main id="main-content" className="page-enter">
          {children}
        </main>
        <Suspense fallback={null}>
          <QueryToast />
        </Suspense>
      </body>
    </html>
  );
}
