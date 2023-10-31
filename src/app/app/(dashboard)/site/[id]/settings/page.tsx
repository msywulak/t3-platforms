import { db } from "@/db";
import { eq } from "drizzle-orm";
import { posts, sites } from "@/db/schema";
import { notFound, redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateSiteForm } from "@/components/form/update-site-form";

export default async function SiteSettingsIndex({
  params,
}: {
  params: { id: string };
}) {
  const siteId = Number(params.id);

  async function updateSite(fd: FormData) {
    "use server";

    const name = fd.get("name") as string;
    const description = fd.get("description") as string;

    await db
      .update(sites)
      .set({ name, description })
      .where(eq(sites.id, siteId));

    revalidateTag(`/site/${siteId}/settings`);
  }

  async function deleteSite() {
    "use server";

    await db.delete(sites).where(eq(sites.id, siteId));
    await db.delete(posts).where(eq(posts.siteId, siteId));

    const path = `/sites`;
    revalidatePath(path);
    redirect(path);
  }

  const site = await db.query.sites.findFirst({
    where: eq(sites.id, siteId),
  });

  if (!site) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card
        // as="section"
        id="update-store"
        aria-labelledby="update-store-heading"
      >
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Update your site</CardTitle>
          <CardDescription>
            Update your site name and description
          </CardDescription>
        </CardHeader>
      </Card>
      <CardContent>
        <UpdateSiteForm site={site} />
      </CardContent>
    </div>
  );
}
