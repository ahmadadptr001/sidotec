import Image from "next/image";
import { LOGO_ALT, LOGO_PATH } from "@/lib/logo";

interface LogoSidotecProps {
  /** Kelas Tailwind untuk ukuran tampil, mis. "w-9 h-9". */
  className?: string;
  /** Sisi bitmap yang diminta ke pengoptimal gambar Next.js. */
  ukuran?: number;
  /** Prioritaskan pemuatan (dipakai pada logo besar di halaman masuk). */
  prioritas?: boolean;
  alt?: string;
}

/**
 * Lambang Politeknik Indotec Kendari.
 *
 * Berkas gambarnya berada di `public/` (lihat `lib/logo.ts`) sehingga lambang
 * yang sama juga terpakai pada ikon tab browser dan kop surat hasil cetak.
 */
export default function LogoSidotec({
  className = "w-8 h-8",
  ukuran = 96,
  prioritas = false,
  alt = LOGO_ALT,
}: LogoSidotecProps) {
  return (
    <Image
      src={LOGO_PATH}
      alt={alt}
      width={ukuran}
      height={ukuran}
      priority={prioritas}
      // Logo persegi: object-contain menjaga proporsinya pada ukuran apa pun.
      className={`${className} object-contain`}
    />
  );
}
