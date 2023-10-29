import { currentUser } from "@clerk/nextjs";
import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { sites } from "@/db/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSiteAuth(action: any) {
  return async (
    formData: FormData | null,
    siteId: string,
    key: string | null,
  ) => {
    const user = await currentUser();
    if (!user) {
      return {
        error: "Not authenticated",
      };
    }
    const site = await db.query.sites.findFirst({
      where: and(eq(sites.id, Number(siteId)), eq(sites.clerkId, user.id)),
    });
    if (!site) {
      return {
        error: "Not authorized",
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return action(formData, site, key);
  };
}
