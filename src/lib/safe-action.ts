import { currentUser } from "@clerk/nextjs";
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
});
