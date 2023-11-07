/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/db";
import { type Site, posts, sites, users, type Post } from "@/db/schema";
import { env } from "@/env.mjs";
import { currentUser } from "@clerk/nextjs";
import { and, eq, or, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { withPostAuth } from "./auth";
import {
  addDomainToVercel,
  getApexDomain,
  removeDomainFromVercelProject,
  removeDomainFromVercelTeam,
  validDomainRegex,
} from "./domains";
import { getBlurDataURL } from "./utils";
import { type OurFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import { authAction, siteAuthAction } from "./safe-action";
import { z } from "zod";
import { updateSiteSchema } from "./validations/site";
import { postEditorSchema } from "./validations/post";
import { type StoredFile } from "@/lib/types";

export const getSiteFromPostId = authAction(
  z.object({ postId: z.number() }),
  async (input, { userId }) => {
    const post = await db.query.posts.findFirst({
      where: and(eq(posts.id, input.postId), eq(posts.clerkId, userId)),
    });
    if (!post) {
      return null;
    }
    return post.siteId;
  },
);

export const createSite = authAction(
  z.object({
    name: z.string(),
    description: z.string(),
    subdomain: z.string(),
  }),
  async ({ name, description, subdomain }, { userId }) => {
    try {
      const exists = await db.query.sites.findFirst({
        where: eq(sites.subdomain, subdomain),
      });
      if (exists) {
        throw new Error("This subdomain is already in use");
      }
      const response = await db.insert(sites).values({
        name,
        description,
        subdomain,
        clerkId: userId,
      });
      revalidateTag(`${subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`);
      return response.insertId;
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log("This is the error!");
      throw new Error(error.message);
    }
  },
);

export const updateSite = siteAuthAction(
  z.object({
    rawInput: updateSiteSchema,
    key: z.enum(["general", "subdomain", "customDomain"]),
  }),
  async ({ rawInput, key }, { allSites }) => {
    // Find the site with the matching id
    const foundSite = allSites.find((s) => s.id === rawInput.id);

    // Check if the site was found
    if (!foundSite) {
      throw new Error("Site not found");
    }
    try {
      let response;

      if (key === "customDomain" || key === "subdomain") {
        if (rawInput.customDomain!.includes("vercel.pub")) {
          throw new Error(
            "Cannot use vercel.pub subdomain as your custom domain",
          );
        } else if (validDomainRegex.test(rawInput.customDomain!)) {
          response = await db
            .update(sites)
            .set({
              customDomain: rawInput.customDomain,
            })
            .where(eq(sites.id, rawInput.id!));
          await Promise.all([
            addDomainToVercel(rawInput.customDomain!),
            addDomainToVercel(`www.${rawInput.customDomain}`),
          ]);
        } else if (rawInput.customDomain === "") {
          response = await db
            .update(sites)
            .set({
              customDomain: null,
            })
            .where(eq(sites.id, rawInput.id!));
        }
      }
      if (
        foundSite.customDomain &&
        foundSite.customDomain !== rawInput.customDomain
      ) {
        response = await removeDomainFromVercelProject(foundSite.customDomain);

        const apexDomain = getApexDomain(`https://${foundSite.customDomain}`);
        const domainCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(sites)
          .where(
            or(
              eq(sites.customDomain, apexDomain),
              eq(sites.customDomain, `.${apexDomain}`),
            ),
          );

        // if the apex domain is being used by other sites
        // we should only remove it from our Vercel project
        if (domainCount === undefined || (domainCount[0]?.count ?? 0) >= 1) {
          await removeDomainFromVercelProject(foundSite.customDomain);
        } else {
          // this is the only site using this apex domain
          // so we can remove it entirely from our Vercel team
          await removeDomainFromVercelTeam(foundSite.customDomain);
        }
      }
      if (key === "general") {
        try {
          await db
            .update(sites)
            .set({
              ...rawInput,
              images: rawInput.images as StoredFile[] | null,
            })
            .where(eq(sites.id, rawInput.id!));
        } catch (error: any) {
          if (error.code === "P2002") {
            throw new Error(`This subdomain is already in use`);
          } else {
            throw new Error(error.message);
          }
        }
      }
      console.log(
        "Updated site data! Revalidating tags:",
        `${foundSite.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        `${foundSite.customDomain}-metadata`,
      );
      revalidateTag(
        `${foundSite.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      foundSite.customDomain &&
        revalidateTag(`${foundSite.customDomain}-metadata`);
      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This ${key} is already in use`,
        };
      } else {
        throw new Error(error.message);
      }
    }
  },
);

const extendedSiteSchema = updateSiteSchema.extend({
  siteId: z.number(),
  images: z
    .array(z.object({ id: z.string(), name: z.string(), url: z.string() }))
    .nullable(),
});

export const updateSiteImages = siteAuthAction(
  z.object({
    input: extendedSiteSchema,
  }),
  async ({ input }, { allSites }) => {
    console.log("updateSiteImages called with input:", input);

    // Find the site with the matching id
    const foundSite = allSites.find((s) => s.id === input.siteId);
    console.log("Found site:", foundSite);

    // Check if the site was found
    if (!foundSite) {
      console.error("Site not found for id:", input.siteId);
      throw new Error("Site not found");
    }

    try {
      console.log("Updating images for site ID:", input.siteId);
      const response = await db
        .update(sites)
        .set({
          images: input.images,
        })
        .where(eq(sites.id, input.siteId));

      console.log("Revalidating metadata for subdomain:", foundSite.subdomain);
      revalidateTag(
        `${foundSite.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );

      if (foundSite.customDomain) {
        console.log(
          "Revalidating metadata for custom domain:",
          foundSite.customDomain,
        );
        revalidateTag(`${foundSite.customDomain}-metadata`);
      }

      console.log("Update response:", response);
      return response;
    } catch (error: any) {
      console.error("Error updating site images:", error.message);
      throw new Error(error.message);
    }
  },
);

export const deleteSite = siteAuthAction(
  z.object({
    siteId: z.number(),
  }),
  async ({ siteId }, { userId, allSites }) => {
    // Find the site with the matching id
    const foundSite = allSites.find((s) => s.id === siteId);

    // Check if the site was found
    if (!foundSite) {
      throw new Error("Site not found");
    }
    try {
      const response = await db
        .delete(sites)
        .where(and(eq(sites.id, siteId), eq(sites.clerkId, userId)));

      await db.delete(posts).where(eq(posts.siteId, siteId));

      revalidateTag(
        `${foundSite.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      foundSite.customDomain &&
        revalidateTag(`${foundSite.customDomain}-metadata`);
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
);

export const createPost = siteAuthAction(
  z.object({ siteId: z.number() }),
  async ({ siteId }, { userId, allSites }) => {
    // Find the site with the matching id
    const foundSite = allSites.find((s) => s.id === siteId);

    // Check if the site was found
    if (!foundSite) {
      throw new Error("Site not found");
    }
    try {
      const response = await db.insert(posts).values({
        siteId: siteId,
        clerkId: userId,
      });
      revalidateTag(
        `${foundSite.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
      );
      foundSite.customDomain &&
        revalidateTag(`${foundSite.customDomain}-posts`);
      return response.insertId;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
);

export const updatePost = authAction(
  z.object({ post: postEditorSchema }),
  async ({ post }, { userId }) => {
    const updatedPost = await db.query.posts.findFirst({
      where: and(eq(posts.id, post.id), eq(posts.clerkId, userId)),
      with: {
        site: true,
      },
    });

    if (!updatedPost) {
      throw new Error("Post not found");
    }
    try {
      const response = await db
        .update(posts)
        .set({
          title: post.title,
          description: post.description,
          content: post.content,
        })
        .where(eq(posts.id, post.id));

      revalidateTag(
        `${updatedPost.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
      );
      revalidateTag(
        `${updatedPost.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-${updatedPost.slug}`,
      );

      // if the site has a custom domain, we need to revalidate those tags too
      updatedPost.site?.customDomain &&
        (revalidateTag(`${updatedPost.site?.customDomain}-posts`),
        revalidateTag(`${updatedPost.site?.customDomain}-${updatedPost.slug}`));

      return response;
    } catch (error: any) {
      return new Error(error.message);
    }
  },
);

export const updatePostMetadata = authAction(
  z.object({
    formData: z.instanceof(FormData),
    siteId: z.number(),
    postId: z.number(),
    key: z.string(),
  }),
  async (input, { userId }) => {
    const value = input.formData.get(input.key) as string;
    try {
      const post = await db.query.posts.findFirst({
        where: and(
          eq(posts.id, input.postId),
          eq(posts.siteId, input.siteId),
          eq(posts.clerkId, userId),
        ),
        with: {
          site: true,
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      const response = await db
        .update(posts)
        .set({
          [input.key]: input.key === "published" ? value === "true" : value,
        })
        .where(eq(posts.id, post.id));

      revalidateTag(
        `${post.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
      );
      revalidateTag(
        `${post.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
      );

      // if the site has a custom domain, we need to revalidate those tags too
      post.site?.customDomain &&
        (revalidateTag(`${post.site?.customDomain}-posts`),
        revalidateTag(`${post.site?.customDomain}-${post.slug}`));

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
);

export const updatePostMetadataA = withPostAuth(
  async (
    formData: FormData,
    post: Post & {
      site: Site;
    },
    key: string,
  ) => {
    const value = formData.get(key) as string;

    try {
      let response;
      if (key === "image") {
        // const file = formData.get(key) as File;
        const files: File[] = [];
        formData.forEach((value, _key) => {
          if (value instanceof File) {
            files.push(value);
          }
        });
        // const filename = `${nanoid()}.${file.type.split("/")[1]}`;
        const { useUploadThing } = generateReactHelpers<OurFileRouter>();
        const upload =
          await useUploadThing("thumbnailAndLogo").startUpload(files);
        const formattedImages = upload?.map((image) => ({
          id: image.key,
          name: image.key.split("_")[1] ?? image.key,
          url: image.url,
        }));
        if (!formattedImages) {
          return {
            error: "Something went wrong with the upload",
          };
        }
        const url = formattedImages?.[0]?.url;

        const blurhash = await getBlurDataURL(url ?? "");

        response = await db
          .update(posts)
          .set({
            image: url,
            imageBlurhash: blurhash,
          })
          .where(eq(posts.id, post.id));
      } else {
        response = await db
          .update(posts)
          .set({
            [key]: key === "published" ? value === "true" : value,
          })
          .where(eq(posts.id, post.id));
      }

      revalidateTag(
        `${post.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
      );
      revalidateTag(
        `${post.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-${post.slug}`,
      );

      // if the site has a custom domain, we need to revalidate those tags too
      post.site?.customDomain &&
        (revalidateTag(`${post.site?.customDomain}-posts`),
        revalidateTag(`${post.site?.customDomain}-${post.slug}`));

      return response;
    } catch (error: any) {
      if (error.code === "P2002") {
        return {
          error: `This slug is already in use`,
        };
      } else {
        return {
          error: error.message,
        };
      }
    }
  },
);

//TODO: move this to next-safe-action
export const deletePost = withPostAuth(async (_: FormData, post: Post) => {
  try {
    const deletedPost = await db
      .select()
      .from(posts)
      .where(eq(posts.id, post.id));
    await db.delete(posts).where(eq(posts.id, post.id));

    return deletedPost;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
});

//TODO: move this to next-safe-action
export const editUser = async (
  formData: FormData,
  _id: unknown,
  key: string,
) => {
  const user = await currentUser();
  if (!user) {
    return {
      error: "Not authenticated",
    };
  }
  const value = formData.get(key) as string;

  try {
    const response = await db
      .update(users)
      .set({
        [key]: value,
      })
      .where(eq(users.clerkId, user.id));
    return response.insertId;
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        error: `This ${key} is already in use`,
      };
    } else {
      return {
        error: error.message,
      };
    }
  }
};
