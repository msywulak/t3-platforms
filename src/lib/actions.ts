/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/db";
import { posts, sites } from "@/db/schema";
import { env } from "@/env.mjs";
import { and, eq, or, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { clerkClient } from "@clerk/nextjs";
import {
  addDomainToVercel,
  getApexDomain,
  removeDomainFromVercelProject,
  removeDomainFromVercelTeam,
  validDomainRegex,
} from "./domains";
import { authAction, siteAuthAction } from "./safe-action";
import { z } from "zod";
import { updateSiteSchema } from "./validations/site";
import { postEditorSchema } from "./validations/post";
import { UTApi } from "uploadthing/server";
import { getBlurDataURL } from "./utils";

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
      const organization = await clerkClient.organizations.createOrganization({
        name: subdomain,
        createdBy: userId,
      });
      const response = await db.insert(sites).values({
        name,
        description,
        subdomain:
          env.NODE_ENV === "development" ? `${subdomain}-dev` : subdomain,
        clerkId: userId,
        clerkOrgId: organization.id,
      });
      revalidateTag(`${subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`);
      return response.insertId;
    } catch (error: any) {
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
        console.log("Updating custom domain");
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
              name: rawInput.name,
              description: rawInput.description,
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

const extendedSiteSchema = z.object({
  siteId: z.number(),
  logo: z
    .array(z.object({ id: z.string(), name: z.string(), url: z.string() }))
    .nullable()
    .optional(),
  image: z
    .array(z.object({ id: z.string(), name: z.string(), url: z.string() }))
    .nullable()
    .optional(),
});

type ExtendedSiteSchemaType = z.infer<typeof extendedSiteSchema>;

export const updateSiteImages = siteAuthAction(
  z.object({
    input: extendedSiteSchema,
  }),
  async ({ input }, { allSites }) => {
    // Find the site with the matching id
    const foundSite = allSites.find((s) => s.id === input.siteId);
    // Check if the site was found
    if (!foundSite) {
      throw new Error("Site not found");
    }
    try {
      const updateData: Partial<ExtendedSiteSchemaType> = {
        ...(input.logo !== undefined && { logo: input.logo }),
        ...(input.image !== undefined && { image: input.image }),
      };
      // Make sure updateData is not empty
      if (Object.keys(updateData).length === 0) {
        throw new Error("No update data provided");
      }
      const response = await db
        .update(sites)
        .set(updateData)
        .where(eq(sites.id, input.siteId));

      if (updateData.image !== undefined && updateData.image !== null) {
        const blurhash = updateData.image[0]?.url
          ? await getBlurDataURL(updateData.image[0].url)
          : null;
        await db
          .update(sites)
          .set({ imageBlurhash: blurhash })
          .where(eq(sites.id, input.siteId));
      }

      if (input.image !== undefined && foundSite.image !== null) {
        await deleteImagesFromUploadThing({
          imageIds: [foundSite.image[0]?.id ?? ""],
        });
      }
      if (input.logo !== undefined && foundSite.logo !== null) {
        await deleteImagesFromUploadThing({
          imageIds: [foundSite.logo[0]?.id ?? ""],
        });
      }

      revalidateTag(
        `${foundSite.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );

      if (foundSite.customDomain) {
        revalidateTag(`${foundSite.customDomain}-metadata`);
      }

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
      if (foundSite.image !== undefined && foundSite.image !== null) {
        await deleteImagesFromUploadThing({
          imageIds: [foundSite.image[0]?.id ?? ""],
        });
      }
      if (foundSite.logo !== undefined && foundSite.logo !== null) {
        await deleteImagesFromUploadThing({
          imageIds: [foundSite.logo[0]?.id ?? ""],
        });
      }
      await db.delete(posts).where(eq(posts.siteId, siteId));
      if (foundSite.clerkOrgId) {
        await clerkClient.organizations.deleteOrganization(
          foundSite.clerkOrgId,
        );
      }
      const response = await db
        .delete(sites)
        .where(and(eq(sites.id, siteId), eq(sites.clerkId, userId)));

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
    if (!post.id) {
      throw new Error("Post not found");
    }
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
          slug: post.slug,
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

const extendedPostSchema = z.object({
  postId: z.number(),
  image: z
    .array(z.object({ id: z.string(), name: z.string(), url: z.string() }))
    .nullable()
    .optional(),
});

type ExtendedPostSchemaType = z.infer<typeof extendedPostSchema>;

export const updatePostImage = authAction(
  z.object({
    input: extendedPostSchema,
  }),
  async ({ input }, { userId }) => {
    try {
      const post = await db.query.posts.findFirst({
        where: and(eq(posts.id, input.postId), eq(posts.clerkId, userId)),
        with: {
          site: true,
        },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      const updateData: Partial<ExtendedPostSchemaType> = {
        ...(input.image !== undefined && { image: input.image }),
      };

      // Make sure updateData is not empty
      if (Object.keys(updateData).length === 0) {
        throw new Error("No update data provided");
      }

      const response = await db
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, input.postId));

      if (post.image !== undefined && post.image !== null) {
        await deleteImagesFromUploadThing({
          imageIds: [post.image[0]?.id ?? ""],
        });
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
      throw new Error(error.message);
    }
  },
);

export const deletePost = authAction(
  z.object({ postId: z.number() }),
  async ({ postId }, { userId }) => {
    if (!postId) {
      throw new Error("Post not found");
    }
    const deletedPost = await db.query.posts.findFirst({
      where: and(eq(posts.id, postId), eq(posts.clerkId, userId)),
      with: {
        site: true,
      },
    });

    if (!deletedPost) {
      throw new Error("Post not found");
    }

    try {
      await db.delete(posts).where(eq(posts.id, postId));
      await deleteImagesFromUploadThing({
        imageIds: [deletedPost?.image?.[0]?.id ?? ""],
      });

      revalidateTag(
        `${deletedPost.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`,
      );
      revalidateTag(
        `${deletedPost.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-${deletedPost.slug}`,
      );

      // if the site has a custom domain, we need to revalidate those tags too
      deletedPost.site?.customDomain &&
        (revalidateTag(`${deletedPost.site?.customDomain}-posts`),
        revalidateTag(`${deletedPost.site?.customDomain}-${deletedPost.slug}`));

      return deletedPost;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
);

export const deleteImagesFromUploadThing = authAction(
  z.object({ imageIds: z.array(z.string()) }),
  async ({ imageIds }) => {
    const utapi = new UTApi();
    try {
      await utapi.deleteFiles(imageIds);
      return true;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
);
