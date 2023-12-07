import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { notFound, redirect } from "next/navigation";
import { DeletePostForm } from "@/components/forms/post/delete-post-form";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdatePostSlugForm } from "@/components/forms/post/update-post-slug-form";
import { UpdatePostImageForm } from "@/components/forms/post/update-post-image-form";

export default async function PostSettings({
  params,
}: {
  params: { id: string };
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }
  const postId = Number(params.id);
  const data = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!data) {
    notFound();
  }
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Post Slug</CardTitle>
          <CardDescription>
            The slug is the URL-friendly version of the name. It is usually all
            lowercase and contains only letters, numbers, and hyphens.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <UpdatePostSlugForm post={data} />
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Thumbnail Image</CardTitle>
          <CardDescription>
            The thumbnail image for your post. Accepted formats: .png, .jpg,
            .jpeg
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <UpdatePostImageForm post={data} />
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Delete Post</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <DeletePostForm post={data} />
        </CardContent>
      </Card>
    </>
  );
}
