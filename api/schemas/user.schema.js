import { z } from "zod";

export const updateUserSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .optional(),
  email: z
    .string()
    .trim()
    .pipe(z.email("Invalid email address"))
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .optional(),
  avatar: z.url("Avatar must be a valid URL").optional().nullable(),
});

export const savePostSchema = z.object({
  postId: z
    .string({ error: "postId is required" })
    .pipe(z.uuid("Invalid post ID")),
});
