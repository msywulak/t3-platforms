import { type Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { OAuthSignIn } from "@/components/auth/oauth-signin";
import { Shell } from "@/components/shells/shell";
import { Suspense } from "react";
// import { SignInForm } from "@/components/form/signin-form";

export const metadata: Metadata = {
  title: "Login | Platforms Starter Kit",
};

export default async function SignInPage() {
  const user = await currentUser();
  if (user) redirect("/");

  return (
    <Shell variant={"sidebar"}>
      <div className="mx-5 border py-10 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md">
        <Image
          alt="Platforms Starter Kit"
          width={100}
          height={100}
          className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border"
          src="/logo.png"
        />
        <h1 className="mt-6 text-center text-3xl dark:text-white">
          Platforms Starter Kit
        </h1>
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
        <p className="mt-2 text-center text-sm font-bold">Sign In with</p>
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
