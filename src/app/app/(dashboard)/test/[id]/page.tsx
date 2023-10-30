import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { notFound, redirect } from "next/navigation";
import Editor from "@/components/editor";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";

// export default function TestPage() {
//   return <div>PostPage</div>;
// }

export default async function PostPage({ params }: { params: { id: number } }) {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }
  const data = await db.query.posts.findFirst({
    where: eq(posts.id, params.id),
    with: {
      site: {
        columns: {
          subdomain: true,
        },
      },
    },
  });
  if (!data) {
    notFound();
  }

  return <Editor post={data} />;
}
