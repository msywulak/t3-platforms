import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Posts from "@/components/posts";
import CreatePostButton from "@/components/create-post-button";
import { cn } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { env } from "@/env.mjs";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export default async function SitePosts({
  params,
}: {
  params: { id: number };
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }

  const allPosts = await db.query.posts.findMany({
    where: and(eq(posts.clerkId, user.id), eq(posts.siteId, params.id)),
    with: { site: true },
    orderBy: [desc(posts.createdAt)],
  });

  if (!allPosts[0]) {
    notFound();
  }
  const site = allPosts[0].site;
  if (!site) {
    notFound();
  }

  const url = `${site.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="font-cal w-60 truncate text-xl font-bold sm:w-auto sm:text-3xl">
            All Posts for {site.name}
          </h1>
          <Link
            href={
              process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${url}`
                : `http://${site.subdomain}.localhost:3000`
            }
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "flex h-7 w-auto items-center justify-center space-x-2 rounded-lg text-sm transition-all focus:outline-none",
            )}
          >
            {url}
            <Icons.link1 width={18} className="ml-1" />
          </Link>
        </div>
        <CreatePostButton />
      </div>
      <Posts posts={allPosts} />
    </>
  );
}
