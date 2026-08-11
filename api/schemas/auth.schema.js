import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters"),
  // trim first, then validate — z.email() would reject the untrimmed input
  email: z
    .string({ error: "Email is required" })
    .trim()
    .pipe(z.email("Invalid email address")),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
});

export const loginSchema = z.object({
  username: z
    .string({ error: "Username is required" })
    .trim()
    .min(1, "Username is required"),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});
