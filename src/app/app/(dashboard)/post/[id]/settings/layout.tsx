import { type ReactNode } from "react";

export default function SiteAnalyticsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col items-center space-x-4 space-y-2 border-b border-secondary pb-4 pt-2 sm:flex-row sm:space-y-0">
        <h1 className="text-xl font-bold sm:text-3xl">Post Settings</h1>
      </div>
      {children}
    </>
  );
}
