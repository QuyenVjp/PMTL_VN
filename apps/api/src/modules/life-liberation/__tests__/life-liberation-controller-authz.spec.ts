/**
 * Controller-level regression: member route must call getMemberRecord with user.id.
 * Admin route must call getAdminRecord (unscoped).
 */
import { describe, expect, it, vi } from "vitest";
import {
  AdminLifeLiberationController,
  MemberLifeLiberationController,
} from "../life-liberation.controller.js";

describe("LifeLiberation controller ownership wiring", () => {
  it("member getOne → getMemberRecord(publicId, user.id)", async () => {
    const svc = {
      getMemberRecord: vi.fn().mockResolvedValue({ publicId: "ll1" }),
      getAdminRecord: vi.fn(),
      getRecord: vi.fn(),
    };
    const controller = new MemberLifeLiberationController(svc as never);
    const user = { id: "user-A", publicId: "pub-A" };

    await controller.getOne("ll1", user as never);

    expect(svc.getMemberRecord).toHaveBeenCalledWith("ll1", "user-A");
    expect(svc.getAdminRecord).not.toHaveBeenCalled();
    expect(svc.getRecord).not.toHaveBeenCalled();
  });

  it("admin getOne → getAdminRecord(publicId) without owner", async () => {
    const svc = {
      getMemberRecord: vi.fn(),
      getAdminRecord: vi.fn().mockResolvedValue({ publicId: "ll1" }),
      getRecord: vi.fn(),
    };
    const controller = new AdminLifeLiberationController(svc as never);

    await controller.getOne("ll1");

    expect(svc.getAdminRecord).toHaveBeenCalledWith("ll1");
    expect(svc.getMemberRecord).not.toHaveBeenCalled();
  });
});
