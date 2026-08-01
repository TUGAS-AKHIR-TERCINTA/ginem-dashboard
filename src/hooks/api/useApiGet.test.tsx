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
import { useApiGet } from "./useApiGet";

describe("useApiGet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches data with the configured query key", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ devices: 3 });

    const queryClient = createTestQueryClient();
    const { result } = renderHook(
      () => useApiGet<{ devices: number }>("/stats"),
      {
        wrapper: createAppQueryWrapper(queryClient),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient.get).toHaveBeenCalledWith("/stats");
    expect(result.current.data).toEqual({ devices: 3 });
  });

  it("does not fetch when enabled is false", async () => {
    renderHook(() => useApiGet("/stats", { enabled: false }), {
      wrapper: createAppQueryWrapper(),
    });

    expect(apiClient.get).not.toHaveBeenCalled();
  });

  it("surfaces API errors to the query state", async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useApiGet("/stats"), {
      wrapper: createAppQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(new Error("Network error"));
  });
});
