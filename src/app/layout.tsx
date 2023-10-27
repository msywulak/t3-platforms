import "@/styles/globals.css";

import { Providers } from "./providers";
import { type Metadata } from "next";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { GeistSans, GeistMono } from "geist/font";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: ["https://vercel.pub/favicon.ico"],
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.image],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.image],
    creator: "@vercel",
  },
  metadataBase: new URL("https://vercel.pub"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(`${GeistSans.variable} ${GeistMono.variable}`)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
