"use client";

import * as React from "react";
import { isClerkAPIResponseError, useSignIn } from "@clerk/nextjs";
import { type OAuthStrategy } from "@clerk/types";
import { toast } from "sonner";
import { Icons } from "@/components/icons";

const oauthProviders = [
  { name: "Microsoft", strategy: "oauth_microsoft", icon: "microsoft" },
  { name: "Google", strategy: "oauth_google", icon: "google" },
  { name: "GitHub", strategy: "oauth_github", icon: "gitHub" },
] satisfies {
  name: string;
  icon: keyof typeof Icons;
  strategy: OAuthStrategy;
}[];

export function OAuthSignIn() {
  const [isLoading, setIsLoading] = React.useState<OAuthStrategy | null>(null);
  const { signIn, isLoaded: signInLoaded } = useSignIn();

  async function oauthSignIn(provider: OAuthStrategy) {
    if (!signInLoaded) return null;
    try {
      setIsLoading(provider);
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (error) {
      setIsLoading(null);

      const unknownError = "Something went wrong, please try again.";

      isClerkAPIResponseError(error)
        ? toast.error(error.errors[0]?.longMessage ?? unknownError)
        : toast.error(unknownError);
    }
  }
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-4">
      {oauthProviders.map((provider) => {
        const Icon = Icons[provider.icon];

        return (
          <button
            aria-label={`Sign in with ${provider.name}`}
            key={provider.strategy}
            className={`${
              isLoading
                ? "cursor-not-allowed bg-stone-50 dark:bg-stone-800"
                : "bg-white hover:bg-stone-50 active:bg-stone-100 dark:bg-black dark:hover:border-white dark:hover:bg-black"
            } group my-2 flex h-10 w-full items-center justify-center space-x-2 rounded-md border border-stone-200 transition-colors duration-75 focus:outline-none dark:border-stone-700`}
            onClick={() => void oauthSignIn(provider.strategy)}
            disabled={isLoading !== null}
          >
            {isLoading === provider.strategy ? (
              <Icons.spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Icon
                className="mr-2 h-4 w-4 dark:text-white"
                aria-hidden="true"
              />
            )}
            <p className="text-sm font-medium text-stone-600 dark:text-stone-400">
              {provider.name}
            </p>
          </button>
        );
      })}
    </div>
  );
}
