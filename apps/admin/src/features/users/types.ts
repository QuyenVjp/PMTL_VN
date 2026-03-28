/** API-aligned types for Admin Users feature */

// Backend enum values
export type ApiUserRole = "MEMBER" | "ADMIN" | "SUPER_ADMIN";
export type ApiUserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

/** User list item returned by GET /admin/users */
export interface AdminUserListItem {
  publicId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: ApiUserRole;
  status: ApiUserStatus;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** User detail returned by GET /admin/users/:publicId */
export interface AdminUserDetail extends AdminUserListItem {
  emailVerifiedAt: string | null;
  sessionCount: number;
  postCount: number;
}

/** Payload for PATCH /admin/users/:publicId/profile */
export interface UpdateProfileInput {
  displayName?: string;
  email?: string;
  avatarUrl?: string | null;
}

/** Payload for PATCH /admin/users/:publicId/role */
export interface ChangeRoleInput {
  role: ApiUserRole;
}

/** Payload for POST /admin/users/:publicId/block */
export interface BlockUserInput {
  reason?: string;
}

/** Query filters for the users list */
export interface UserListFilters {
  search?: string;
  role?: ApiUserRole;
  status?: ApiUserStatus;
  limit?: number;
  offset?: number;
}

// --- Vietnamese label mappings ---

export const ROLE_LABELS: Record<ApiUserRole, string> = {
  MEMBER: "Thành viên",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

export const STATUS_LABELS: Record<ApiUserStatus, string> = {
  ACTIVE: "Hoạt động",
  SUSPENDED: "Tạm khóa",
  PENDING_VERIFICATION: "Chờ xác minh",
};

export const roleOptions: { label: string; value: ApiUserRole }[] = [
  { label: "Thành viên", value: "MEMBER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Super Admin", value: "SUPER_ADMIN" },
];

export const statusOptions: { label: string; value: ApiUserStatus }[] = [
  { label: "Hoạt động", value: "ACTIVE" },
  { label: "Tạm khóa", value: "SUSPENDED" },
  { label: "Chờ xác minh", value: "PENDING_VERIFICATION" },
];

export function roleLabel(role: ApiUserRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function statusLabel(status: ApiUserStatus): string {
  return STATUS_LABELS[status] ?? status;
}

/** @deprecated Use statusBadgeClass for rich colors */
export function statusVariant(status: ApiUserStatus): "default" | "secondary" | "outline" {
  if (status === "ACTIVE") return "secondary";
  if (status === "PENDING_VERIFICATION") return "outline";
  return "default";
}

/** Returns Tailwind color classes for `<Badge variant="outline" className={statusBadgeClass(s)}>` */
export function statusBadgeClass(status: ApiUserStatus): string {
  if (status === "ACTIVE")
    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
  if (status === "SUSPENDED")
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
  // PENDING_VERIFICATION
  return "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-400";
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
