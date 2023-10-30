import { unstable_cache } from "next/cache";
import { env } from "@/env.mjs";
import { db } from "@/db";
import { and, desc, eq } from "drizzle-orm";
import { posts, sites } from "@/db/schema";
import { serialize } from "next-mdx-remote/serialize";
import { replaceExamples, replaceTweets } from "@/lib/remark-plugins";

export async function getSiteData(domain: string) {
  const subdomain = domain.endsWith(`.${env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return await unstable_cache(
    async () => {
      return db.query.sites.findFirst({
        where: subdomain
          ? eq(sites.subdomain, subdomain)
          : eq(sites.customDomain, domain),
        with: { user: true },
      });
    },
    [`${domain}-metadata`],
    {
      revalidate: 900,
      tags: [`${domain}-metadata`],
    },
  )();
}

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

export async function getPostData(domain: string, slug: string) {
  const subdomain = domain.endsWith(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)
    ? domain.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, "")
    : null;

  return unstable_cache(
    async () => {
      const data = await db.query.posts.findFirst({
        where: and(
          subdomain
            ? eq(sites.subdomain, subdomain)
            : eq(sites.customDomain, domain),
          eq(posts.slug, slug),
          eq(posts.published, true),
        ),
        with: {
          site: {
            with: {
              user: true,
            },
          },
        },
      });
      if (!data) return null;

      const [mdxSource, adjacentPosts] = await Promise.all([
        getMdxSource(data.content!),
        db.query.posts.findMany({
          where: and(
            subdomain
              ? eq(sites.subdomain, subdomain)
              : eq(sites.customDomain, domain),
            eq(posts.published, true),
            eq(posts.id, data.id),
          ),
          columns: {
            slug: true,
            title: true,
            createdAt: true,
            description: true,
            image: true,
            imageBlurhash: true,
          },
        }),
      ]);
      return {
        ...data,
        mdxSource,
        adjacentPosts,
      };
    },
    [`${domain}-${slug}`],
    {
      revalidate: 900,
      tags: [`${domain}-${slug}`],
    },
  )();
}

async function getMdxSource(postContents: string) {
  // transforms links like <link> to [link](link) as MDX doesn't support <link> syntax
  // https://mdxjs.com/docs/what-is-mdx/#markdown
  const content =
    postContents?.replaceAll(/<(https?:\/\/\S+)>/g, "[$1]($1)") ?? "";
  // Serialize the content string into MDX
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [replaceTweets, () => replaceExamples()],
    },
  });

  return mdxSource;
}
