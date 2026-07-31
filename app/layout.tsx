import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserProvider";

// Judul & deskripsi mengikuti judul tugas akhir pada halaman sampul.
export const metadata: Metadata = {
  title: "SIDOTEC | Politeknik Indotec Kendari",
  description:
    "Rancang Bangun Sistem Informasi Pengelolaan Surat Masuk dan Surat Keluar di Politeknik Indotec Kendari Berbasis Web",
  applicationName: "SIDOTEC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
