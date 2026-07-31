// Helper encoding yang aman dipakai di runtime Node maupun Edge (proxy.ts).
// Sengaja hanya memakai API Web standar (btoa/atob/TextEncoder) supaya modul ini
// bisa diimpor dari route handler dan dari proxy tanpa perubahan.

export function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

/**
 * Menyalin bytes ke ArrayBuffer baru. `crypto.subtle` menuntut BufferSource yang
 * dijamin ArrayBuffer (bukan SharedArrayBuffer), jadi konversi eksplisit ini
 * menghindari cast tipe di setiap pemanggilan.
 */
export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

/**
 * Perbandingan yang tidak membocorkan posisi karakter pertama yang berbeda.
 * Dipakai untuk membandingkan hash password dan signature cookie.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  const bytesA = utf8ToBytes(a);
  const bytesB = utf8ToBytes(b);
  // Panjang yang berbeda tetap diproses agar durasinya tidak bergantung isi.
  let diff = bytesA.length ^ bytesB.length;
  const max = Math.max(bytesA.length, bytesB.length);
  for (let i = 0; i < max; i++) {
    diff |= (bytesA[i] ?? 0) ^ (bytesB[i] ?? 0);
  }
  return diff === 0;
}
