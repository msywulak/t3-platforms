import { type ReactNode } from "react";

export default function SiteAnalyticsLayout({
  children,
}: {
  params: { id: string };
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col items-center space-x-4 space-y-2 sm:flex-row sm:space-y-0">
        <h1 className="font-cal text-xl font-bold sm:text-3xl">
          Post Settings
        </h1>
      </div>
      {children}
    </>
  );
}
