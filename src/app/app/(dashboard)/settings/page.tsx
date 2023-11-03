import { UserProfile, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <>
      <UserProfile />
    </>
  );
}
