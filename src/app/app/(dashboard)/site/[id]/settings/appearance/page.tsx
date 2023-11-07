import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UpdateSiteAppearanceForm } from "@/components/form/update-site-appearance-form";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function SiteSettingsAppearance({
  params,
}: {
  params: { id: string };
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sig-in");
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
      </CardContent>
    </Card>
  );
}
