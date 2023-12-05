import * as React from "react";
import { Suspense } from "react";
import { type Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, gte, like, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import PlaceholderCard from "@/components/placeholder-card";
import { CreateSiteButton } from "@/components/create-site-button";
import { type Site, sites } from "@/db/schema";
import { sitesSearchParamsSchema } from "@/lib/validations/params";
import { env } from "@/env.mjs";
import { SitesShell } from "@/components/shells/sites-shell";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Sites",
  description: "Manage your sites",
};

interface SitesPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

export default async function SitesPage({ searchParams }: SitesPageProps) {
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
    keyof Site | undefined,
    "asc" | "desc" | undefined,
  ]) ?? ["createdAt", "desc"];

  const fromDay = from ? new Date(from) : undefined;
  const toDay = to ? new Date(to) : undefined;

  // Transaction is used to ensure both queries are executed in a single transaction
  noStore();

  const transaction = db.transaction(async (tx) => {
    const items = await tx
      .select()
      .from(sites)
      .limit(limit)
      .offset(offset)
      .where(
        and(
          eq(sites.clerkId, user.id),
          name ? like(sites.name, `%${name}%`) : undefined,
          fromDay && toDay
            ? and(gte(sites.createdAt, fromDay), lte(sites.createdAt, toDay))
            : undefined,
        ),
      )
      .orderBy(
        column && column in sites
          ? order === "asc"
            ? asc(sites[column])
            : desc(sites[column])
          : desc(sites.createdAt),
      );
    const count = await tx
      .select({
        count: sql<number>`count(${sites.id})`,
      })
      .from(sites)
      .where(
        and(
          eq(sites.clerkId, user.id),
          name ? like(sites.name, `%${name}%`) : undefined,
          fromDay && toDay
            ? and(gte(sites.createdAt, fromDay), lte(sites.createdAt, toDay))
            : undefined,
        ),
      )
      .then((res) => res[0]?.count ?? 0);
    return { items, count };
  });

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Sites</h1>
          <CreateSiteButton />
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <SitesShell transaction={transaction} limit={limit} />
        </Suspense>
      </div>
    </div>
  );
}
