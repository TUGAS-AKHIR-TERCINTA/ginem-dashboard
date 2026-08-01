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
import { useLoginMutation, useRegisterMutation } from "./useAuth";

describe("useAuth hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("useLoginMutation posts login credentials", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "jwt-token" },
    });

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createAppQueryWrapper(),
    });

    const payload = {
      userEmail: "admin@example.com",
      userPassword: "secret",
    };

    const response = await result.current.mutateAsync(payload);

    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", payload);
    expect(response).toEqual({ data: { accessToken: "jwt-token" } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("useRegisterMutation posts registration data", async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createAppQueryWrapper(),
    });

    const payload = {
      userName: "Admin",
      userEmail: "admin@example.com",
      userPassword: "secret",
    };

    await result.current.mutateAsync(payload);

    expect(apiClient.post).toHaveBeenCalledWith(
      "/auth/register/users",
      payload,
    );
  });
});
