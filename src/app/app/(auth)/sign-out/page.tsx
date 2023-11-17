import { type Metadata } from "next";
import Image from "next/image";
import { Shell } from "@/components/shells/shell";
import { Suspense } from "react";
import { LogOutButtons } from "@/components/auth/logout-buttons";

export const metadata: Metadata = {
  title: "Sign Out | Platforms Starter Kit",
};

export default function SignOutPage() {
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
        <h1 className="mt-6 text-center text-3xl">Platforms Starter Kit</h1>
        <p className="mt-2 text-center text-sm">
          Are you sure you want to sign out?
        </p>
        <div className="mx-auto mt-4 w-11/12 max-w-sm sm:w-full">
          <Suspense
            fallback={<div className="my-2 h-10 w-full rounded-md border" />}
          >
            <LogOutButtons />
          </Suspense>
        </div>
      </div>
    </Shell>
  );
}
