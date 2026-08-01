import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAppQueryWrapper,
  createTestQueryClient,
  renderHook,
} from "@/test/test-utils";

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
import { useTableDataQuery } from "./useTableDataQuery";

describe("useTableDataQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches paginated table data", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [{ deviceId: 1, deviceName: "Sensor A" }],
      totalItems: 1,
    });

    const { result } = renderHook(
      () =>
        useTableDataQuery("/devices", {
          page: 1,
          size: 10,
          filter: { search: "sensor" },
        }),
      { wrapper: createAppQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: "/devices",
      page: 1,
      size: 10,
      filter: { search: "sensor" },
    });
    expect(result.current.data?.items).toHaveLength(1);
  });

  it("supports polling via refetchInterval", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(
      () =>
        useTableDataQuery("/devices", {
          page: 1,
          size: 10,
          refetchInterval: 5000,
        }),
      { wrapper: createAppQueryWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const query = queryClient.getQueryCache().findAll()[0];
    expect(query?.options.refetchInterval).toBe(5000);
  });
});
