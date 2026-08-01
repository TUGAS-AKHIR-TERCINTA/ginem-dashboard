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
import { LOGGER_API, loggerService } from "./loggerService";

describe("loggerService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getList fetches paginated logs", async () => {
    await loggerService.getList({ page: 1, size: 10, search: "error" });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: LOGGER_API.list,
      page: 1,
      size: 10,
      filter: { search: "error" },
    });
  });
});
