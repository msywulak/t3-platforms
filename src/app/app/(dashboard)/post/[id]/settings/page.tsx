import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { notFound, redirect } from "next/navigation";
import Form from "@/components/forms";
import { updatePostMetadata } from "@/lib/actions";
import DeletePostForm from "@/components/forms/delete-post-form";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function PostSettings({
  params,
}: {
  params: { id: number };
}) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }
  const data = await db.query.posts.findFirst({
    where: eq(posts.id, params.id),
  });

  if (!data) {
    notFound();
  }
  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 p-6">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Post Settings
        </h1>
        <Form
          title="Post Slug"
          description="The slug is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens."
          helpText="Please use a slug that is unique to this post."
          inputAttrs={{
            name: "slug",
            type: "text",
            defaultValue: data?.slug ?? "",
            placeholder: "slug",
          }}
          handleSubmit={updatePostMetadata}
        />

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
  );
}
