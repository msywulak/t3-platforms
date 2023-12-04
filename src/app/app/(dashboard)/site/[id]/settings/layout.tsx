import { type ReactNode } from "react";
import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { notFound, redirect } from "next/navigation";
import SiteSettingsNav from "./nav";
import { and, eq } from "drizzle-orm";
import { sites } from "@/db/schema";
import { env } from "@/env.mjs";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";

export default async function SiteAnalyticsLayout({
  params,
  children,
}: {
  params: { id: string };
  children: ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }
  const data = await db.query.sites.findFirst({
    where: and(eq(sites.id, Number(params.id)), eq(sites.clerkId, user.id)),
  });

  if (!data) {
    notFound();
  }

  const url = `${data.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`;

  return (
    <>
      <div className="flex flex-col items-center space-x-4 space-y-2 sm:flex-row sm:space-y-0">
        <h1 className="text-xl font-bold sm:text-3xl">
          Settings for {data.name}
        </h1>
        <Link
          href={
            process.env.NEXT_PUBLIC_VERCEL_ENV
              ? `https://${url}`
              : `http://${data.subdomain}.localhost:3000`
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
      <SiteSettingsNav />
      {children}
    </>
  );
}
