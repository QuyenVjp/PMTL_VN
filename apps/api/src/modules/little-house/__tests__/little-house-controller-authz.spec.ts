/**
 * Controller-level regression: member route must call getMemberRecord with user.id.
 * Admin route must call getAdminRecord (unscoped).
 */
import { describe, expect, it, vi } from "vitest";
import {
  AdminLittleHouseController,
  MemberLittleHouseController,
} from "../little-house.controller.js";

describe("LittleHouse controller ownership wiring", () => {
  it("member getOne → getMemberRecord(publicId, user.id)", async () => {
    const svc = {
      getMemberRecord: vi.fn().mockResolvedValue({ publicId: "lh1" }),
      getAdminRecord: vi.fn(),
      getRecord: vi.fn(),
    };
    const controller = new MemberLittleHouseController(svc as never);
    const user = { id: "user-A", publicId: "pub-A" };

    await controller.getOne("lh1", user as never);

    expect(svc.getMemberRecord).toHaveBeenCalledWith("lh1", "user-A");
    expect(svc.getAdminRecord).not.toHaveBeenCalled();
    expect(svc.getRecord).not.toHaveBeenCalled();
  });

  it("admin getOne → getAdminRecord(publicId) without owner", async () => {
    const svc = {
      getMemberRecord: vi.fn(),
      getAdminRecord: vi.fn().mockResolvedValue({ publicId: "lh1" }),
      getRecord: vi.fn(),
    };
    const controller = new AdminLittleHouseController(svc as never);

    await controller.getOne("lh1");

    expect(svc.getAdminRecord).toHaveBeenCalledWith("lh1");
    expect(svc.getMemberRecord).not.toHaveBeenCalled();
  });
});
