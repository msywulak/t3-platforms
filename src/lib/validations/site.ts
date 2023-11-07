import * as z from "zod";

export const siteSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  font: z.string().default("font-sans"),
  logo: z
    .unknown()
    .refine((val) => {
      if (!Array.isArray(val)) return false;
      if (val.some((file) => !(file instanceof File))) return false;
      return true;
    }, "Must be an array of File")
    .nullable()
    .optional()
    .default(null),
  image: z
    .unknown()
    .refine((val) => {
      if (!Array.isArray(val)) return false;
      if (val.some((file) => !(file instanceof File))) return false;
      return true;
    }, "Must be an array of File")
    .nullable()
    .optional()
    .default(null),
  imageBlurhash: z
    .string()
    .default(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAhCAYAAACbffiEAAAACXBIWXMAABYlAAAWJQFJUiTwAAABfUlEQVR4nN3XyZLDIAwE0Pz/v3q3r55JDlSBplsIEI49h76k4opexCK/juP4eXjOT149f2Tf9ySPgcjCc7kdpBTgDPKByKK2bTPFEdMO0RDrusJ0wLRBGCIuelmWJAjkgPGDSIQEMBDCfA2CEPM80+Qwl0JkNxBimiaYGOTUlXYI60YoehzHJDEm7kxjV3whOQTD3AaCuhGKHoYhyb+CBMwjIAFz647kTqyapdV4enGINuDJMSScPmijSwjCaHeLcT77C7EC0C1ugaCTi2HYfAZANgj6Z9A8xY5eiYghDMNQBJNCWhASot0jGsSCUiHWZcSGQjaWWCDaGMOWnsCcn2QhVkRuxqqNxMSdUSElCDbp1hbNOsa6Ugxh7xXauF4DyM1m5BLtCylBXgaxvPXVwEoOBjeIFVODtW74oj1yBQah3E8tyz3SkpolKS9Geo9YMD1QJR1Go4oJkgO1pgbNZq0AOUPChyjvh7vlXaQa+X1UXwKxgHokB2XPxbX+AnijwIU4ahazAAAAAElFTkSuQmCC",
    ),
  subdomain: z.string(),
  customDomain: z.string().optional(),
  message404: z
    .string()
    .default("Blimey! You have found a page that does not exist."),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  userId: z.number().optional(),
  clerkId: z.string().optional(),
});

export const createSiteSchema = z.object({
  name: z.string(),
  description: z.string(),
  subdomain: z.string(),
});

export const updateSiteSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  font: z.string().optional(),
  logo: z
    .unknown()
    .refine((val) => {
      if (!Array.isArray(val)) return false;
      if (val.some((file) => !(file instanceof File))) return false;
      return true;
    }, "Must be an array of File")
    .nullable()
    .optional()
    .default(null),
  image: z
    .unknown()
    .refine((val) => {
      if (!Array.isArray(val)) return false;
      if (val.some((file) => !(file instanceof File))) return false;
      return true;
    }, "Must be an array of File")
    .nullable()
    .optional()
    .default(null),
  imageBlurhash: z.string().optional(),
  subdomain: z.string().optional(),
  customDomain: z.string().optional(),
  message404: z.string().optional(),
  updatedAt: z.date().optional(),
  userId: z.number().optional(),
  clerkId: z.string().optional(),
});
