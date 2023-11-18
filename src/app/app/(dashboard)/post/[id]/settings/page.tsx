import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { notFound, redirect } from "next/navigation";
import Form from "@/components/forms";
import { updatePostMetadata } from "@/lib/actions";
import DeletePostForm from "@/components/forms/delete-post-form";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdatePostSlugForm } from "@/components/forms/post/update-post-slug-form";

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
        <CardContent className="flex flex-col space-y-4">Content</CardContent>
        <CardFooter>Max file size 50MB. Recommended size 1200x630.</CardFooter>
      </Card>

      <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
        <div className="flex flex-col space-y-6">
          <h1 className="font-cal text-3xl font-bold dark:text-white">
            Post Settings
          </h1>
          <Form
            title="Thumbnail image"
            description="The thumbnail image for your post. Accepted formats: .png, .jpg, .jpeg"
            helpText="Max file size 50MB. Recommended size 1200x630."
            inputAttrs={{
              name: "image",
              type: "file",
              defaultValue: data?.image ?? "",
            }}
            handleSubmit={updatePostMetadata}
          />

          <DeletePostForm postName={data?.title ?? ""} />
        </div>
      </div>
    </>
  );
}
