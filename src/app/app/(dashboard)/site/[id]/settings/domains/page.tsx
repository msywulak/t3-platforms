import { db } from "@/db";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { currentUser } from "@clerk/nextjs";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { sites } from "@/db/schema";
import { UpdateSiteDomainForm } from "@/components/forms/site/update-site-domains-form";

export default async function SiteSettingsDomains({
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
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Subdomain</CardTitle>
          <CardDescription>Customize your site subdomain.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <UpdateSiteDomainForm site={site} type="subdomain" />
        </CardContent>
      </Card>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Custom Domain</CardTitle>
          <CardDescription>Customize your sites custom domain.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <UpdateSiteDomainForm site={site} type="domain" />
        </CardContent>
      </Card>
    </>
  );
}
