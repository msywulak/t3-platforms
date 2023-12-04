"use client";

import * as React from "react";
import { type User } from "@clerk/nextjs/dist/types/server";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  UncontrolledFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface UpdateClerkProfileFormProps {
  user: User;
}

export function UpdateClerkProfileForm({ user }: UpdateClerkProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  // // react-hook-form
  // const form = useForm<Inputs>({
  //   resolver: zodResolver(),
  //   defaultValues: {},
  // });

  // function onSubmit(data: Inputs) {
  //   console.log(data);
  // }

  return (
    // <Form {...form}>
    <form
      className="grid w-full max-w-2xl gap-5"
      // onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
    >
      <div className="flex w-full items-end">
        <FormItem className="mr-4 flex-grow">
          <FormLabel>Post Slug</FormLabel>
          <FormControl>
            <Input
              id="update-post-slug"
              // aria-invalid={!!form.formState.errors.slug}
              aria-describedby="update-post-slug-text"
              // {...form.register("slug")}
              name="slug"
              type="text"
              defaultValue={user.firstName ?? ""}
              minLength={3}
              maxLength={32}
              required={true}
              aria-autocomplete="none"
            />
          </FormControl>
          <UncontrolledFormMessage
          // message={form.formState.errors.slug?.message}
          />
        </FormItem>
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
      </div>
    </form>
    // </Form>
  );
}
