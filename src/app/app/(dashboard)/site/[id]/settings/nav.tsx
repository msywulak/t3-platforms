"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useSelectedLayoutSegment } from "next/navigation";

export default function SiteSettingsNav() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { id } = useParams() as { id?: string };
  const segment = useSelectedLayoutSegment();

  const navItems = [
    {
      name: "General",
      href: `/site/${id}/settings`,
      segment: null,
    },
    {
      name: "Domains",
      href: `/site/${id}/settings/domains`,
      segment: "domains",
    },
    {
      name: "Appearance",
      href: `/site/${id}/settings/appearance`,
      segment: "appearance",
    },
  ];

  return (
    <div className="flex space-x-4 border-b border-secondary pb-4 pt-2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          // Change style depending on whether the link is active
          className={cn(
            "rounded-md px-2 py-1 text-sm font-medium transition-colors active:bg-secondary",
            segment === item.segment ? "bg-secondary" : " hover:bg-secondary",
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
