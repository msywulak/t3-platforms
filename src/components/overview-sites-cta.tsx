import { db } from "@/db";
import { CreateSiteButton } from "./create-site-button";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { sites } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function OverviewSitesCTA() {
  const user = await currentUser();
  if (!user) {
    return 0;
  }
  const allSites = await db
    .select({ count: sql<number>`count(*)` })
    .from(sites)
    .where(eq(sites.clerkId, user.id));

  return allSites === undefined ?? (allSites[0]?.count ?? 0) <= 0 ? (
    <CreateSiteButton />
  ) : (
    <Link
      href="/sites"
      className="rounded-lg border border-black bg-black px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white hover:text-black active:bg-stone-100 dark:border-stone-700 dark:hover:border-stone-200 dark:hover:bg-black dark:hover:text-white dark:active:bg-stone-800"
    >
      View All Sites
    </Link>
  );
}
