import { LOGO_INNER, LOGO_INNER_CETAK, LOGO_VIEWBOX } from "@/lib/logo";

interface LogoSidotecProps {
  className?: string;
  varian?: "warna" | "cetak";
  title?: string;
}

/**
 * Lambang SIDOTEC. Bentuknya diambil dari `lib/logo.ts` supaya identik dengan
 * ikon tab browser (`app/icon.svg`) dan kop surat pada hasil cetak.
 *
 * `dangerouslySetInnerHTML` di sini aman: isinya konstanta statis dari kode,
 * bukan data dari pengguna atau database.
 */
export default function LogoSidotec({
  className = "w-8 h-8",
  varian = "warna",
  title = "Logo SIDOTEC",
}: LogoSidotecProps) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      className={className}
      role="img"
      aria-label={title}
      dangerouslySetInnerHTML={{
        __html: varian === "warna" ? LOGO_INNER : LOGO_INNER_CETAK,
      }}
    />
  );
}
