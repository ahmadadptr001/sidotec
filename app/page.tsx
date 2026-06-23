"use client";

import { useEffect, useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { session } from "@/services/user";

export default function LoginPage() {
  const router = useRouter();

  const checkSession = async () => {
    const response = await session();

    if (response?.isLogin) {
      router.replace("/dashboard");
    } else {
      router.replace("/autentikasi/masuk");
    }
  };

  useEffect(() => {
    checkSession();
  }, []);
}
