import { db } from "@/db";
import { CreateSiteButton } from "./create-site-button";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { sites } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      className={cn(
        buttonVariants({ variant: "default" }),
        "flex h-7 w-28 items-center justify-center space-x-2 rounded-lg text-sm transition-all focus:outline-none",
      )}
    >
      View All Sites
    </Link>
  );
}
