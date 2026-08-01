import { IRoot } from "./Root";

export interface IUser extends IRoot {
  userId: number;
  userName: string;
  userPassword: string;
  userEmail: string;
  userRole: "admin" | "superAdmin" | "user";
  userOnboardingStatus?: "waiting" | "completed";
}
