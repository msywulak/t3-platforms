"use client";

import { useTransition } from "react";
import { createPost } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import LoadingDots from "@/components/icons/loading-dots";
import { Button } from "@/components/ui/button";
import va from "@vercel/analytics";

export default function CreatePostButton() {
  const router = useRouter();
  const { id } = useParams();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      onClick={() =>
        startTransition(async () => {
          const post = await createPost({ siteId: Number(id) });
          router.refresh();
          if (typeof post === "object" && "error" in post) {
            console.error(post.error);
            router.push(`/site/${id as string}`);
          } else {
            va.track("Created Post");
            router.push(`/post/${post.data}`);
          }
        })
      }
      className={cn(
        "flex h-8 w-36 items-center justify-center space-x-2 rounded-lg border text-sm transition-all focus:outline-none sm:h-9",
        isPending ? "cursor-not-allowed" : "cursor-pointer",
      )}
      disabled={isPending}
    >
      {isPending ? <LoadingDots color="#808080" /> : <p>Create New Post</p>}
    </Button>
  );
}
