import { type HandleOAuthCallbackParams } from "@clerk/types";
import SSOCallback from "@/components/auth/sso-callback";
import { Shell } from "@/components/shells/shell";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "SSO-Callback | Platforms Starter Kit",
};

export interface SSOCallbackPageProps {
  searchParams: HandleOAuthCallbackParams;
}

export default function SSOCallbackPage({
  searchParams,
}: SSOCallbackPageProps) {
  return (
    <Shell className="max-w-lg">
      <SSOCallback searchParams={searchParams} />
    </Shell>
  );
}
