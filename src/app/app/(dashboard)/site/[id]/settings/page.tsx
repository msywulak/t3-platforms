import { db } from "@/db";
import { eq } from "drizzle-orm";
import { sites } from "@/db/schema";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateSiteGeneralForm } from "@/components/forms/site/update-site-general-form";

export default async function SiteSettingsIndex({
  params,
}: {
  params: { id: string };
}) {
  const siteId = Number(params.id);

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
        <UpdateSiteGeneralForm site={site} />
      </CardContent>
    </div>
  );
}
