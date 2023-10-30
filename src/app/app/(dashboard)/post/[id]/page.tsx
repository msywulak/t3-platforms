// import { currentUser } from "@clerk/nextjs";
// import { db } from "@/db";
// import { notFound, redirect } from "next/navigation";
// import Editor from "@/components/editor";
// import { posts } from "@/db/schema";
// import { eq } from "drizzle-orm";

export default function PostPage() {
  return <div>PostPage</div>;
}

// export default async function PostPage({ params }: { params: { id: number } }) {
//   const user = await currentUser();
//   if (!user) {
//     redirect("/login");
//   }
//   const data = await db.query.posts.findFirst({
//     where: eq(posts.id, params.id),
//     with: {
//       site: {
//         columns: {
//           subdomain: true,
//         },
//       },
//     },
//   });
//   if (!data) {
//     notFound();
//   }

//   return <Editor post={data} />;
// }

// import Posts from "@/components/posts";
// import CreatePostButton from "@/components/create-post-button";
// import { sites } from "@/db/schema";
// import { and } from "drizzle-orm";
// import { env } from "@/env.mjs";

// export default async function SitePosts({
//   params,
// }: {
//   params: { id: number };
// }) {
//   const user = await currentUser();
//   if (!user) {
//     redirect("/login");
//   }
//   const data = await db.query.sites.findFirst({
//     where: and(eq(sites.id, params.id), eq(sites.clerkId, user.id)),
//   });

//   if (!data) {
//     notFound();
//   }

//   const url = `${data.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}`;

//   return (
//     <>
//       <div className="flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
//         <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
//           <h1 className="font-cal w-60 truncate text-xl font-bold dark:text-white sm:w-auto sm:text-3xl">
//             All Posts for {data.name}
//           </h1>
//           <a
//             href={
//               process.env.NEXT_PUBLIC_VERCEL_ENV
//                 ? `https://${url}`
//                 : `http://${data.subdomain}.localhost:3000`
//             }
//             target="_blank"
//             rel="noreferrer"
//             className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
//           >
//             {url} ↗
//           </a>
//         </div>
//         <CreatePostButton />
//       </div>
//       <Posts siteId={params.id} />
//     </>
//   );
// }
