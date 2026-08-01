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
import { SCHEDULER_API, schedulerService } from "./schedulerService";

describe("schedulerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getList fetches paginated scheduler logs", async () => {
    await schedulerService.getList({ page: 2, size: 25, search: "cron" });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: SCHEDULER_API.list,
      page: 2,
      size: 25,
      filter: { search: "cron" },
    });
  });
});
