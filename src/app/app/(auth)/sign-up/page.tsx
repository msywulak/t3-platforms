import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { OAuthSignIn } from "@/components/auth/oauth-signin";
import { Shell } from "@/components/shells/shell";
// import { SignInForm } from "@/components/form/signin-form";

export const metadata: Metadata = {
  title: "Login | Platforms Starter Kit",
};

export default async function SignInPage() {
  const user = await currentUser();
  if (user) redirect("/");

  return (
    <Shell className="max-w-lg">
      <div className="space-y-1">
        <div className="text-2xl">
          <div className="grid gap-4">
            <OAuthSignIn />
          </div>
        </div>
      </div>
    </Shell>
  );
}
