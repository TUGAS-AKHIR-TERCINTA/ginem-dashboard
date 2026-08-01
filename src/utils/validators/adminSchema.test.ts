import { describe, expect, it } from "vitest";
import { adminCreateSchema } from "./adminSchema";

describe("adminCreateSchema", () => {
  it("accepts valid admin payload", () => {
    const result = adminCreateSchema.safeParse({
      userName: "Admin User",
      userEmail: "admin@example.com",
      userPassword: "secret12",
    });

    expect(result.success).toBe(true);
  });

  it("rejects empty name and invalid email", () => {
    const result = adminCreateSchema.safeParse({
      userName: "",
      userEmail: "not-an-email",
      userPassword: "secret12",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      expect(messages).toContain("Nama admin wajib diisi");
      expect(messages).toContain("Format email tidak valid");
    }
  });

  it("rejects password shorter than 6 characters", () => {
    const result = adminCreateSchema.safeParse({
      userName: "Admin",
      userEmail: "admin@example.com",
      userPassword: "12345",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Password minimal 6 karakter",
      );
    }
  });
});
