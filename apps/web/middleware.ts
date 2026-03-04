import { auth } from "@/auth";
import { NextResponse } from "next/server";

const SUPER_ADMIN_PATHS = ["/super-admin"];
const ADMIN_PATHS = ["/admin"];
const DOKTER_PATHS = ["/dokter"];
const PASIEN_PATHS = ["/pasien"];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const role = req.auth?.user?.role;

  if (startsWithAny(pathname, SUPER_ADMIN_PATHS) && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (startsWithAny(pathname, ADMIN_PATHS) && role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (startsWithAny(pathname, DOKTER_PATHS) && role !== "DOKTER") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (startsWithAny(pathname, PASIEN_PATHS) && role !== "PASIEN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/super-admin/:path*", "/admin/:path*", "/dokter/:path*", "/pasien/:path*"],
};
