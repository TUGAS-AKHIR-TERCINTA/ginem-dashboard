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
import { RULE_API, ruleService } from "./ruleService";

describe("ruleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getList fetches paginated rules with search and isActive", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    await ruleService.getList({
      page: 1,
      size: 20,
      search: "humidity",
      isActive: true,
    });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: RULE_API.list,
      page: 1,
      size: 20,
      filter: { search: "humidity", isActive: "true" },
    });
  });

  it("getList omits isActive when not provided", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    await ruleService.getList({ page: 2, size: 10 });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: RULE_API.list,
      page: 2,
      size: 10,
      filter: { search: undefined, isActive: undefined },
    });
  });

  it("getDetail fetches a rule by id", async () => {
    await ruleService.getDetail(7);

    expect(apiClient.get).toHaveBeenCalledWith("/rules/detail/7");
  });

  it("getExecutionLogs fetches logs with optional ruleId", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    await ruleService.getExecutionLogs({ page: 1, size: 20, ruleId: 3 });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: RULE_API.executionLogs,
      page: 1,
      size: 20,
      filter: { ruleId: "3" },
    });
  });

  it("getExecutionLogs omits ruleId when listing all logs", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    await ruleService.getExecutionLogs({ page: 1, size: 20 });

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: RULE_API.executionLogs,
      page: 1,
      size: 20,
      filter: { ruleId: undefined },
    });
  });
});
