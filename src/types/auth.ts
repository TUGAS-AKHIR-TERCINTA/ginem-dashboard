export interface ICredential {
  accessToken: string;
  refreshToken?: string;
  companyId: number;
  onBoardingStatus?: "waiting" | "completed";
}

export interface ICredentialWithDecodedUser extends ICredential {
  user: {
    userId: number;
    userRole: "user" | "admin" | "superAdmin" | string;
  };
}

export interface ILogin {
  userPassword: string;
  userWhatsappNumber: string;
}

export interface IRegister {
  user: {
    userName: string;
    userPassword: string;
    userWhatsappNumber: string;
    userRole: "admin" | "superAdmin" | "user";
  };
  company: {
    companyName: string;
    companyIndustry: string;
  };
}
