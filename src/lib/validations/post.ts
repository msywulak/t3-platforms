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
  title: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  imageBlurhash: z.string().optional(),
  published: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  userId: z.number().optional(),
  siteId: z.number(),
  clerkId: z.string(),
});

const siteSchema = z.object({
  subdomain: z.string().nullable(),
});

export const postEditorSchema = postSchema.extend({
  site: siteSchema.nullable(),
});
