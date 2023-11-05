import { currentUser } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  thumbnailAndLogo: f({ image: { maxFileSize: "64MB" } })
    .middleware(async (_req) => {
      const user = await currentUser();
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    // eslint-disable-next-line @typescript-eslint/require-await
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
