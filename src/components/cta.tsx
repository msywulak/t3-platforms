"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  const [closeCTA, setCloseCTA] = useState(false);
  return (
    <div
      className={`${
        closeCTA ? "h-14 lg:h-auto" : "h-60 sm:h-40 lg:h-auto"
      } fixed inset-x-0 bottom-5 mx-5 flex max-w-screen-xl flex-col items-center justify-between space-y-3 rounded-lg border-t-4 pb-3 pt-0 drop-shadow-lg transition-all duration-150 ease-in-out dark:border dark:border-t-4 lg:flex-row lg:space-y-0 lg:pt-3 xl:mx-auto`}
    >
      <Button
        onClick={() => setCloseCTA(!closeCTA)}
        className={`${
          closeCTA ? "rotate-180" : "rotate-0"
        } absolute right-3 top-2 transition-all duration-150 ease-in-out lg:hidden`}
      >
        <svg
          viewBox="0 0 24 24"
          width="30"
          height="30"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          shapeRendering="geometricPrecision"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </Button>
      <div className="text-center lg:text-left">
        <p className="font-title text-lg sm:text-2xl">
          Platforms Starter Kit Demo
        </p>
        <p
          className={`${
            closeCTA ? "hidden lg:block" : ""
          } mt-2 text-sm lg:mt-0`}
        >
          This is a demo site showcasing how to build a multi-tenant application
          with{" "}
          <a
            className="font-semibold underline"
            href="https://platformize.co"
            rel="noreferrer"
            target="_blank"
          >
            custom domain
          </a>{" "}
          support.
        </p>
      </div>
      <div
        className={`${
          closeCTA ? "hidden lg:flex" : ""
        } flex w-full flex-col space-y-3 text-center sm:flex-row sm:space-x-3 sm:space-y-0 lg:w-auto`}
      >
        <a
          className="whitespace-no-wrap font-title flex-auto rounded-md border px-5 py-1 text-lg transition-all duration-150 ease-in-out sm:py-3"
          href="https://app.vercel.pub"
          rel="noreferrer"
          target="_blank"
        >
          Create your publication
        </a>
        <a
          className="whitespace-no-wrap font-title flex-auto rounded-md border px-5 py-1 text-lg transition-all duration-150 ease-in-out sm:py-3"
          href="https://vercel.com/guides/nextjs-multi-tenant-application"
          rel="noreferrer"
          target="_blank"
        >
          Clone and deploy
        </a>
      </div>
    </div>
  );
}
