import BlurImage from "@/components/blur-image";
import { placeholderBlurhash, random } from "@/lib/utils";
import { Icons } from "@/components/icons";
import Link from "next/link";
import type { Site } from "@/db/schema";
import { env } from "@/env.mjs";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SiteCard({ data }: { data: Site }) {
  const url = `${data.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`;
  return (
    <Card className="relative rounded-lg pb-10 transition-all hover:border-ring hover:shadow-xl">
      <Link
        href={`/site/${data.id}`}
        className="flex flex-col overflow-hidden rounded-lg"
      >
        <BlurImage
          alt={data.name ?? "Card thumbnail"}
          width={500}
          height={400}
          className="h-44 object-cover"
          src={data.image?.[0]?.url ?? "/placeholder.png"}
          placeholder="blur"
          blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
        />
        <CardHeader>
          <CardTitle>{data.name}</CardTitle>
          <CardDescription>{data.description}</CardDescription>
        </CardHeader>
      </Link>
      <div className="absolute bottom-4 flex w-full justify-between space-x-4 px-4">
        <a
          href={
            process.env.NEXT_PUBLIC_VERCEL_ENV
              ? `https://${url}`
              : `http://${data.subdomain}.localhost:3000`
          }
          target="_blank"
          rel="noreferrer"
          className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
        >
          {url} ↗
        </a>
        <Link
          href={`/site/${data.id}/analytics`}
          className="flex items-center rounded-md bg-green-100 px-2 py-1 text-sm font-medium text-green-600 transition-colors hover:bg-green-200 dark:bg-green-900 dark:bg-opacity-50 dark:text-green-400 dark:hover:bg-green-800 dark:hover:bg-opacity-50"
        >
          <Icons.barChart height={16} />
          <p>{random(10, 40)}%</p>
        </Link>
      </div>
    </Card>
  );
}
