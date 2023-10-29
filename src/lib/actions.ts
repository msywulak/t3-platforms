/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { db } from "@/db";
import { Site, posts, sites, users } from "@/db/schema";
import { env } from "@/env.mjs";
import { currentUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { withSiteAuth } from "./auth";

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
