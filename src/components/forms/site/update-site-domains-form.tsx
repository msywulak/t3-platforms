"use client";

import * as React from "react";
import { type Site } from "@/db/schema";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  UncontrolledFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updateSiteSchema } from "@/lib/validations/site";
import { updateSite } from "@/lib/actions";
import { catchClerkError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { env } from "@/env.mjs";
import DomainStatus from "../domain-status";

interface UpdateSiteDomainFormProps {
  site: Site;
  type: "domain" | "subdomain";
}

type Inputs = z.infer<typeof updateSiteSchema>;

export function UpdateSiteDomainForm({
  site,
  type,
}: UpdateSiteDomainFormProps) {
  const [isPending, startTransition] = React.useTransition();

  // react-hook-form
  const form = useForm<Inputs>({
    resolver: zodResolver(updateSiteSchema),
    defaultValues: {
      customDomain: site.customDomain ?? "",
      subdomain: site.subdomain ?? "",
    },
  });

  function onSubmit(data: Inputs) {
    console.log(data);
    startTransition(async () => {
      try {
        await updateSite({ rawInput: data, key: "general" });
        toast.success("Site Updated Successfully");
      } catch (err) {
        catchClerkError(err);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full items-end gap-2"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        {type === "subdomain" ? (
          <FormItem>
            <FormLabel>Subdomain</FormLabel>
            <div className="flex items-center gap-0">
              <FormControl>
                <Input
                  id="update-subdomain"
                  aria-invalid={!!form.formState.errors.subdomain}
                  aria-describedby="update-subdomain-text"
                  {...form.register("subdomain")}
                  name="subdomain"
                  type="text"
                  defaultValue={site.subdomain ?? ""}
                  placeholder="Type subdomain here."
                  minLength={3}
                  maxLength={32}
                  required={true}
                  aria-autocomplete="none"
                  className="m-0 rounded-r-none border-r-0 pr-16"
                />
              </FormControl>
              <UncontrolledFormMessage
                message={form.formState.errors.subdomain?.message}
              />
              <Input
                defaultValue={`.${env.NEXT_PUBLIC_ROOT_DOMAIN}`}
                disabled
                readOnly
                className="m-0 rounded-l-none"
              />
            </div>
          </FormItem>
        ) : (
          <FormItem>
            <FormLabel>Custom Domain</FormLabel>
            <div className="relative flex w-full max-w-md">
              <FormControl>
                <Input
                  id="update-custom-domain"
                  aria-invalid={!!form.formState.errors.customDomain}
                  aria-describedby="update-custom-domain-text"
                  {...form.register("customDomain")}
                  name="customDomain"
                  type="text"
                  defaultValue={site.customDomain ?? ""}
                  placeholder="Type custom domain here."
                  minLength={3}
                  maxLength={32}
                  required={true}
                  aria-autocomplete="none"
                  className="pr-16"
                />
              </FormControl>
              <UncontrolledFormMessage
                message={form.formState.errors.customDomain?.message}
              />
              <div className="absolute right-3 z-10 flex h-full items-center">
                <DomainStatus domain={site.customDomain ?? ""} />
              </div>
            </div>
          </FormItem>
        )}
        <Button disabled={isPending} className="ml-auto">
          {isPending && (
            <Icons.spinner
              className="mr-2 h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          )}
          Save Changes
          <span className="sr-only">Save Changes</span>
        </Button>
      </form>
    </Form>
  );
}
