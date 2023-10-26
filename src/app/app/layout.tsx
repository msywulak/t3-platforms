import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "T3 Platforms",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
