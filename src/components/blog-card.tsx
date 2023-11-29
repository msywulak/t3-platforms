import Link from "next/link";
import BlurImage from "./blur-image";

import type { Post } from "@/db/schema";
import { placeholderBlurhash, toDateString } from "@/lib/utils";

interface BlogCardProps {
  data: Pick<
    Post,
    "slug" | "image" | "imageBlurhash" | "title" | "description" | "createdAt"
  >;
}

export default function BlogCard({ data }: BlogCardProps) {
  const image = data.image?.[0]?.url ? data.image[0].url : "/placeholder.png";

  return (
    <Link href={`/${data.slug}`}>
      <div className="ease overflow-hidden rounded-2xl border-2  shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
        <BlurImage
          src={image}
          alt={data.title ?? "Blog Post"}
          width={500}
          height={400}
          className="h-64 w-full object-cover"
          placeholder="blur"
          blurDataURL={data.imageBlurhash ?? placeholderBlurhash}
        />
        <div className="h-36 border-t px-5 py-8">
          <h3 className="font-title text-xl tracking-wide">{data.title}</h3>
          <p className="text-md my-2 truncate italic">{data.description}</p>
          <p className="my-2 text-sm">
            Published {toDateString(data.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
}
