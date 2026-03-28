/**
 * Admin user accessor — reads from the auth cache populated by getCurrentUser().
 *
 * beforeLoad() in _authenticated layout calls getCurrentUser() before any
 * child component renders, so getCachedUser() always returns a value here.
 */
import { getCachedUser } from "@/lib/auth";

export interface AdminUserDisplay {
  name: string;
  initials: string;
  email: string;
  role: string;
  avatar: string | undefined;
}

function makeInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function roleLabel(role: string): string {
  if (role === "SUPER_ADMIN") return "Quản trị viên cao cấp";
  if (role === "ADMIN") return "Điều phối vận hành";
  return role;
}

const fallbackUser: AdminUserDisplay = {
  name: "Admin",
  initials: "A",
  email: "",
  role: "Admin",
  avatar: undefined,
};

/**
 * Get the current admin user for display in layout components.
 * Reads synchronously from the auth cache (populated by route beforeLoad).
 */
export function getAdminUserDisplay(): AdminUserDisplay {
  const user = getCachedUser();
  if (!user) return fallbackUser;

  return {
    name: user.displayName,
    initials: makeInitials(user.displayName),
    email: user.email,
    role: roleLabel(user.role),
    avatar: user.avatarUrl ?? undefined,
  };
}
