import { Suspense } from "react";
import Sites from "@/components/sites";
import PlaceholderCard from "@/components/placeholder-card";
import { CreateSiteButton } from "@/components/create-site-button";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { asc, eq } from "drizzle-orm";
import { sites } from "@/db/schema";

export default async function AllSites() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const allSites = await db.query.sites.findMany({
    where: eq(sites.clerkId, user.id),
    orderBy: [asc(sites.createdAt)],
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
          <Sites sites={allSites} />
        </Suspense>
      </div>
    </div>
  );
}
