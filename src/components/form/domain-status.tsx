"use client";

import LoadingSpinner from "./loading-spinner";
import { useDomainStatus } from "./use-domain-status";
import { Icons } from "@/components/icons";

export default function DomainStatus({ domain }: { domain: string }) {
  const { status, loading } = useDomainStatus({ domain });

  return loading ? (
    <LoadingSpinner />
  ) : status === "Valid Configuration" ? (
    <Icons.checkCircled
      fill="#2563EB"
      stroke="currentColor"
      className="text-white dark:text-black"
    />
  ) : status === "Pending Verification" ? (
    <Icons.exclamationTriangle
      fill="#FBBF24"
      stroke="currentColor"
      className="text-white dark:text-black"
    />
  ) : (
    <Icons.crossCircled
      fill="#DC2626"
      stroke="currentColor"
      className="text-white dark:text-black"
    />
  );
}
