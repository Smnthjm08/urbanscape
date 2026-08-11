import { z } from "zod";

const typeEnum = z.enum(["buy", "rent"], {
  error: "Type must be 'buy' or 'rent'",
});

const propertyEnum = z.enum(["apartment", "house", "condo", "land"], {
  error: "Property must be 'apartment', 'house', 'condo', or 'land'",
});

const statusEnum = z.enum(["active", "pending", "sold", "rented", "archived"], {
  error: "Status must be 'active', 'pending', 'sold', 'rented', or 'archived'",
});

// --- Schema for the nested PostDetail ---
const postDetailSchema = z.object({
  desc: z.string({ error: "Description is required" }).min(1),
  utilities: z.string().optional().nullable(),
  pet: z.string().optional().nullable(),
  income: z.string().optional().nullable(),
  size: z.number().int().positive().optional().nullable(),
  school: z.number().int().nonnegative().optional().nullable(),
  bus: z.number().int().nonnegative().optional().nullable(),
  restaurant: z.number().int().nonnegative().optional().nullable(),
});

// --- Schema for creating a post ---
export const createPostSchema = z.object({
  postData: z.object({
    title: z
      .string({ error: "Title is required" })
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be at most 200 characters"),
    price: z
      .number({ error: "Price is required" })
      .int("Price must be a whole number")
      .positive("Price must be positive"),
    images: z.array(z.url("Each image must be a valid URL")).default([]),
    address: z.string({ error: "Address is required" }).trim().min(1),
    city: z.string({ error: "City is required" }).trim().min(1),
    bedroom: z
      .number({ error: "Bedroom count is required" })
      .int()
      .nonnegative("Bedroom count cannot be negative"),
    bathroom: z
      .number({ error: "Bathroom count is required" })
      .int()
      .nonnegative("Bathroom count cannot be negative"),
    latitude: z.string({ error: "Latitude is required" }),
    longitude: z.string({ error: "Longitude is required" }),
    type: typeEnum,
    property: propertyEnum,
    isFeatured: z.boolean().default(false),
  }),
  postDetail: postDetailSchema,
});

// --- Schema for updating a post (all fields optional) ---
export const updatePostSchema = z.object({
  postData: z
    .object({
      title: z.string().trim().min(3).max(200).optional(),
      price: z.number().int().positive().optional(),
      images: z.array(z.url()).optional(),
      address: z.string().trim().min(1).optional(),
      city: z.string().trim().min(1).optional(),
      bedroom: z.number().int().nonnegative().optional(),
      bathroom: z.number().int().nonnegative().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      type: typeEnum.optional(),
      property: propertyEnum.optional(),
      status: statusEnum.optional(),
      isFeatured: z.boolean().optional(),
    })
    .optional(),
  postDetail: postDetailSchema.partial().optional(),
});

// --- Schema for query params when listing posts ---
export const getPostsQuerySchema = z.object({
  city: z.string().trim().optional(),
  type: typeEnum.optional(),
  property: propertyEnum.optional(),
  bedroom: z.coerce.number().int().nonnegative().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
  sortBy: z.enum(["price", "createdAt", "bedroom"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
