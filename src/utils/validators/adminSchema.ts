import { z } from "zod";

export const adminCreateSchema = z.object({
  userName: z.string().min(1, "Nama admin wajib diisi"),
  userEmail: z
    .string()
    .min(1, "Email admin wajib diisi")
    .email("Format email tidak valid"),
  userPassword: z.string().min(6, "Password minimal 6 karakter"),
});

export type AdminCreateValues = z.infer<typeof adminCreateSchema>;
