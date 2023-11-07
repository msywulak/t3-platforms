import * as React from "react";
import { type Site } from "@/db/schema";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Card, CardHeader } from "@/components/ui/card";
import { Icons } from "@/components/icons";

interface SiteCardProps extends React.HTMLAttributes<HTMLDivElement> {
  site: Pick<Site, "id" | "name" | "images" | "image" | "logo">;
}

export function ThumbnailCard({ site, className, ...props }: SiteCardProps) {
  return (
    <Card
      className={cn("h-full overflow-hidden rounded-sm", className)}
      {...props}
    >
      <CardHeader className="border-b p-0">
        <AspectRatio ratio={40 / 21}>
          {site?.images?.length ? (
            <Image
              src={site.images[0]?.url ?? "/placeholder.png"}
              alt={site.images[0]?.name ?? site.name ?? "Placeholder"}
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
      <span className="sr-only">{site.name}</span>
    </Card>
  );
}
