import { db } from "@/db";
import { CreateSiteButton } from "./create-site-button";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { sites } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";

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
    <Link href="/sites" className={buttonVariants({ variant: "default" })}>
      View All Sites
    </Link>
  );
}
