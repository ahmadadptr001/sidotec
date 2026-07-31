import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserProvider";

export const metadata: Metadata = {
  title: "SIDOTEC | Sistem Informasi Dokumentasi Indotec",
  description:
    "Rancang Bangun Sistem Informasi Pengelolaan Surat Masuk dan Surat keluar di Politeknik Indotec kendari",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={` h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
