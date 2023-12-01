import BlurImage from "@/components/blur-image";
import { placeholderBlurhash } from "@/lib/utils";
import type { Post, Site } from "@/db/schema";
import Link from "next/link";
import { env } from "@/env.mjs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PostCard({
  data,
}: {
  data: Post & { site: Site | null };
}) {
  const url = `${data.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}/${data.slug}`;
  const image = data.image?.[0]?.url ? data.image[0].url : "/placeholder.png";

  return (
    <Card className="relative rounded-lg pb-10 transition-all hover:border-ring hover:shadow-xl">
      <Link
        href={`/post/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <div className="relative h-44 overflow-hidden">
          <BlurImage
            alt={data.title ?? "Card thumbnail"}
            width={500}
            height={400}
            className="h-full object-cover"
            src={image}
            placeholder="blur"
            blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
          />
          {!data.published && (
            <span className="absolute bottom-2 right-2 rounded-md border border-stone-200 bg-white px-3 py-0.5 text-sm font-medium text-stone-600 shadow-md">
              Draft
            </span>
          )}
        </div>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
          <CardDescription>{data.description}</CardDescription>
        </CardHeader>
      </Link>
      <div className="absolute bottom-4 flex w-full px-4">
        <a
          href={
            process.env.NEXT_PUBLIC_VERCEL_ENV
              ? `https://${url}`
              : `http://${data.site?.subdomain}.localhost:3000/${data.slug}`
          }
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {url} ↗
        </a>
      </div>
    </Card>
  );
}
