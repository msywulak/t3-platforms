import { unstable_cache } from "next/cache";
import { env } from "@/env.mjs";
import { db } from "@/db";
import { and, desc, eq } from "drizzle-orm";
import { posts, sites } from "@/db/schema";

export async function getPostsForSite(domain: string) {
  const subdomain = domain.endsWith(`.${env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  const site = await db.query.sites.findFirst({
    where: subdomain
      ? eq(sites.subdomain, subdomain)
      : eq(sites.customDomain, domain),
    columns: {
      id: true,
    },
  });

  return unstable_cache(
    async () => {
      if (!site) {
        return [];
      }
      return db.query.posts.findMany({
        where: and(eq(posts.published, true), eq(posts.siteId, site.id)),
        columns: {
          title: true,
          description: true,
          slug: true,
          image: true,
          imageBlurhash: true,
          createdAt: true,
        },
        orderBy: [desc(posts.createdAt)],
      });
    },
    [`${domain}-posts`],
    {
      revalidate: 900,
      tags: [`${domain}-posts`],
    },
  )();
}
