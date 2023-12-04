import { UserProfile, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { UpdateClerkProfileForm } from "@/components/forms/clerk-profile";
// import { type User } from "@clerk/nextjs/dist/types/server";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }
  // const parsedUser = JSON.parse(JSON.stringify(user)) as User;
  return (
    <>
      <UserProfile />
      {/* <div className="space-y-6">
        <Card
          // as="section"
          id="update-site"
          aria-labelledby="update-site-heading"
        >
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Profile</CardTitle>
            <CardDescription>Update your Profile Picture</CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateClerkProfileForm user={parsedUser} />
          </CardContent>
        </Card>
      </div> */}
    </>
  );
}
