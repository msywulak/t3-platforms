import { env } from "@/env.mjs";
import { getSiteData } from "@/lib/fetchers";
import { headers } from "next/headers";
import Image from "next/image";

export default async function NotFound() {
  const headersList = headers();
  const domain = headersList
    .get("host")
    ?.replace(".localhost:3000", `.${env.NEXT_PUBLIC_ROOT_DOMAIN}`);
  const data = await getSiteData(domain!);

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="font-cal text-4xl">
        {data?.name ? `${data.name}: ` : ""}404
      </h1>
      <Image
        alt="missing site"
        src="https://illustrations.popsy.co/gray/timed-out-error.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        {data?.message404 ?? "Blimey! You've found a page that doesn't exist."}
      </p>
    </div>
  );
}
