import { useApiGet } from "@/hooks/api";
import { PROFILE_API } from "@/services/profileService";
import type { IUser } from "@/types/User";

export function useMyProfileQuery() {
  return useApiGet<IUser>(PROFILE_API.myProfile);
}
