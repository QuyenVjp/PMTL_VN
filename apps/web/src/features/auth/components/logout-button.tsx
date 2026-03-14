"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { logoutViaWeb } from "../api/browser-auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    void (async () => {
      setIsLoading(true);
      await logoutViaWeb();
      router.push("/");
      router.refresh();
    })();
  };

  return (
    <button
      className="button button-secondary"
      disabled={isLoading}
      onClick={handleClick}
      type="button"
    >
      {isLoading ? "Dang dang xuat..." : "Dang xuat"}
    </button>
  );
}
