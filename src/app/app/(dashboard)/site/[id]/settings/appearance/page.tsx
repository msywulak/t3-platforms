import { db } from "@/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateSiteAppearanceForm } from "@/components/forms/site/update-site-appearance-form";
import { currentUser } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import { ThumbnailCard } from "@/components/thumbnail-card";
import { eq } from "drizzle-orm";
import { sites } from "@/db/schema";

export default async function SiteSettingsAppearance({
  params,
}: {
  params: { id: string };
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sig-in");
  }

  const site = await db.query.sites.findFirst({
    where: eq(sites.id, Number(params.id)),
  });

  if (!site) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize your site&apos;s appearance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UpdateSiteAppearanceForm siteId={Number(params.id)} />
        <ThumbnailCard site={site} className="mt-8" />
      </CardContent>
    </Card>
  );
}
