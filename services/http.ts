import axios, { AxiosError } from "axios";

/**
 * Instance axios bersama untuk seluruh service.
 *
 * API sekarang mengembalikan kode HTTP yang sebenarnya (400/401/403/500), jadi
 * axios akan menolak promise-nya. Interceptor di bawah menerjemahkan respons
 * error menjadi Error biasa dengan pesan berbahasa Indonesia dari server,
 * sehingga pemanggil cukup memakai try/catch.
 */
export const http = axios.create();

/** Endpoint yang error 401-nya adalah bagian alur normal, bukan sesi habis. */
const TANPA_REDIRECT = ["/api/autentikasi/masuk", "/api/autentikasi/session"];

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ reason?: string }>) => {
    const url = error.config?.url ?? "";
    const status = error.response?.status;
    const reason = error.response?.data?.reason;

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !TANPA_REDIRECT.some((path) => url.startsWith(path))
    ) {
      // Sesi kedaluwarsa saat pengguna sedang bekerja: kembalikan ke halaman masuk.
      window.location.href = "/autentikasi/masuk";
    }

    if (typeof reason === "string" && reason.length > 0) {
      return Promise.reject(new Error(reason));
    }

    if (status === 401) {
      return Promise.reject(new Error("Sesi Anda telah berakhir. Silakan masuk kembali."));
    }
    if (status === 403) {
      return Promise.reject(new Error("Anda tidak memiliki akses untuk aksi ini"));
    }

    return Promise.reject(
      new Error(error.message || "Gagal menghubungi server"),
    );
  },
);
