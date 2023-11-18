import * as z from "zod";
// import { siteSchema } from "./site";

export const postSchema = z.object({
  id: z.number(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  slug: z.string().nullable(),
  image: z.string().nullable(),
  imageBlurhash: z.string().nullable(),
  published: z.boolean().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  userId: z.number().nullable(),
  siteId: z.number().nullable(),
  clerkId: z.string().nullable(),
});

export const updatePostSchema = z.object({
  id: z.number(),
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
  image: z.string().optional().nullable(),
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
