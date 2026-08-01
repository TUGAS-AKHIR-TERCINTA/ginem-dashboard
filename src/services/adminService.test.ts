import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api", () => ({
  apiClient: {
    get: vi.fn(),
    getTableData: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    remove: vi.fn(),
  },
}));

import { apiClient } from "@/services/api";
import { ADMIN_API, adminService } from "./adminService";

describe("adminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getList fetches paginated admins", async () => {
    await adminService.getList({ page: 1, size: 10, search: "john" });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: ADMIN_API.list,
      page: 1,
      size: 10,
      filter: { search: "john" },
    });
  });

  it("create posts admin payload", async () => {
    const payload = {
      userName: "John",
      userEmail: "john@example.com",
      userPassword: "password123",
    };

    await adminService.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith(ADMIN_API.list, payload);
  });

  it("update patches admin payload", async () => {
    const payload = {
      userId: 3,
      userName: "John",
      userEmail: "john@example.com",
    };

    await adminService.update(payload);

    expect(apiClient.patch).toHaveBeenCalledWith(ADMIN_API.list, payload);
  });

  it("delete removes admin by user id", async () => {
    await adminService.delete(3);

    expect(apiClient.remove).toHaveBeenCalledWith("/admins/3");
  });
});
