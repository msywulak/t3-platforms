"use client";

import * as React from "react";
import Image from "next/image";
import { type Site, type Post } from "@/db/schema";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";
import { Icons } from "./icons";
import PostCard from "./post-card";
import PostsTable from "./posts-table";

type PostWithSite = Post & { site: Site | null };

export default function Posts({ posts }: { posts: PostWithSite[] }) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return posts.length > 0 ? (
    <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
      <TabList variant="solid">
        <Tab icon={Icons.dashboard}>Cards</Tab>
        <Tab icon={Icons.rows}>List</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {posts.map((post) => (
              <PostCard key={post.id} data={post} />
            ))}
          </div>
        </TabPanel>
        <TabPanel>
          <PostsTable posts={posts} />
        </TabPanel>
      </TabPanels>
    </TabGroup>
  ) : (
    <div className="mt-20 flex flex-col items-center space-x-4">
      <h1 className="text-4xl">No Posts Yet</h1>
      <Image
        alt="missing post"
        src="https://illustrations.popsy.co/gray/web-design.svg"
        width={400}
        height={400}
      />
      <p className="text-lg text-stone-500">
        You do not have any posts yet. Create one to get started.
      </p>
    </div>
  );
}
