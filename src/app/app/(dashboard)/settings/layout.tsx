import { type ReactNode } from "react";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import AccountSettingsNav from "./nav";

export default async function AccountSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex max-w-screen-xl flex-col space-y-6 p-8">
      <div className="flex flex-col items-center space-x-4 space-y-2 sm:flex-row sm:space-y-0">
        <h1 className="text-xl font-bold sm:text-3xl">Account</h1>
      </div>
      <AccountSettingsNav />
      {children}
    </div>
  );
}
