import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { Shell } from "@/components/shells/shell";
import { Suspense } from "react";
import Image from "next/image";
import { OAuthSignIn } from "@/components/auth/oauth-signin";

export const metadata: Metadata = {
  title: "Login | Platforms Starter Kit",
};

export default async function SignUpPage() {
  const user = await currentUser();
  if (user) redirect("/");

  return (
    <Shell variant={"sidebar"}>
      <div className="borderpy-10 mx-5 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md">
        <Image
          alt="Platforms Starter Kit"
          width={100}
          height={100}
          className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border"
          src="/logo.png"
        />
        <h1 className="mt-6 text-center text-3xl">Platforms Starter Kit</h1>
        <p className="mt-2 text-center text-sm">
          Build multi-tenant applications with custom domains. <br />
          <a
            className="font-medium"
            href="https://vercel.com/blog/platforms-starter-kit"
            rel="noreferrer"
            target="_blank"
          >
            Read the announcement.
          </a>
        </p>
        <p className="mt-2 text-center text-sm font-bold">Sign Up with</p>
        <div className="mx-auto mt-4 w-11/12 max-w-sm sm:w-full">
          <Suspense
            fallback={<div className="my-2 h-10 w-full rounded-md border" />}
          >
            <OAuthSignIn />
          </Suspense>
        </div>
      </div>
    </Shell>
  );
}
