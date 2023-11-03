"use client";

import Link from "next/link";
import {
  useParams,
  usePathname,
  useSelectedLayoutSegments,
} from "next/navigation";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { getSiteFromPostId } from "@/lib/actions";
import Image from "next/image";
import { ModeToggle } from "./theme-toggle";
import { Icons } from "@/components/icons";

const externalLinks = [
  {
    name: "Read announcement",
    href: "https://vercel.com/blog/platforms-starter-kit",
    icon: <Icons.rocket width={18} />,
  },
  {
    name: "Star on GitHub",
    href: "https://github.com/vercel/platforms",
    icon: <Icons.githubLogo width={18} />,
  },
  {
    name: "Read the guide",
    href: "https://vercel.com/guides/nextjs-multi-tenant-application",
    icon: <Icons.file width={18} />,
  },
  {
    name: "View demo site",
    href: "https://demo.vercel.pub",
    icon: <Icons.layout width={18} />,
  },
  {
    name: "Deploy your own",
    href: "https://vercel.com/templates/next.js/platforms-starter-kit",
    icon: (
      <svg
        width={18}
        viewBox="0 0 76 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="py-1 text-black dark:text-white"
      >
        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="currentColor" />
      </svg>
    ),
  },
];

export default function Nav({ children }: { children: ReactNode }) {
  const segments = useSelectedLayoutSegments();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const { id } = useParams() as { id?: string };

  const [siteId, setSiteId] = useState<number | null>();

  useEffect(() => {
    const fetchSiteId = async () => {
      if (segments[0] === "post" && id && siteId === undefined) {
        // Only call the API if siteId is not already set
        try {
          const newSiteId = await getSiteFromPostId({ postId: Number(id) });
          setSiteId(newSiteId.data);
        } catch (error) {
          console.error("Failed to fetch site ID:", error);
          // Handle the error appropriately
        }
      }
    };

    void fetchSiteId();
  }, [segments, id, siteId]);

  const tabs = useMemo(() => {
    if (segments[0] === "site" && id) {
      return [
        {
          name: "Back to All Sites",
          href: "/sites",
          icon: <Icons.arrowLeft width={18} />,
        },
        {
          name: "Posts",
          href: `/site/${id}`,
          isActive: segments.length === 2,
          icon: <Icons.reader width={18} />,
        },
        {
          name: "Analytics",
          href: `/site/${id}/analytics`,
          isActive: segments.includes("analytics"),
          icon: <Icons.barChart width={18} />,
        },
        {
          name: "Settings",
          href: `/site/${id}/settings`,
          isActive: segments.includes("settings"),
          icon: <Icons.gear width={18} />,
        },
      ];
    } else if (segments[0] === "post" && id) {
      return [
        {
          name: "Back to All Posts",
          href: siteId ? `/site/${siteId}` : "/sites",
          icon: <Icons.arrowLeft width={18} />,
        },
        {
          name: "Editor",
          href: `/post/${id}`,
          isActive: segments.length === 2,
          icon: <Icons.pencil1 width={18} />,
        },
        {
          name: "Settings",
          href: `/post/${id}/settings`,
          isActive: segments.includes("settings"),
          icon: <Icons.gear width={18} />,
        },
      ];
    }
    return [
      {
        name: "Overview",
        href: "/",
        isActive: segments.length === 0,
        icon: <Icons.dashboard width={18} />,
      },
      {
        name: "Sites",
        href: "/sites",
        isActive: segments[0] === "sites",
        icon: <Icons.globe width={18} />,
      },
      {
        name: "Settings",
        href: "/settings",
        isActive: segments[0] === "settings",
        icon: <Icons.gear width={18} />,
      },
    ];
  }, [segments, id, siteId]);

  const [showSidebar, setShowSidebar] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    // hide sidebar on path change
    setShowSidebar(false);
  }, [pathname]);

  return (
    <>
      <button
        className={`fixed z-20 ${
          // left align for Editor, right align for other pages
          segments[0] === "post" && segments.length === 2 && !showSidebar
            ? "left-5 top-5"
            : "right-5 top-7"
        } sm:hidden`}
        onClick={() => setShowSidebar(!showSidebar)}
      >
        <Icons.hamburgerMenu width={20} />
      </button>
      <div
        className={`transform ${
          showSidebar
            ? "w-full translate-x-0 bg-background"
            : "-translate-x-full"
        } fixed z-10 flex h-full flex-col justify-between border-r border-secondary p-4 transition-all sm:w-60 sm:translate-x-0`}
      >
        <div className="grid gap-2">
          <div className="flex items-center space-x-2 rounded-lg px-2 py-1.5">
            <a
              href="https://vercel.com/templates/next.js/platforms-starter-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg p-1.5 hover:bg-secondary"
            >
              <svg
                width="26"
                viewBox="0 0 76 65"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-black dark:text-white"
              >
                <path
                  d="M37.5274 0L75.0548 65H0L37.5274 0Z"
                  fill="currentColor"
                />
              </svg>
            </a>
            <div className="h-6 rotate-[30deg] border-l border-secondary-foreground" />
            <Link href="/" className="rounded-lg p-2 hover:bg-secondary">
              <Image
                src="/logo.png"
                width={24}
                height={24}
                alt="Logo"
                className="dark:scale-110 dark:rounded-full dark:border"
              />
            </Link>
            <div className="h-6 rotate-[30deg] border-l border-secondary-foreground" />
            <ModeToggle />
          </div>
          <div className="grid gap-1">
            {tabs.map(({ name, href, isActive, icon }) => (
              <Link
                key={name}
                href={href}
                className={`flex items-center space-x-3 ${
                  isActive ? "bg-secondary" : ""
                } rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-secondary active:bg-secondary`}
              >
                {icon}
                <span className="text-sm font-medium">{name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="grid gap-1">
            {externalLinks.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-secondary active:bg-secondary"
              >
                <div className="flex items-center space-x-3">
                  {icon}
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <p>↗</p>
              </a>
            ))}
          </div>
          <div className="my-2 border-t border-secondary" />
          {children}
        </div>
      </div>
    </>
  );
}
