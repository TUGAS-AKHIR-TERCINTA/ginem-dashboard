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
import { DASHBOARD_API, dashboardService } from "./dashboardService";

describe("dashboardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getStats fetches dashboard statistics", async () => {
    const stats = {
      devices: 5,
      users: 2,
      schedulerLogs: 10,
      appLogs: 100,
      vectorIndexes: 3,
    };
    vi.mocked(apiClient.get).mockResolvedValue(stats);

    const result = await dashboardService.getStats();

    expect(apiClient.get).toHaveBeenCalledWith(DASHBOARD_API.stats);
    expect(result).toEqual(stats);
  });

  it("getLogs fetches paginated app logs", async () => {
    await dashboardService.getLogs({ page: 1, size: 10, search: "" });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: DASHBOARD_API.logs,
      page: 1,
      size: 10,
      filter: { search: "" },
    });
  });
});
