"use client";

import * as React from "react";
import { type Post } from "@/db/schema";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import va from "@vercel/analytics";

import { Form } from "@/components/ui/form";
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
import { updatePostSchema } from "@/lib/validations/post";
import { deletePost } from "@/lib/actions";
import { catchClerkError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface UpdatePostSlugFormProps {
  post: Post;
}

type Inputs = z.infer<typeof updatePostSchema>;

export function DeletePostForm({ post }: UpdatePostSlugFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<Inputs>({
    resolver: zodResolver(updatePostSchema),
    defaultValues: {
      id: post.id,
      slug: post.slug ?? "",
    },
  });

  return (
    <Form {...form}>
      <form className="flex w-full flex-col">
        <div className="flex w-full items-end">
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
                Delete Post
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your post our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(async () => {
                      void form.trigger(["slug", "id"]);
                      va.track("Deleted Post");
                      await deletePost({
                        post: { id: post.id, site: null },
                      }).catch(catchClerkError);
                      toast.success("Post deleted");
                      router.push(`/site/${post.siteId}`);
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
