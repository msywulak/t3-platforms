"use client";

import * as React from "react";
import { isClerkAPIResponseError, useSignIn, useSignUp } from "@clerk/nextjs";
import { type OAuthStrategy } from "@clerk/types";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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

export function OAuthSignUp() {
  const [isLoading, setIsLoading] = React.useState<OAuthStrategy | null>(null);
  const { signUp, isLoaded: signUpLoaded } = useSignUp();

  async function oauthSignUp(provider: OAuthStrategy) {
    if (!signUpLoaded) return null;
    try {
      setIsLoading(provider);
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete:
          provider === "oauth_microsoft" ? "/sign-up/verify-email" : "/",
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
          <Button
            variant="secondary"
            aria-label={`Sign in with ${provider.name}`}
            key={provider.strategy}
            className={`${
              isLoading ? "cursor-not-allowed" : ""
            } group my-2 flex h-10 w-full items-center justify-center rounded-md border transition-colors duration-75`}
            onClick={() => void oauthSignUp(provider.strategy)}
            disabled={isLoading !== null}
          >
            {isLoading === provider.strategy ? (
              <Icons.spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            <p className="text-sm font-medium">{provider.name}</p>
          </Button>
        );
      })}
    </div>
  );
}
