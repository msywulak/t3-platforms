"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { catchClerkError } from "@/lib/utils";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { Icons } from "@/components/icons";

type Inputs = z.infer<typeof verifyEmailSchema>;

export function VerifyEmailForm() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isPending, startTransition] = React.useTransition();

  // react-hook-form
  const form = useForm<Inputs>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
  });

  function onSubmit(data: Inputs) {
    if (!isLoaded) return;

    startTransition(async () => {
      try {
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: data.code,
        });
        if (completeSignUp.status !== "complete") {
          /*  investigate the response, to see if there was an error
             or if the user needs to complete more steps.*/
          console.log(JSON.stringify(completeSignUp, null, 2));
        }
        if (completeSignUp.status === "complete") {
          await setActive({ session: completeSignUp.createdSessionId });

          router.push(`${window.location.origin}/`);
        }
      } catch (err) {
        catchClerkError(err);
      }
    });
  }

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <label htmlFor="code">Verification Code</label>
        <input
          id="code"
          type="text"
          className="input"
          autoComplete="off"
          {...form.register("code")}
        />
        {form.formState.errors.code && (
          <p className="text-red-600">{form.formState.errors.code.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isPending || !isLoaded}
      >
        {isPending ? (
          <Icons.spinner className="animate-spin" />
        ) : (
          "Verify Email"
        )}
      </button>
    </form>
  );
}
