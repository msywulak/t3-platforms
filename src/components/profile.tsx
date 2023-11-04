import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs";
import { LogOutButtons } from "@/components/auth/logout-buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";

export default async function Profile() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full flex-1 items-center justify-start space-x-3 rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.imageUrl}
              alt={`${user.firstName} ${user.lastName}` ?? "User avatar"}
            />
            <AvatarFallback>{user.firstName}</AvatarFallback>
          </Avatar>
          <span className="truncate text-sm font-medium">
            {user.firstName} {user.lastName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <Icons.avatar className="mr-2 h-4 w-4" aria-hidden="true" />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/">
              <Icons.dashboard className="mr-2 h-4 w-4" aria-hidden="true" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild disabled>
            <Link href="/settings">
              <Icons.gear className="mr-2 h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/sign-out">
            <Icons.exit className="mr-2 h-4 w-4" aria-hidden="true" />
            Log out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // return (
  //   <div className="flex w-full items-center justify-between">
  //     <Link
  //       href="/settings"
  //       className="flex w-full flex-1 items-center space-x-3 rounded-lg px-2 py-1.5 transition-all duration-150 ease-in-out hover:bg-stone-200 active:bg-stone-300 dark:text-white dark:hover:bg-stone-700 dark:active:bg-stone-800"
  //     >
  //       <Image
  //         src={
  //           user.imageUrl ??
  //           `https://avatar.vercel.sh/${user.primaryEmailAddressId}`
  //         }
  //         width={40}
  //         height={40}
  //         alt={`${user.firstName} ${user.lastName}` ?? "User avatar"}
  //         className="h-6 w-6 rounded-full"
  //       />
  // <span className="truncate text-sm font-medium">
  //   {user.firstName} {user.lastName}
  // </span>
  //     </Link>
  //     <LogOutButtons />
  //   </div>
  // );
}
