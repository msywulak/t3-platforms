import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { posts, sites } from "@/db/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSiteAuth(action: any) {
  return async (
    formData: FormData | null,
    siteId: string,
    key: string | null,
  ) => {
    const user = await currentUser();
    if (!user) {
      return {
        error: "Not authenticated",
      };
    }
    const site = await db.query.sites.findFirst({
      where: and(eq(sites.id, Number(siteId)), eq(sites.clerkId, user.id)),
    });
    if (!site) {
      return {
        error: "Not authorized",
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return action(formData, site, key);
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withPostAuth(action: any) {
  return async (
    formData: FormData | null,
    postId: number,
    key: string | null,
  ) => {
    const user = await currentUser();
    if (!user) {
      return {
        error: "Not authenticated",
      };
    }
    const post = await db.query.posts.findFirst({
      where: and(eq(posts.id, postId), eq(posts.clerkId, user.id)),
      with: {
        site: true,
      },
    });

    if (!post) {
      return {
        error: "Post not found",
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return action(formData, post, key);
  };
}
