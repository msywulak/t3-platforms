"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

export default function AccountSettingsNav() {
  const segment = useSelectedLayoutSegment();

  const navItems = [
    {
      name: "Account",
      href: `/settings`,
      segment: null,
    },
    {
      name: "Security",
      href: `/settings/security`,
      segment: "security",
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
