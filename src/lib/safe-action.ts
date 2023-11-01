import { db } from "@/db";
import { sites } from "@/db/schema";
import { currentUser } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { createSafeActionClient } from "next-safe-action";

export const action = createSafeActionClient();

export const authAction = createSafeActionClient({
  async middleware() {
    const user = await currentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }
    return { userId: user.id };
  },
  handleReturnedServerError(e) {
    return { serverError: e.message };
  },
});

export const siteAuthAction = createSafeActionClient({
  async middleware() {
    const user = await currentUser();
    if (!user) {
      throw new Error("Not authenticated");
    }
    const allSites = await db.query.sites.findMany({
      where: eq(sites.clerkId, user.id),
    });
    if (allSites.length === 0) {
      throw new Error("Not authenticated");
    }
    return { userId: user.id, allSites };
  },
});
