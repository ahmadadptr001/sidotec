"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { session } from "@/services/user";
import LogoSidotec from "@/components/ui/LogoSidotec";

export default function HalamanAwal() {
  const router = useRouter();

  useEffect(() => {
    let dibatalkan = false;

    (async () => {
      try {
        const response = await session();
        if (dibatalkan) return;
        router.replace(response?.isLogin ? "/dashboard" : "/autentikasi/masuk");
      } catch {
        if (!dibatalkan) router.replace("/autentikasi/masuk");
      }
    })();

    return () => {
      dibatalkan = true;
    };
  }, [router]);

  // Komponen ini sebelumnya tidak me-return apa pun sehingga layar putih kosong
  // sempat terlihat sebelum pengalihan selesai.
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <LogoSidotec className="w-14 h-14 animate-pulse" />
      <div className="text-center">
        <p className="text-lg font-bold tracking-tight text-slate-800">SIDOTEC</p>
        <p className="text-xs font-medium text-slate-500 mt-1">
          Menyiapkan sesi Anda...
        </p>
      </div>
    </main>
  );
}
