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
  useCreateDeviceMutation,
  useDeleteDeviceMutation,
  useDeviceDetailQuery,
  useDeviceListQuery,
  useUpdateDeviceMutation,
} from "./useDevices";

describe("useDeviceListQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches device list with pagination and search", async () => {
    vi.mocked(apiClient.getTableData).mockResolvedValue({
      items: [{ deviceId: 1, deviceName: "Sensor" }],
      totalItems: 1,
    });

    const { result } = renderHook(
      () =>
        useDeviceListQuery({
          page: 1,
          size: 10,
          search: "sensor",
          refetchInterval: 5000,
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
});

describe("useDeviceDetailQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches device detail when deviceId is provided", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ deviceId: 5 });

    const { result } = renderHook(() => useDeviceDetailQuery("5"), {
      wrapper: createAppQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/devices/detail/5");
  });

  it("does not fetch when deviceId is missing", () => {
    renderHook(() => useDeviceDetailQuery(undefined), {
      wrapper: createAppQueryWrapper(),
    });

    expect(apiClient.get).not.toHaveBeenCalled();
  });
});

describe("device mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useCreateDeviceMutation posts and invalidates device list", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ ok: true });
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateDeviceMutation(), {
      wrapper: createAppQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({
      deviceName: "Sensor A",
      deviceType: "sensor",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/devices", {
      deviceName: "Sensor A",
      deviceType: "sensor",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tableRoot("/devices"),
    });
  });

  it("useUpdateDeviceMutation patches and invalidates device list", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ ok: true });
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateDeviceMutation(), {
      wrapper: createAppQueryWrapper(queryClient),
    });

    const payload = {
      deviceId: 1,
      deviceName: "Updated",
      deviceStatus: "online",
      deviceMetadata: {},
    };

    await result.current.mutateAsync(payload);

    expect(apiClient.patch).toHaveBeenCalledWith("/devices", payload);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tableRoot("/devices"),
    });
  });

  it("useDeleteDeviceMutation deletes and invalidates device list", async () => {
    vi.mocked(apiClient.remove).mockResolvedValue({ ok: true });
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteDeviceMutation(), {
      wrapper: createAppQueryWrapper(queryClient),
    });

    await result.current.mutateAsync(9);

    expect(apiClient.remove).toHaveBeenCalledWith("/devices/9");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tableRoot("/devices"),
    });
  });
});
