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
import { PROFILE_API, profileService } from "./profileService";

describe("profileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMyProfile fetches current user profile", async () => {
    const profile = { userId: 1, userName: "Admin", userEmail: "a@b.com" };
    vi.mocked(apiClient.get).mockResolvedValue(profile);

    const result = await profileService.getMyProfile();

    expect(apiClient.get).toHaveBeenCalledWith(PROFILE_API.myProfile);
    expect(result).toEqual(profile);
  });
});
