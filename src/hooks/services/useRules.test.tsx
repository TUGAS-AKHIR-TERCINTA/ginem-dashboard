import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAppQueryWrapper, renderHook } from "@/test/test-utils";

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
import {
  useRuleDetailQuery,
  useRuleExecutionLogsQuery,
  useRuleListQuery,
} from "./useRules";

describe("useRuleListQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches rules with pagination, search, and isActive", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [{ ruleId: 1, name: "Humidity" }],
      totalItems: 1,
    });

    const { result } = renderHook(
      () =>
        useRuleListQuery({
          page: 1,
          size: 20,
          search: "humidity",
          isActive: true,
        }),
      { wrapper: createAppQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: "/rules",
      page: 1,
      size: 20,
      filter: { search: "humidity", isActive: "true" },
    });
    expect(result.current.data?.items).toHaveLength(1);
  });
});

describe("useRuleDetailQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches rule detail when ruleId is provided", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ ruleId: 5 });

    const { result } = renderHook(() => useRuleDetailQuery("5"), {
      wrapper: createAppQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/rules/detail/5");
  });

  it("does not fetch when ruleId is missing", () => {
    renderHook(() => useRuleDetailQuery(undefined), {
      wrapper: createAppQueryWrapper(),
    });

    expect(apiClient.get).not.toHaveBeenCalled();
  });
});

describe("useRuleExecutionLogsQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches execution logs filtered by ruleId", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    const { result } = renderHook(
      () =>
        useRuleExecutionLogsQuery({
          page: 1,
          size: 20,
          ruleId: 4,
        }),
      { wrapper: createAppQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: "/rules/execution-logs",
      page: 1,
      size: 20,
      filter: { ruleId: "4" },
    });
  });

  it("does not fetch when disabled", () => {
    renderHook(
      () =>
        useRuleExecutionLogsQuery({
          page: 1,
          size: 20,
          ruleId: 4,
          enabled: false,
        }),
      { wrapper: createAppQueryWrapper() },
    );

    expect(apiClient.getTableData).not.toHaveBeenCalled();
  });
});
