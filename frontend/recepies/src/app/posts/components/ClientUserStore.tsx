"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ClientUserStore() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const userId = searchParams.get("userId");
    const username = searchParams.get("username");

    if (userId) {
      localStorage.setItem("userDocumentId", userId);
    }
    if (username) {
      localStorage.setItem("username", username);
    }
  }, [searchParams]);

  return null;
}
