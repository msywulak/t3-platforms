import * as z from "zod";
// import { siteSchema } from "./site";

export const postSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  slug: z.string().optional(),
  image: z.string().optional(),
  imageBlurhash: z.string().optional(),
  published: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  userId: z.number().optional(),
  siteId: z.number().optional(),
  clerkId: z.string().optional(),
});

export const updatePostSchema = z.object({
  id: z.number().optional(),
  title: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  slug: z
    .string()
    .regex(
      /^[a-z0-9 ]+(?:-[a-z0-9 ]+)*$/,
      "Slug can only contain letters, numbers, hyphens, and spaces.",
    )
    .optional()
    .nullable(),
  image: z
    .unknown()
    .refine((val) => {
      if (!Array.isArray(val)) return false;
      if (val.some((file) => !(file instanceof File))) return false;
      return true;
    }, "Must be an array of File")
    .optional()
    .default(null)
    .nullable(),
  imageBlurhash: z.string().optional().nullable(),
  published: z.boolean().optional().nullable(),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
  userId: z.number().optional().nullable(),
  siteId: z.number().optional().nullable(),
  clerkId: z.string().optional().nullable(),
});

const siteSchema = z.object({
  subdomain: z.string().nullable(),
});

export const postEditorSchema = updatePostSchema.extend({
  site: siteSchema.nullable(),
});
