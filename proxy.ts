import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, isSuperadmin, verifySessionToken } from "@/lib/session";

// Catatan: di Next.js 16 konvensi `middleware.ts` diganti menjadi `proxy.ts`.
// Berkas ini adalah lapisan pertama (optimistic check). Setiap route handler
// tetap memeriksa sesi & role sendiri, jadi proteksi tidak bergantung ke sini.

/** Endpoint yang memang harus bisa diakses tanpa login. */
const API_PUBLIK = [
  "/api/autentikasi/masuk",
  "/api/autentikasi/session",
  "/api/autentikasi/removeSession",
];

/** Endpoint yang hanya boleh disentuh Super Admin. */
const API_SUPERADMIN_EXACT = ["/api/user", "/api/backup", "/api/restore"];
const API_SUPERADMIN_PREFIX = [
  "/api/user/perbarui",
  "/api/autentikasi/daftar",
  "/api/autentikasi/hapus",
  "/api/instansi/simpan",
];

/** Halaman yang hanya boleh dibuka Super Admin. */
const HALAMAN_SUPERADMIN = [
  "/dashboard/setup",
  "/dashboard/backup",
  "/dashboard/restore",
];

function butuhSuperadminApi(pathname: string): boolean {
  return (
    API_SUPERADMIN_EXACT.includes(pathname) ||
    API_SUPERADMIN_PREFIX.some((prefix) => pathname.startsWith(prefix))
  );
}

function jsonError(status: number, reason: string) {
  return NextResponse.json({ status, reason }, { status });
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const user = await verifySessionToken(request.cookies.get(AUTH_COOKIE)?.value);

  // --- API ---
  if (pathname.startsWith("/api")) {
    if (API_PUBLIK.includes(pathname)) return NextResponse.next();

    if (!user) return jsonError(401, "Anda harus masuk terlebih dahulu");

    if (butuhSuperadminApi(pathname) && !isSuperadmin(user)) {
      return jsonError(403, "Aksi ini hanya untuk Super Admin");
    }

    return NextResponse.next();
  }

  // --- Halaman login ---
  if (pathname.startsWith("/autentikasi")) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // --- Halaman dashboard ---
  if (!user) {
    const tujuan = new URL("/autentikasi/masuk", request.url);
    // Simpan halaman asal supaya bisa dikembalikan setelah login.
    tujuan.searchParams.set("lanjut", `${pathname}${search}`);
    const response = NextResponse.redirect(tujuan);
    // Cookie kedaluwarsa/rusak dibersihkan agar tidak memicu loop.
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  if (
    HALAMAN_SUPERADMIN.some((prefix) => pathname.startsWith(prefix)) &&
    !isSuperadmin(user)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/autentikasi/:path*"],
};
