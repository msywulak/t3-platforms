import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { sites } from "@/db/schema";
import SiteCard from "./site-card";
import Image from "next/image";
import { asc, eq } from "drizzle-orm";

export default async function Sites({ limit }: { limit?: number }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const allSites = await db.query.sites.findMany({
    where: eq(sites.clerkId, user.id),
    orderBy: [asc(sites.createdAt)],
    limit: limit ? limit : undefined,
  });

  return allSites.length > 0 ? (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {allSites.map((site) => (
        <SiteCard key={site.id} data={site} />
      ))}
    </div>
  ) : (
    <div className="mt-20 flex flex-col items-center space-x-4">
      <h1 className="font-cal text-4xl">No Sites Yet</h1>
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
  );
}
