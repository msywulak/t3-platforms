"use client";

import * as React from "react";
import { type Post } from "@/db/schema";
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
import { updatePostSchema } from "@/lib/validations/post";
import { updatePost } from "@/lib/actions";
import { catchClerkError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface UpdatePostSlugFormProps {
  post: Post;
}

type Inputs = z.infer<typeof updatePostSchema>;

export function UpdatePostSlugForm({ post }: UpdatePostSlugFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<Inputs>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      id: post.id,
      slug: post.slug ?? "",
    },
  });

  function onSubmit(data: Inputs) {
    startTransition(async () => {
      try {
        data.slug =
          data.slug
            ?.toLowerCase()
            .trim()
            .replace(/[\W_]+/g, "-") ?? "";
        await updatePost({ post: { ...data, slug: data.slug, site: null } });
        toast.success("Post Slug Successfully Updated");
      } catch (err) {
        toast.error("Failed to Update Post Slug");
        catchClerkError(err);
      }
    });
  }

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-col"
        onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
      >
        <div className="flex w-full items-end">
          <FormItem className="mr-4 flex-grow">
            <FormLabel>Post Slug</FormLabel>
            <FormControl>
              <Input
                id="update-post-slug"
                aria-invalid={!!form.formState.errors.slug}
                aria-describedby="update-post-slug-text"
                {...form.register("slug")}
                name="slug"
                type="text"
                defaultValue={post.slug ?? ""}
                minLength={3}
                maxLength={32}
                required={true}
                aria-autocomplete="none"
              />
            </FormControl>
            <UncontrolledFormMessage
              message={form.formState.errors.slug?.message}
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
    </Form>
  );
}
