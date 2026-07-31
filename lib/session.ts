import {
  base64UrlToBytes,
  bytesToBase64Url,
  bytesToUtf8,
  timingSafeEqual,
  toArrayBuffer,
  utf8ToBytes,
} from "@/lib/encoding";

export const AUTH_COOKIE = "auth";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 hari

/**
 * Data yang boleh disimpan di cookie sesi. Sengaja TIDAK memuat password atau
 * kolom sensitif lain, karena isi cookie ini dikembalikan ke browser lewat
 * /api/autentikasi/session.
 */
export interface SessionUser {
  id: string;
  username: string;
  email: string;
  nama_lengkap: string;
  role: string;
  unit: string | null;
  jabatan: string | null;
}

interface SessionPayload extends SessionUser {
  exp: number; // epoch milidetik
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET belum diatur (minimal 32 karakter). Tambahkan pada file .env sebelum menjalankan aplikasi.",
    );
  }
  return utf8ToBytes(secret);
}

async function sign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    toArrayBuffer(utf8ToBytes(data)),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

function teks(value: unknown, bawaan = ""): string {
  return value === null || value === undefined ? bawaan : String(value);
}

function teksAtauNull(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

/** Bentuk longgar baris `pengguna` yang diterima `toSessionUser`. */
export interface BarisPengguna {
  id: unknown;
  username?: unknown;
  email?: unknown;
  nama_lengkap?: unknown;
  role?: unknown;
  unit?: unknown;
  jabatan?: unknown;
}

/** Menyaring baris tabel `pengguna` menjadi data sesi (tanpa kolom sensitif). */
export function toSessionUser(row: BarisPengguna): SessionUser {
  return {
    id: teks(row.id),
    username: teks(row.username),
    email: teks(row.email),
    nama_lengkap: teks(row.nama_lengkap),
    role: teks(row.role, "staff").toLowerCase(),
    unit: teksAtauNull(row.unit),
    jabatan: teksAtauNull(row.jabatan),
  };
}

/**
 * Membuat token sesi bertanda tangan (HMAC-SHA256). Tanpa tanda tangan, isi
 * cookie bisa dikarang bebas oleh pemanggil HTTP sehingga role apa pun bisa
 * dipalsukan.
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  const payload: SessionPayload = {
    ...user,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const body = bytesToBase64Url(utf8ToBytes(JSON.stringify(payload)));
  const signature = await sign(body);
  return `${body}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<SessionUser | null> {
  if (!token) return null;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const body = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  let expectedSignature: string;
  try {
    expectedSignature = await sign(body);
  } catch {
    // AUTH_SECRET tidak tersedia: perlakukan sebagai tidak terautentikasi.
    return null;
  }

  if (!timingSafeEqual(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(bytesToUtf8(base64UrlToBytes(body))) as SessionPayload;
    if (!payload?.id || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;

    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      nama_lengkap: payload.nama_lengkap,
      role: payload.role,
      unit: payload.unit,
      jabatan: payload.jabatan,
    };
  } catch {
    return null;
  }
}

/** Role yang boleh mengakses menu Sistem & Pengaturan. */
export function isSuperadmin(user: SessionUser | null): boolean {
  return user?.role === "superadmin";
}
