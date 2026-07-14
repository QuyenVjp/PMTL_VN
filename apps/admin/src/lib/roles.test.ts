import { describe, it, expect } from "vitest";
import {
  isAdminRole,
  assignableRolesForActor,
  canManageTargetRole,
  type UserRole,
} from "./roles";

describe("isAdminRole", () => {
  it("accepts ADMIN and SUPER_ADMIN", () => {
    expect(isAdminRole("ADMIN")).toBe(true);
    expect(isAdminRole("SUPER_ADMIN")).toBe(true);
  });

  it("rejects MEMBER and unknown strings", () => {
    expect(isAdminRole("MEMBER")).toBe(false);
    expect(isAdminRole("something-else")).toBe(false);
  });
});

/**
 * These cases mirror the backend `AdminUsersService.changeRole` gate exactly:
 * setting or changing a SUPER_ADMIN role requires the actor to be SUPER_ADMIN.
 */
describe("assignableRolesForActor (projects backend changeRole gate)", () => {
  it("SUPER_ADMIN actor may assign any role to any target", () => {
    for (const target of ["MEMBER", "ADMIN", "SUPER_ADMIN"] as UserRole[]) {
      expect(assignableRolesForActor("SUPER_ADMIN", target)).toEqual([
        "MEMBER",
        "ADMIN",
        "SUPER_ADMIN",
      ]);
    }
  });

  it("ADMIN actor may only move a MEMBER/ADMIN target within MEMBER↔ADMIN (never SUPER_ADMIN)", () => {
    expect(assignableRolesForActor("ADMIN", "MEMBER")).toEqual(["MEMBER", "ADMIN"]);
    expect(assignableRolesForActor("ADMIN", "ADMIN")).toEqual(["MEMBER", "ADMIN"]);
  });

  it("ADMIN actor cannot touch a SUPER_ADMIN target at all", () => {
    expect(assignableRolesForActor("ADMIN", "SUPER_ADMIN")).toEqual([]);
  });

  it("MEMBER actor (defensive) can assign nothing", () => {
    expect(assignableRolesForActor("MEMBER", "MEMBER")).toEqual([]);
    expect(assignableRolesForActor("MEMBER", "ADMIN")).toEqual([]);
  });

  it("SUPER_ADMIN option is never offered to an ADMIN actor", () => {
    for (const target of ["MEMBER", "ADMIN", "SUPER_ADMIN"] as UserRole[]) {
      expect(assignableRolesForActor("ADMIN", target)).not.toContain("SUPER_ADMIN");
    }
  });

  it("the current target role is always present when the actor can manage it", () => {
    // guarantees the Select can always render the current value as an option
    expect(assignableRolesForActor("ADMIN", "ADMIN")).toContain("ADMIN");
    expect(assignableRolesForActor("SUPER_ADMIN", "SUPER_ADMIN")).toContain("SUPER_ADMIN");
  });
});

describe("canManageTargetRole", () => {
  it("is false when the actor has no assignable roles for the target", () => {
    expect(canManageTargetRole("ADMIN", "SUPER_ADMIN")).toBe(false);
    expect(canManageTargetRole("MEMBER", "MEMBER")).toBe(false);
  });

  it("is true when the actor has assignable roles", () => {
    expect(canManageTargetRole("ADMIN", "MEMBER")).toBe(true);
    expect(canManageTargetRole("SUPER_ADMIN", "SUPER_ADMIN")).toBe(true);
  });
});
