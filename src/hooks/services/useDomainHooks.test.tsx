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
  useChatMutation,
  useCreateAdminMutation,
  useDeleteAdminMutation,
  useMyProfileQuery,
} from "@/hooks/services";

describe("useMyProfileQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches current user profile", async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      userId: 1,
      userName: "Admin",
    });

    const { result } = renderHook(() => useMyProfileQuery(), {
      wrapper: createAppQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient.get).toHaveBeenCalledWith("/my-profiles");
  });
});

describe("useChatMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends chat message via chat service", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { reply: "Hello" },
    });

    const { result } = renderHook(() => useChatMutation(), {
      wrapper: createAppQueryWrapper(),
    });

    const response = await result.current.mutateAsync({ message: "Hi" });

    expect(apiClient.post).toHaveBeenCalledWith("/chat", { message: "Hi" });
    expect(response).toEqual({ data: { reply: "Hello" } });
  });
});

describe("admin mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useCreateAdminMutation posts and invalidates admin list", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ ok: true });
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateAdminMutation(), {
      wrapper: createAppQueryWrapper(queryClient),
    });

    await result.current.mutateAsync({
      userName: "John",
      userEmail: "john@example.com",
      userPassword: "password123",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/admins", {
      userName: "John",
      userEmail: "john@example.com",
      userPassword: "password123",
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tableRoot("/admins"),
    });
  });

  it("useDeleteAdminMutation deletes and invalidates admin list", async () => {
    vi.mocked(apiClient.remove).mockResolvedValue({ ok: true });
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteAdminMutation(), {
      wrapper: createAppQueryWrapper(queryClient),
    });

    await result.current.mutateAsync(4);

    expect(apiClient.remove).toHaveBeenCalledWith("/admins/4");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tableRoot("/admins"),
    });
  });
});
