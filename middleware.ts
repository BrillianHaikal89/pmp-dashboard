// middleware.ts  (letakkan di root project, sejajar dengan folder app/)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Set true = maintenance aktif, false = normal
const MAINTENANCE_MODE = true;

// Daftar path yang TETAP bisa diakses meski maintenance
// (aset statis, API internal, dsb.)
const BYPASS_PATHS = [
  "/",                    // halaman maintenance itu sendiri
  "/_next",              // Next.js internal
  "/favicon.ico",
  "/LOGO_TUTWURI.png",
  "/LOGO_BBPMP_KEMENDIKDASMEN.png",
  "/BG_ALAM_JABAR.png",
  "/PETA_JAWA_BARAT.png",
];

export function middleware(request: NextRequest) {
  if (!MAINTENANCE_MODE) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Izinkan path yang ada di bypass list
  const isBypassed = BYPASS_PATHS.some(p => pathname === p || pathname.startsWith(p));
  if (isBypassed) return NextResponse.next();

  // Redirect semua path lain ke halaman utama (maintenance)
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export const config = {
  // Jalankan middleware di semua route kecuali aset statis Next.js
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};