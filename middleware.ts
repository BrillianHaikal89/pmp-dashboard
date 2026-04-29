// middleware.ts — letakkan di ROOT project (sejajar dengan folder app/)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MAINTENANCE_MODE = true;

export function middleware(request: NextRequest) {
  if (!MAINTENANCE_MODE) return NextResponse.next();

  const { pathname } = request.nextUrl;

  // Sudah di halaman maintenance — jangan redirect lagi (hindari loop)
  if (pathname === "/") return NextResponse.next();

  // Izinkan aset statis & internal Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.(.*)$/.test(pathname)   // file ekstensi: .png, .ico, .svg, dll.
  ) {
    return NextResponse.next();
  }

  // Semua route lain → redirect ke "/"
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    /*
     * Match semua request path KECUALI:
     * - _next/static (file statis)
     * - _next/image  (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};