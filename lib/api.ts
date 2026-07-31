import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import {
  AUTH_COOKIE,
  SessionUser,
  isSuperadmin,
  verifySessionToken,
} from "@/lib/session";

/**
 * Error yang boleh ditampilkan ke pengguna beserta kode HTTP-nya.
 * Error lain akan dilaporkan sebagai 500 tanpa membocorkan detail internal.
 */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Body respons tetap memakai bentuk { status, reason } seperti sebelumnya agar
 * kompatibel dengan pemanggil lama, tetapi kode HTTP-nya sekarang benar.
 */
export function apiOk<T>(data: T, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ status: 200, data, ...extra }, { status: 200 });
}

export function apiFail(status: number, reason: string) {
  return NextResponse.json({ status, reason }, { status });
}

export function apiCatch(err: unknown, context: string) {
  if (err instanceof ApiError) {
    return apiFail(err.status, err.message);
  }
  console.error(`[${context}]`, err);
  return apiFail(500, "Terjadi kesalahan pada server");
}

/** Membaca sesi dari cookie pada route handler. */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(AUTH_COOKIE)?.value);
}

/** Membaca sesi dari NextRequest (dipakai di proxy.ts). */
export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionUser | null> {
  return verifySessionToken(request.cookies.get(AUTH_COOKIE)?.value);
}

/** Wajib login. Melempar 401 bila tidak ada sesi yang sah. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new ApiError(401, "Anda harus masuk terlebih dahulu");
  return user;
}

/** Wajib login sebagai superadmin. */
export async function requireSuperadmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isSuperadmin(user)) {
    throw new ApiError(403, "Aksi ini hanya untuk Super Admin");
  }
  return user;
}

/** Menerjemahkan error dari Supabase menjadi ApiError 400. */
export function assertNoDbError(
  error: { message: string } | null,
  context: string,
): void {
  if (!error) return;
  console.error(`[${context}]`, error);
  throw new ApiError(400, error.message);
}
