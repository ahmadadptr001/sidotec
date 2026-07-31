import { http } from "@/services/http";
import type { BackupData } from "@/lib/tipe";

/**
 * Mengunduh berkas cadangan. Memakai `format=file` supaya server mengirim isi
 * backup mentah (metadata + tables), bukan pembungkus { status, data } —
 * bentuk mentah inilah yang bisa dibaca kembali oleh halaman Restore.
 */
export async function backupDatabase(): Promise<Blob> {
  const response = await http.get("/api/backup?format=file", {
    responseType: "blob",
  });
  return response.data;
}

export async function getBackupStats() {
  const response = await http.get("/api/backup");
  return response.data;
}

export async function restoreDatabase(backupData: BackupData) {
  const response = await http.post("/api/restore", backupData);
  return response.data;
}
