"use client";

import Link from "next/link";

import { useAuthSession } from "../hooks/use-auth-session";
import { LogoutButton } from "./logout-button";

export function AuthNavigation() {
  const { isLoading, session } = useAuthSession();

  if (isLoading) {
    return <span className="muted">...</span>;
  }

  if (!session) {
    return (
      <div className="inline-list">
        <Link href="/login">Dang nhap</Link>
        <Link href="/register">Dang ky</Link>
      </div>
    );
  }

  return (
    <div className="inline-list">
      <span className="muted">Xin chao, {session.user.displayName}</span>
      <Link href="/profile">Profile</Link>
      <LogoutButton />
    </div>
  );
}

