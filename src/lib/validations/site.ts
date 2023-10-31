import * as z from "zod";

export const SiteSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  logo: z.string(),
  font: z.string(),
  image: z.string(),
  imageBlurhash: z.string(),
  subdomain: z.string(),
  customDomain: z.string().optional(),
  message404: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  userId: z.number().optional(),
  clerkId: z.string().optional(),
});
