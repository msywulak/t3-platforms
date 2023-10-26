import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

export default function Profile() {
  const session = useAuth();
  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div>
      Hi!
      <div>Again!</div>
    </div>
  );
}
