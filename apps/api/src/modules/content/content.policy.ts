import type { UserRole, ContentStatus } from "../../generated/prisma/client.js";

export function canCreatePost(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canEditPost(role: UserRole, authorId: string, currentUserId: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  if (role === "ADMIN" && authorId === currentUserId) return true;
  return false;
}

export function canPublishPost(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canDeletePost(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function canUnpublishPost(role: UserRole): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function getPublicStatuses(): ContentStatus[] {
  return ["PUBLISHED"];
}
