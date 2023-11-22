import { Suspense } from "react";
import OverviewStats from "@/components/overview-stats";
import Posts from "@/components/posts";
import PlaceholderCard from "@/components/placeholder-card";
import OverviewSitesCTA from "@/components/overview-sites-cta";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sites } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import SiteCard from "@/components/site-card";
import Image from "next/image";

export default async function Overview() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const allSites = await db.query.sites.findMany({
    where: eq(sites.clerkId, user.id),
    orderBy: [asc(sites.createdAt)],
    limit: 4,
  });

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Overview
        </h1>
        <OverviewStats />
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Top Sites
          </h1>
          <Suspense fallback={null}>
            <OverviewSitesCTA />
          </Suspense>
        </div>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          {allSites.length > 0 ? (
            <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {allSites.map((site) => (
                <SiteCard key={site.id} data={site} />
              ))}
            </div>
          ) : (
            <div className="mt-20 flex flex-col items-center space-x-4">
              <h1 className="text-4xl">No Sites Yet</h1>
              <Image
                alt="missing site"
                src="https://illustrations.popsy.co/gray/web-design.svg"
                width={400}
                height={400}
              />
              <p className="text-lg text-stone-500">
                You do not have any sites yet. Create one to get started.
              </p>
            </div>
          )}
        </Suspense>
      </div>

      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Recent Posts
        </h1>
        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <PlaceholderCard key={i} />
              ))}
            </div>
          }
        >
          <Posts limit={8} />
        </Suspense>
      </div>
    </div>
  );
}
