import { supabase } from "@/config/supabase";
import { ApiError } from "@/lib/api";

export const SURAT_BUCKET = "surat";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

/**
 * Membersihkan nama file agar aman dipakai sebagai object key storage
 * (spasi, tanda baca, dan karakter non-ASCII sering merusak URL publik).
 */
function safeObjectName(originalName: string): string {
  const dot = originalName.lastIndexOf(".");
  const base = dot > 0 ? originalName.slice(0, dot) : originalName;
  const ext = dot > 0 ? originalName.slice(dot + 1).toLowerCase() : "";

  const slug =
    base
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .toLowerCase() || "dokumen";

  const suffix = ext.replace(/[^a-z0-9]/g, "");
  return suffix ? `${Date.now()}-${slug}.${suffix}` : `${Date.now()}-${slug}`;
}

export function assertValidSuratFile(file: File): void {
  if (!file || typeof file === "string" || file.size === 0) {
    throw new ApiError(400, "File dokumen wajib diunggah");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new ApiError(400, "Ukuran file maksimal 5MB");
  }
  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    throw new ApiError(
      400,
      "Hanya format .pdf, .jpg, .jpeg, dan .png yang diizinkan",
    );
  }
}

export async function uploadSuratFile(
  file: File,
): Promise<{ path: string; publicUrl: string }> {
  assertValidSuratFile(file);

  const path = safeObjectName(file.name);
  const { error } = await supabase.storage
    .from(SURAT_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error("[storage.upload]", error);
    throw new ApiError(400, `Gagal mengunggah file: ${error.message}`);
  }

  const { data } = supabase.storage.from(SURAT_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/** Mengubah URL publik kembali menjadi object key di dalam bucket. */
export function objectPathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/object/public/${SURAT_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const raw = url.slice(index + marker.length).split("?")[0];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/**
 * Menghapus file lampiran. Kegagalan di sini tidak boleh membatalkan operasi
 * utama (baris database sudah/akan berubah), jadi cukup dicatat di log.
 */
export async function removeSuratFile(
  pathOrUrl: string | null | undefined,
): Promise<void> {
  const path = pathOrUrl?.startsWith("http")
    ? objectPathFromPublicUrl(pathOrUrl)
    : pathOrUrl ?? null;

  if (!path) return;

  const { error } = await supabase.storage.from(SURAT_BUCKET).remove([path]);
  if (error) {
    console.error("[storage.remove]", path, error);
  }
}
