/**
 * Mengambil pesan yang layak ditampilkan dari nilai apa pun yang di-throw.
 *
 * Pola lama `catch (err: any)` lalu `err.message` menghasilkan `undefined`
 * ketika yang dilempar bukan Error (misalnya string atau objek biasa), sehingga
 * dialog error tampil tanpa keterangan.
 */
export function pesanError(
  err: unknown,
  bawaan = "Terjadi kesalahan yang tidak diketahui",
): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message?: unknown }).message === "string" &&
    (err as { message: string }).message.trim()
  ) {
    return (err as { message: string }).message;
  }
  return bawaan;
}
