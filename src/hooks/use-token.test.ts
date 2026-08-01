import { describe, expect, it, beforeEach } from "vitest";
import { CONFIGS } from "@/config/env";
import { useToken } from "./use-token";

describe("useToken", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves token from localStorage", () => {
    const { setToken, getToken } = useToken();

    setToken("my-jwt-token");

    expect(getToken()).toBe("my-jwt-token");
    expect(localStorage.getItem(CONFIGS.localStorageKey)).toBe("my-jwt-token");
  });

  it("returns null when token is not set", () => {
    const { getToken } = useToken();

    expect(getToken()).toBeNull();
  });

  it("removes token from localStorage", () => {
    const { setToken, removeToken, getToken } = useToken();

    setToken("my-jwt-token");
    removeToken();

    expect(getToken()).toBeNull();
    expect(localStorage.getItem(CONFIGS.localStorageKey)).toBeNull();
  });
});
