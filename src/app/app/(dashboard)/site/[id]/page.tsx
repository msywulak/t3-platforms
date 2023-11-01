import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import Posts from "@/components/posts";
import CreatePostButton from "@/components/create-post-button";
import { cn } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { env } from "@/env.mjs";
import { buttonVariants } from "@/components/ui/button";

export default async function SitePosts({
  params,
}: {
  params: { id: number };
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }
  const data = await db.query.sites.findFirst({
    where: and(eq(sites.id, params.id), eq(sites.clerkId, user.id)),
  });

  if (!data) {
    notFound();
  }

  const url = `${data.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <>
      <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
          <h1 className="font-cal w-60 truncate text-xl font-bold sm:w-auto sm:text-3xl">
            All Posts for {data.name}
          </h1>
          <Link
            href={
              process.env.NEXT_PUBLIC_VERCEL_ENV
                ? `https://${url}`
                : `http://${data.subdomain}.localhost:3000`
            }
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            {url} ↗
          </Link>
        </div>
        <CreatePostButton />
      </div>
      <Posts siteId={params.id} />
    </>
  );
}
