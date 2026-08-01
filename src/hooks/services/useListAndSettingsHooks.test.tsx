import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createAppQueryWrapper,
  createTestQueryClient,
  renderHook,
} from "@/test/test-utils";
import { queryKeys } from "@/services/query-keys";

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
  useDashboardLogsQuery,
  useDashboardStatsQuery,
  useDisconnectWhatsappMutation,
  useEmbeddingListQuery,
  useLoggerListQuery,
  useSchedulerListQuery,
  useWhatsappStatusQuery,
} from "@/hooks/services";

describe("dashboard hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useDashboardStatsQuery fetches stats", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ devices: 3 });

    const { result } = renderHook(() => useDashboardStatsQuery(), {
      wrapper: createAppQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/stats");
  });

  it("useDashboardLogsQuery fetches paginated logs", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    const { result } = renderHook(
      () => useDashboardLogsQuery({ page: 1, size: 10 }),
      { wrapper: createAppQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: "/logs",
      page: 1,
      size: 10,
      filter: { search: undefined },
    });
  });
});

describe("list hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useLoggerListQuery fetches logger data", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    const { result } = renderHook(
      () => useLoggerListQuery({ page: 1, size: 10 }),
      { wrapper: createAppQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.getTableData).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/logs" }),
    );
  });

  it("useSchedulerListQuery fetches scheduler logs", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    const { result } = renderHook(
      () => useSchedulerListQuery({ page: 1, size: 10, search: "job" }),
      { wrapper: createAppQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.getTableData).toHaveBeenCalledWith({
      path: "/scheduler-logs",
      page: 1,
      size: 10,
      filter: { search: "job" },
    });
  });

  it("useEmbeddingListQuery fetches indexing records", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [],
      totalItems: 0,
    });

    const { result } = renderHook(
      () => useEmbeddingListQuery({ page: 1, size: 10 }),
      { wrapper: createAppQueryWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.getTableData).toHaveBeenCalledWith(
      expect.objectContaining({ path: "/indexing" }),
    );
  });
});

describe("settings hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useWhatsappStatusQuery fetches connection status", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      connectionStatus: "connected",
    });

    const { result } = renderHook(() => useWhatsappStatusQuery(), {
      wrapper: createAppQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/whatsapp/connection-status");
  });

  it("useDisconnectWhatsappMutation disconnects and invalidates status", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({});
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDisconnectWhatsappMutation(), {
      wrapper: createAppQueryWrapper(queryClient),
    });

    await result.current.mutateAsync();

    expect(apiClient.post).toHaveBeenCalledWith("/whatsapp/disconnect", {});
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.get("/whatsapp/connection-status"),
    });
  });
});
