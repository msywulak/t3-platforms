import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { env } from "@/env.mjs";

export default function HomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-10">
      <Image
        width={512}
        height={512}
        src="/logo.png"
        alt="Platforms on Vercel"
        className="w-48"
      />
      <h1 className="font-sans text-4xl font-bold">T3 Platforms</h1>
      <Link
        className={buttonVariants({ variant: "default" })}
        href={
          process.env.NEXT_PUBLIC_VERCEL_ENV
            ? `https://app.${env.NEXT_PUBLIC_ROOT_DOMAIN}`
            : `http://app.localhost:3000`
        }
      >
        Click here to get started
      </Link>
    </div>
  );
}
