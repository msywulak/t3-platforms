import { redirect } from "next/navigation";
import PostCard from "./post-card";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export default async function Posts({
  siteId,
  limit,
}: {
  siteId?: number;
  limit?: number;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const allPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.clerkId, user.id),
      siteId ? eq(posts.siteId, siteId) : undefined,
    ),
    with: { site: true },
    orderBy: [desc(posts.createdAt)],
    limit,
  });

  return allPosts.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {allPosts.map((post) => (
        <PostCard key={post.id} data={post} />
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Posts Yet</h1>
      <Image
        alt="missing post"
        src="https://illustrations.popsy.co/gray/graphic-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any posts yet. Create one to get started.
      </p>
    </div>
  );
}
