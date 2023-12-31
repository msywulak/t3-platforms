"use client";

import { useEffect, useState, useTransition } from "react";
import { updatePost, updatePostMetadata } from "@/lib/actions";
import { Editor as NovelEditor } from "novel";
import { cn } from "@/lib/utils";
import LoadingDots from "./icons/loading-dots";
import { toast } from "sonner";
import { env } from "@/env.mjs";
import { type postEditorSchema } from "@/lib/validations/post";
import { type z } from "zod";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PostWithSite = z.infer<typeof postEditorSchema>;

export default function Editor({ post }: { post: PostWithSite }) {
  const [isPendingSaving, startTransitionSaving] = useTransition();
  const [isPendingPublishing, startTransitionPublishing] = useTransition();
  const [data, setData] = useState<PostWithSite>(post);
  // const [hydrated, setHydrated] = useState(false);

  const url = process.env.NEXT_PUBLIC_VERCEL_ENV
    ? `https://${data.site?.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}/${data.slug}`
    : `http://${data.site?.subdomain}.localhost:3000/${data.slug}`;

  // listen to CMD + S and override the default behavior
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "s") {
        e.preventDefault();
        startTransitionSaving(async () => {
          await updatePost({ post: data });
        });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [data, startTransitionSaving]);

  return (
    <div className="relative min-h-[500px] w-full max-w-screen-lg p-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg">
      <div className="absolute right-5 top-5 mb-5 flex items-center space-x-3">
        {data.published && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm"
          >
            <Icons.externalLink className="h-4 w-4" />
          </a>
        )}
        <Button
          variant="secondary"
          disabled={true}
          className="flex h-7 w-16 items-center justify-center space-x-2 rounded-lg text-sm transition-all focus:outline-none"
        >
          {isPendingSaving ? "Saving..." : "Saved"}
        </Button>
        <Button
          onClick={() => {
            const formData = new FormData();
            console.log(data.published, typeof data.published);
            formData.append("published", String(!data.published));
            startTransitionPublishing(async () => {
              await updatePostMetadata({
                postId: data.id!,
                siteId: data.siteId!,
                formData,
                key: "published",
              }).then(() => {
                toast.success(
                  `Successfully ${
                    data.published ? "unpublished" : "published"
                  } your post.`,
                );
                setData((prev) => ({ ...prev, published: !prev.published }));
              });
            });
          }}
          className={cn(
            "flex h-7 w-24 items-center justify-center space-x-2 rounded-lg text-sm transition-all focus:outline-none",
            isPendingPublishing ? "cursor-not-allowed" : "cursor-pointer",
          )}
          disabled={isPendingPublishing}
        >
          {isPendingPublishing ? (
            <LoadingDots />
          ) : (
            <p>{data.published ? "Unpublish" : "Publish"}</p>
          )}
        </Button>
      </div>
      <div className="mb-5 flex flex-col space-y-3 border-b pb-5 pt-3">
        <Input
          type="text"
          placeholder="Title"
          defaultValue={post?.title ?? ""}
          autoFocus
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className="border-none px-0 text-3xl"
        />
        <Textarea
          placeholder="Description"
          defaultValue={post?.description ?? ""}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="resize-none border-none px-0"
          rows={1}
        />
      </div>
      <NovelEditor
        className="relative block"
        defaultValue={post?.content ?? undefined}
        onUpdate={(editor) => {
          setData((prev) => ({
            ...prev,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            content: editor?.storage.markdown.getMarkdown(),
          }));
        }}
        onDebouncedUpdate={() => {
          if (
            data.title === post.title &&
            data.description === post.description &&
            data.content === post.content
          ) {
            return;
          }
          startTransitionSaving(async () => {
            await updatePost({ post: data });
          });
        }}
      />
    </div>
  );
}
