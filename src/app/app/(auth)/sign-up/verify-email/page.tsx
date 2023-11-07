import { type Metadata } from "next";
import { Shell } from "@/components/shells/shell";
import { VerifyEmailForm } from "@/components/forms/verify-email-form";

// import { SignInForm } from "@/components/form/signin-form";

export const metadata: Metadata = {
  title: "Verify Email | Platforms Starter Kit",
  description: "Verify your email address to continue with your sign up",
};

export default function VerifyEmailPage() {
  return (
    <Shell className="max-w-lg">
      Verify your email address to complete your account creation
      <VerifyEmailForm />
    </Shell>
  );
}
