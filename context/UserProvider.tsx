"use client";

import { createContext, useContext, useState } from "react";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);
  const [instansi, setInstansi] = useState(null);

  return (
    <UserContext.Provider value={{ user, instansi, setUser, setInstansi }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
