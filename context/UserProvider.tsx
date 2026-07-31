"use client";

import type { SessionUser } from "@/lib/session";
import { createContext, useContext, useMemo, useState } from "react";

export interface Instansi {
  id: number | string;
  nama_instansi: string;
  status: string;
  alamat: string;
  website: string;
  email: string;
  nomor_telpon: string;
  akreditasi: string;
}

interface UserContextValue {
  user: SessionUser | null;
  instansi: Instansi[] | null;
  setUser: (user: SessionUser | null) => void;
  setInstansi: (instansi: Instansi[] | null) => void;
}

// null = dipakai di luar <UserProvider>. Dengan nilai bawaan berisi setter
// kosong, kesalahan seperti itu tidak memunculkan error apa pun — state tidak
// pernah berubah dan halaman hanya berputar di layar pemuatan selamanya.
const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [instansi, setInstansi] = useState<Instansi[] | null>(null);

  const value = useMemo(
    () => ({ user, instansi, setUser, setInstansi }),
    [user, instansi],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error(
      "useUser() dipakai di luar <UserProvider>. Pastikan komponen berada di dalam UserProvider pada app/layout.tsx.",
    );
  }
  return context;
};
