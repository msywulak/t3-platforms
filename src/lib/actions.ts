"use server";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getSiteFromPostId = async (postId: number) => {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });
  if (!post) {
    return null;
  }
  return post.siteId;
  //   const post = await db
  //     .selectDistinct({ id: posts.id })
  //     .from(posts)
  //     .where(eq(posts.id, postId));
  //   if (!post[0]) {
  //     return null;
  //   }
  //   return post[0].id;
};
