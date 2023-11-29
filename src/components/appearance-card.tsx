import * as React from "react";
import { type Site, type Post } from "@/db/schema";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardHeader } from "@/components/ui/card";
import { Icons } from "@/components/icons";

interface AppearanceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  site?: Pick<Site, "id" | "name" | "image" | "logo">;
  post?: Pick<Post, "id" | "title" | "image">;
  type: "logo" | "image";
}

export function AppearanceCard({
  site,
  post,
  type,
  className,
  ...props
}: AppearanceCardProps) {
  return (
    <Card
      className={cn("h-full overflow-hidden rounded-sm", className)}
      {...props}
    >
      {type === "image" ? (
        <CardHeader className="border-b p-0">
          <AspectRatio ratio={40 / 21}>
            {post?.image?.length ? (
              <Image
                src={post.image[0]?.url ?? "/placeholder.png"}
                alt={post.image[0]?.name ?? post.title ?? "Placeholder"}
                className="object-cover"
                sizes="100%"
                fill
                loading="lazy"
              />
            ) : site?.image?.length ? (
              <Image
                src={site.image[0]?.url ?? "/placeholder.png"}
                alt={site.image[0]?.name ?? site.name ?? "Placeholder"}
                className="object-cover"
                sizes="100%"
                fill
                loading="lazy"
              />
            ) : (
              <div
                aria-label="Placeholder"
                role="img"
                aria-roledescription="placeholder"
                className="flex h-full w-full items-center justify-center bg-secondary"
              >
                <Icons.placeholder
                  className="h-9 w-9 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            )}
          </AspectRatio>
        </CardHeader>
      ) : (
        <CardHeader className="border-b p-0">
          <AspectRatio ratio={1 / 1}>
            {site?.logo?.length ? (
              <Image
                src={site.logo[0]?.url ?? "/placeholder.png"}
                alt={site.logo[0]?.name ?? site.name ?? "Placeholder"}
                className="object-cover"
                sizes="100%"
                fill
                loading="lazy"
              />
            ) : (
              <div
                aria-label="Placeholder"
                role="img"
                aria-roledescription="placeholder"
                className="flex h-full w-full items-center justify-center bg-secondary"
              >
                <Icons.placeholder
                  className="h-9 w-9 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            )}
          </AspectRatio>
        </CardHeader>
      )}
    </Card>
  );
}
