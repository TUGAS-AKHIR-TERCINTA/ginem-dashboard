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
  useApiDeleteMutation,
  useApiPatchMutation,
  useApiPostMutation,
  useServiceDeleteMutation,
  useServicePatchMutation,
  useServicePostMutation,
} from "./useApiMutations";

describe("useApiMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts data and invalidates table queries", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ ok: true });

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => useApiPostMutation({ invalidateTablePaths: ["/devices"] }),
      { wrapper: createAppQueryWrapper(queryClient) },
    );

    await result.current.mutateAsync({
      path: "/devices",
      body: { deviceName: "Sensor A" },
    });

    expect(apiClient.post).toHaveBeenCalledWith("/devices", {
      deviceName: "Sensor A",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tableRoot("/devices"),
    });
  });

  it("patches data and invalidates get queries", async () => {
    vi.mocked(apiClient.patch).mockResolvedValue({ ok: true });

    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () => useApiPatchMutation({ invalidateGetPaths: ["/stats"] }),
      { wrapper: createAppQueryWrapper(queryClient) },
    );

    await result.current.mutateAsync({
      path: "/admins",
      body: { userName: "Updated" },
    });

    expect(apiClient.patch).toHaveBeenCalledWith("/admins", {
      userName: "Updated",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.get("/stats"),
    });
  });

  it("deletes resources", async () => {
    vi.mocked(apiClient.remove).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useApiDeleteMutation(), {
      wrapper: createAppQueryWrapper(),
    });

    await result.current.mutateAsync({ path: "/indexing/9" });

    expect(apiClient.remove).toHaveBeenCalledWith("/indexing/9");
  });

  it("shows success alert when configured", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ ok: true });

    const { result } = renderHook(
      () =>
        useApiPostMutation({
          successMessage: "Device created",
        }),
      { wrapper: createAppQueryWrapper() },
    );

    await result.current.mutateAsync({
      path: "/devices",
      body: {},
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});

describe("useServiceMutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useServicePostMutation calls service function and invalidates table", async () => {
    const serviceFn = vi.fn().mockResolvedValue({ ok: true });
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () =>
        useServicePostMutation(serviceFn, {
          invalidateTablePaths: ["/devices"],
        }),
      { wrapper: createAppQueryWrapper(queryClient) },
    );

    await result.current.mutateAsync({ deviceName: "Sensor" });

    expect(serviceFn.mock.calls[0]?.[0]).toEqual({ deviceName: "Sensor" });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tableRoot("/devices"),
    });
  });

  it("useServicePatchMutation calls service function", async () => {
    const serviceFn = vi.fn().mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useServicePatchMutation(serviceFn), {
      wrapper: createAppQueryWrapper(),
    });

    await result.current.mutateAsync({ deviceId: 1, deviceName: "Updated" });

    expect(serviceFn.mock.calls[0]?.[0]).toEqual({
      deviceId: 1,
      deviceName: "Updated",
    });
  });

  it("useServiceDeleteMutation calls service function with id", async () => {
    const serviceFn = vi.fn().mockResolvedValue({ ok: true });
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(
      () =>
        useServiceDeleteMutation(serviceFn, {
          invalidateTablePaths: ["/indexing"],
        }),
      { wrapper: createAppQueryWrapper(queryClient) },
    );

    await result.current.mutateAsync(15);

    expect(serviceFn.mock.calls[0]?.[0]).toBe(15);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tableRoot("/indexing"),
    });
  });
});
