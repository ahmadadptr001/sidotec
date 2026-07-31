import {
  base64UrlToBytes,
  bytesToBase64Url,
  timingSafeEqual,
  toArrayBuffer,
  utf8ToBytes,
} from "@/lib/encoding";

// Format penyimpanan: pbkdf2-sha256$<iterasi>$<salt>$<hash>
const ALGORITHM = "pbkdf2-sha256";
const ITERATIONS = 210_000;
const KEY_LENGTH_BITS = 256;
const SALT_LENGTH_BYTES = 16;

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(utf8ToBytes(password)),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: toArrayBuffer(salt),
      iterations,
      hash: "SHA-256",
    },
    key,
    KEY_LENGTH_BITS,
  );

  return bytesToBase64Url(new Uint8Array(bits));
}

export function isHashedPassword(stored: string | null | undefined): boolean {
  return typeof stored === "string" && stored.startsWith(`${ALGORITHM}$`);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `${ALGORITHM}$${ITERATIONS}$${bytesToBase64Url(salt)}$${hash}`;
}

export interface VerifyResult {
  ok: boolean;
  /**
   * true ketika password tersimpan masih plaintext (data lama) sehingga perlu
   * di-hash ulang setelah login berhasil.
   */
  needsUpgrade: boolean;
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<VerifyResult> {
  if (!stored) return { ok: false, needsUpgrade: false };

  if (!isHashedPassword(stored)) {
    // Kompatibilitas data lama yang masih menyimpan password apa adanya.
    return { ok: timingSafeEqual(password, stored), needsUpgrade: true };
  }

  const [, rawIterations, rawSalt, expected] = stored.split("$");
  const iterations = Number(rawIterations);
  if (!Number.isFinite(iterations) || iterations <= 0 || !rawSalt || !expected) {
    return { ok: false, needsUpgrade: false };
  }

  const actual = await derive(password, base64UrlToBytes(rawSalt), iterations);
  return {
    ok: timingSafeEqual(actual, expected),
    // Hash lama dengan iterasi di bawah standar sekarang ikut di-upgrade.
    needsUpgrade: iterations < ITERATIONS,
  };
}
