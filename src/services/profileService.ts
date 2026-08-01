import type { IUser } from "@/types/User";
import { apiClient } from "./api";

export const PROFILE_API = {
  myProfile: "/my-profiles",
} as const;

export const profileService = {
  getMyProfile: () => apiClient.get<IUser>(PROFILE_API.myProfile),
};
