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
        <Link href="/login">Đăng nhập</Link>
        <Link href="/register">Đăng ký</Link>
      </div>
    );
  }

  return (
    <div className="inline-list">
      <span className="muted">Xin chào, {session.user.displayName}</span>
      <Link href="/profile">Hồ sơ</Link>
      <LogoutButton />
    </div>
  );
}

