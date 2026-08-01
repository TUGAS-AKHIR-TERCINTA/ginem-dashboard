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
import { authService } from "./authService";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("login posts credentials to auth endpoint", async () => {
    const payload = {
      userEmail: "admin@example.com",
      userPassword: "secret",
    };
    vi.mocked(apiClient.post).mockResolvedValue({
      data: { accessToken: "jwt-token" },
    });

    const result = await authService.login(payload);

    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", payload);
    expect(result).toEqual({ data: { accessToken: "jwt-token" } });
  });

  it("register posts user data to register endpoint", async () => {
    const payload = {
      userName: "Admin",
      userEmail: "admin@example.com",
      userPassword: "secret",
    };
    vi.mocked(apiClient.post).mockResolvedValue({ ok: true });

    await authService.register(payload);

    expect(apiClient.post).toHaveBeenCalledWith(
      "/auth/register/users",
      payload,
    );
  });
});
