import { type HandleOAuthCallbackParams } from "@clerk/types";
import SSOCallback from "@/components/auth/sso-callback";
import { Shell } from "@/components/shells/shell";
import { type Metadata } from "next";

export const runtime = "edge";

export const metadata: Metadata = {
  title: "SSO-Callback | Platforms Starter Kit",
};

export interface SSOCallbackPageProps {
  searchParams: HandleOAuthCallbackParams;
}

export default function SSOCallbackPage({
  searchParams,
}: SSOCallbackPageProps) {
  console.log(searchParams);
  return (
    <Shell className="max-w-lg">
      <SSOCallback searchParams={searchParams} />
    </Shell>
  );
}
