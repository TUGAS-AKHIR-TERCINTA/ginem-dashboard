import { describe, expect, it } from "vitest";
import { CONFIGS } from "@/config/env";
import { apiClient, getAuthHeaders } from "./api";

describe("api", () => {
  it("getAuthHeaders returns bearer token from localStorage", () => {
    localStorage.setItem(CONFIGS.localStorageKey, "test-token");

    expect(getAuthHeaders()).toEqual({
      Authorization: "Bearer test-token",
    });
  });

  it("getAuthHeaders returns empty bearer token when storage is empty", () => {
    localStorage.removeItem(CONFIGS.localStorageKey);

    expect(getAuthHeaders()).toEqual({
      Authorization: "Bearer ",
    });
  });
});

describe("apiClient", () => {
  it("exposes HTTP helper methods", () => {
    expect(typeof apiClient.get).toBe("function");
    expect(typeof apiClient.post).toBe("function");
    expect(typeof apiClient.patch).toBe("function");
    expect(typeof apiClient.remove).toBe("function");
    expect(typeof apiClient.getTableData).toBe("function");
  });
});
