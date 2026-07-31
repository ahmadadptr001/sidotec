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

const UserContext = createContext<UserContextValue>({
  user: null,
  instansi: null,
  setUser: () => {},
  setInstansi: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [instansi, setInstansi] = useState<Instansi[] | null>(null);

  const value = useMemo(
    () => ({ user, instansi, setUser, setInstansi }),
    [user, instansi],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
