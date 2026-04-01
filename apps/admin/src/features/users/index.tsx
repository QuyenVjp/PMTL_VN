import { UsersPrimaryButtons } from "@/features/users/users-primary-buttons";
import { UsersTable } from "@/features/users/users-table";

export function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách người dùng</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quản trị người dùng, vai trò và trạng thái tài khoản.
          </p>
        </div>
        <UsersPrimaryButtons />
      </div>

      <UsersTable />
    </div>
  );
}
