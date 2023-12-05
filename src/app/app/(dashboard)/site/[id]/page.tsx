import * as React from "react";
import { type Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { currentUser } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import { and, asc, desc, eq, gte, like, lte, sql } from "drizzle-orm";

import Link from "next/link";
import { sites, type Post } from "@/db/schema";
import CreatePostButton from "@/components/create-post-button";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { env } from "@/env.mjs";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { PostsShell } from "@/components/shells/posts-shell";
import { sitesSearchParamsSchema } from "@/lib/validations/params";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Posts",
  description: "Manage your posts",
};

interface PostsPageProps {
  params: { id: number };
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function SitePosts({
  params,
  searchParams,
}: PostsPageProps) {
  const siteId = Number(params.id);
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { page, per_page, sort, name, from, to } =
    sitesSearchParamsSchema.parse(sitesSearchParamsSchema.parse(searchParams));

  // Fallback page for invalid page numbers
  const pageAsNumber = Number(page);
  const fallbackPage =
    isNaN(pageAsNumber) || pageAsNumber < 1 ? 1 : pageAsNumber;
  // Number of items per page
  const perPageAsNumber = Number(per_page);
  const limit = isNaN(perPageAsNumber) ? 10 : perPageAsNumber;
  // Number of items to skip
  const offset = fallbackPage > 0 ? (fallbackPage - 1) * limit : 0;
  // Column and order to sort by
  const [column, order] = (sort?.split(".") as [
    keyof Post | undefined,
    "asc" | "desc" | undefined,
  ]) ?? ["createdAt", "desc"];

  const fromDay = from ? new Date(from) : undefined;
  const toDay = to ? new Date(to) : undefined;

  // const site = await db.query.sites.findFirst({
  //   where: eq(posts.id, siteId),
  // });

  // if (!site) {
  //   notFound();
  // }

  // Transaction is used to ensure both queries are executed in a single transaction
  noStore();

  const transaction = db.transaction(async (tx) => {
    const items = await tx
      .select()
      .from(posts)
      .limit(limit)
      .offset(offset)
      .where(
        and(
          eq(posts.siteId, siteId),
          name ? like(posts.title, `%${name}%`) : undefined,
          fromDay && toDay
            ? and(gte(posts.createdAt, fromDay), lte(posts.createdAt, toDay))
            : undefined,
        ),
      )
      .orderBy(
        column && column in posts
          ? order === "asc"
            ? asc(posts[column])
            : desc(posts[column])
          : desc(posts.createdAt),
      );
    const count = await tx
      .select({ count: sql<number>`count(${posts.id})` })
      .from(posts)
      .where(
        and(
          eq(posts.siteId, siteId),
          name ? like(posts.title, `%${name}%`) : undefined,
          fromDay && toDay
            ? and(gte(posts.createdAt, fromDay), lte(posts.createdAt, toDay))
            : undefined,
        ),
      )
      .then((res) => res[0]?.count ?? 0);
    const site = await tx.select().from(sites).where(eq(sites.id, siteId));
    if (!site[0]) {
      notFound();
    }

    const url = `${site[0].subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`;

    return { items, count, site: site[0], url };
  });

  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="font-cal w-60 truncate text-xl font-bold sm:w-auto sm:text-3xl">
            All Posts for {(await transaction).site.name}
          </h1>
          <Link
            href={
              process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${(await transaction).url}`
                : `http://${(await transaction).site.subdomain}.localhost:3000`
            }
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "secondary" }),
              "flex h-7 w-auto items-center justify-center space-x-2 rounded-lg text-sm transition-all focus:outline-none",
            )}
          >
            {(await transaction).url}
            <Icons.link1 width={18} className="ml-1" />
          </Link>
        </div>
        <CreatePostButton />
      </div>
      <PostsShell transaction={transaction} limit={limit} />
    </>
  );
}
