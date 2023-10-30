/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { db } from "@/db";
import { type Site, posts, sites, users, Post } from "@/db/schema";
import { env } from "@/env.mjs";
import { currentUser } from "@clerk/nextjs";
import { and, eq, or, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { withPostAuth, withSiteAuth } from "./auth";
import {
  addDomainToVercel,
  getApexDomain,
  removeDomainFromVercelProject,
  removeDomainFromVercelTeam,
  validDomainRegex,
} from "./domains";
import { customAlphabet } from "nanoid";
import { getBlurDataURL } from "./utils";
import { type OurFileRouter } from "@/app/api/uploadthing/core";
import { generateReactHelpers } from "@uploadthing/react/hooks";

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7,
); // 7-character random string

export const getSiteFromPostId = async (postId: number) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });
  if (!post) {
    return null;
  }
  return post.siteId;
};

export const createSite = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) {
    return {
      error: "Not authenticated",
    };
  }
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const subdomain = formData.get("subdomain") as string;

  try {
    const response = await db.insert(sites).values({
      name,
      description,
      subdomain,
      clerkId: user.id,
    });
    revalidateTag(`${subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`);
    return response.insertId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code === "P2002") {
      return {
        error: `This subdomain is already taken`,
      };
    } else {
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        error: error.message,
      };
    }
  }
};

export const updateSite = withSiteAuth(
  async (formData: FormData, site: Site, key: string) => {
    const value = formData.get(key) as string;
    try {
      let response;

      if (key === "customDomain") {
        if (value.includes("vercel.pub")) {
          return {
            error: "Cannot use vercel.pub subdomain as your custom domain",
          };
        } else if (validDomainRegex.test(value)) {
          response = await db
            .update(sites)
            .set({
              customDomain: value,
            })
            .where(eq(sites.id, site.id));
          await Promise.all([addDomainToVercel(value)]);
        } else if (value === "") {
          response = await db
            .update(sites)
            .set({
              customDomain: null,
            })
            .where(eq(sites.id, site.id));
        }
      }
      if (site.customDomain && site.customDomain !== value) {
        response = await removeDomainFromVercelProject(site.customDomain);

        const apexDomain = getApexDomain(`https://${site.customDomain}`);
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
          await removeDomainFromVercelProject(site.customDomain);
        } else {
          // this is the only site using this apex domain
          // so we can remove it entirely from our Vercel team
          await removeDomainFromVercelTeam(site.customDomain);
        }
      } else if (key === "image" || key === "logo") {
        // const file = formData.get(key) as File;
        const files: File[] = [];
        formData.forEach((value, _key) => {
          if (value instanceof File) {
            files.push(value);
          }
        });
        // const filename = `${nanoid()}.${file.type.split("/")[1]}`;
        const { useUploadThing } = generateReactHelpers<OurFileRouter>();
        const upload = await useUploadThing("productImage").startUpload(files);
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

        const blurhash = key === "image" ? await getBlurDataURL(url!) : null;

        response = await db
          .update(sites)
          .set({
            [key]: url,
            imageBlurhash: blurhash,
          })
          .where(eq(sites.id, site.id));
      } else {
        response = await db
          .update(sites)
          .set({
            [key]: value,
          })
          .where(eq(sites.id, site.id));
      }
      console.log(
        "Updated site data! Revalidating tags:",
        `${site.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
        `${site.customDomain}-metadata`,
      );
      revalidateTag(
        `${site.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`,
      );
      site.customDomain && revalidateTag(`${site.customDomain}-metadata`);
      return response;
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
  },
);

export const deleteSite = withSiteAuth(async (_: FormData, site: Site) => {
  try {
    const response = await db.delete(sites).where(eq(sites.id, site.id));

    revalidateTag(`${site.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-metadata`);
    site.customDomain && revalidateTag(`${site.customDomain}-metadata`);
    return response;
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
});

export const createPost = withSiteAuth(
  async (_: FormData, site: Site): Promise<string | { error: string }> => {
    const user = await currentUser();
    if (!user) {
      return {
        error: "Not authenticated",
      };
    }
    const response = await db.insert(posts).values({
      siteId: site.id,
      clerkId: user.id,
    });

    revalidateTag(`${site.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}-posts`);
    site.customDomain && revalidateTag(`${site.customDomain}-posts`);

    return response.insertId;
  },
);

// creating a separate function for this because we're not using FormData
export const updatePost = async (data: Post) => {
  const user = await currentUser();
  if (!user) {
    return {
      error: "Not authenticated",
    };
  }
  const post = await db.query.posts.findFirst({
    where: and(eq(posts.id, data.id), eq(posts.clerkId, user.id)),
    with: {
      site: true,
    },
  });

  if (!post) {
    return {
      error: "Post not found",
    };
  }
  try {
    const response = await db
      .update(posts)
      .set({
        title: data.title,
        description: data.description,
        content: data.content,
      })
      .where(eq(posts.id, data.id));

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
    return {
      error: error.message,
    };
  }
};

export const updatePostMetadata = withPostAuth(
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
        const upload = await useUploadThing("productImage").startUpload(files);
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
