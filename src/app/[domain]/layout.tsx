import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import CTA from "@/components/cta";
import ReportAbuse from "@/components/report-abuse";
import { notFound } from "next/navigation";
import { getSiteData } from "@/lib/fetchers";
import { fontMapper } from "@/styles/fonts";
import { type Metadata } from "next";
import { env } from "@/env.mjs";
import { type StoredFile } from "@/types";
import { ClerkProvider } from "@clerk/nextjs";

export async function generateMetadata({
  params,
}: {
  params: { domain: string };
}): Promise<Metadata | null> {
  const domain = decodeURIComponent(params.domain);
  const data = await getSiteData(domain);
  if (!data) {
    return null;
  }
  const {
    name: title,
    description,
    image,
    logo,
  } = data as {
    name: string;
    description: string;
    image: StoredFile[];
    logo: StoredFile[];
  };

  let ogImage: string;
  let logoImage: string;

  if (image?.[0]?.url) {
    ogImage = image[0].url;
  } else {
    ogImage = "/og-image.png";
  }
  if (logo?.[0]?.url) {
    logoImage = logo[0].url;
  } else {
    logoImage = "/logo.png";
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@vercel",
    },
    icons: [logoImage],
    metadataBase: new URL(`https://${domain}`),
    // Optional: Set canonical URL to custom domain if it exists
    ...(params.domain.endsWith(`.${env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
      data.customDomain && {
        alternates: {
          canonical: `https://${data.customDomain}`,
        },
      }),
  };
}

export default async function SiteLayout({
  params,
  children,
}: {
  params: { domain: string };
  children: ReactNode;
}) {
  const domain = decodeURIComponent(params.domain);
  const data = await getSiteData(domain);

  if (!data) {
    notFound();
  }

  // // Optional: Redirect to custom domain if it exists
  // if (
  //   domain.endsWith(`.${env.NEXT_PUBLIC_ROOT_DOMAIN}`) &&
  //   data.customDomain &&
  //   env.REDIRECT_TO_CUSTOM_DOMAIN_IF_EXISTS === "true"
  // ) {
  //   return redirect(`https://${data.customDomain}`);
  // }

  return (
    <ClerkProvider>
      <div className={fontMapper[data.font ?? "font-sans"]}>
        <div className="ease left-0 right-0 top-0 z-30 flex h-16 transition-all duration-150">
          <div className="mx-auto flex h-full max-w-screen-xl items-center justify-center space-x-5 px-10 sm:px-20">
            <Link href="/" className="flex items-center justify-center">
              <div className="inline-block h-8 w-8 overflow-hidden rounded-full align-middle">
                <Image
                  alt={data.name ?? ""}
                  height={40}
                  src={data.logo?.[0]?.url ?? ""}
                  width={40}
                />
              </div>
              <span className="font-title ml-3 inline-block truncate font-medium">
                {data.name}
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-20">{children}</div>

        {domain == `demo.${env.NEXT_PUBLIC_ROOT_DOMAIN}` ||
        domain == `platformize.co` ? (
          <CTA />
        ) : (
          <ReportAbuse />
        )}
      </div>
    </ClerkProvider>
  );
}
