"use client";

import * as React from "react";
import { type Site } from "@/db/schema";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  UncontrolledFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateSiteSchema } from "@/lib/validations/site";
import { deleteSite, updateSite } from "@/lib/actions";
import { catchClerkError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import va from "@vercel/analytics";

interface UpdateSiteFormProps {
  site: Site;
}

type Inputs = z.infer<typeof updateSiteSchema>;

export function UpdateSiteForm({ site }: UpdateSiteFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  // react-hook-form
  const form = useForm<Inputs>({
    resolver: zodResolver(updateSiteSchema),
    defaultValues: {
      name: site.name!,
      description: site.description ?? "",
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
        className="grid w-full max-w-2xl gap-5"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <FormItem>
          <FormLabel>Site Name</FormLabel>
          <FormControl>
            <Input
              id="update-site-name"
              aria-invalid={!!form.formState.errors.name}
              aria-describedby="update-site-name-text"
              {...form.register("name")}
              name="name"
              type="text"
              defaultValue={site.name!}
              placeholder="Type site name here"
              minLength={3}
              maxLength={32}
              required={true}
            />
          </FormControl>
          <UncontrolledFormMessage
            message={form.formState.errors.name?.message}
          />
        </FormItem>
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Type site description here."
              {...form.register("description")}
              defaultValue={site.description ?? ""}
            />
          </FormControl>
          <UncontrolledFormMessage
            message={form.formState.errors.description?.message}
          />
        </FormItem>
        <div className="flex space-x-2">
          <Button disabled={isPending}>
            {isPending && (
              <Icons.spinner
                className="mr-2 h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Update Site
            <span className="sr-only">Update Site</span>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                {" "}
                {isPending && (
                  <Icons.spinner
                    className="mr-2 h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                Delete Site
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your site and all post from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(async () => {
                      void form.trigger(["name", "description"]);
                      va.track("Deleted Site");
                      await deleteSite({ siteId: site.id });
                      router.push(`/sites`);
                    });
                  }}
                  disabled={isPending}
                >
                  Delete Site
                  <span className="sr-only">Delete Site</span>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </form>
    </Form>
  );
}
