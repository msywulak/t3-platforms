"use client";

import * as React from "react";
import {
  Card,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableBody,
  MultiSelect,
  MultiSelectItem,
  Badge,
} from "@tremor/react";
import type { Post, Site } from "@/db/schema";
import { env } from "@/env.mjs";

type PostWithSite = Post & { site: Site | null };

const colors = {
  Unpublished: "gray",
  Published: "emerald",
};

export default function PostsTable({ posts }: { posts: PostWithSite[] }) {
  const [selectedPosts, setSelectedPosts] = React.useState<string[]>([]);

  const isPostSelected = (post: Post) =>
    selectedPosts.includes(post.title!) || selectedPosts.length === 0;

  return (
    <Card>
      <MultiSelect
        onValueChange={setSelectedPosts}
        placeholder="Select Post..."
        className="max-w-xs"
      >
        {posts.map((post) => (
          <MultiSelectItem key={post.title} value={post.title ?? ""}>
            {post.title}
          </MultiSelectItem>
        ))}
      </MultiSelect>
      <Table className="mt-6">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell className="text-left">Description</TableHeaderCell>
            <TableHeaderCell className="text-left">Edit</TableHeaderCell>
            <TableHeaderCell className="text-left">URL</TableHeaderCell>
            <TableHeaderCell className="text-right">Status</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {posts
            .filter((post) => isPostSelected(post))
            .map((post) => (
              <TableRow key={post.title}>
                <TableCell>{post.title}</TableCell>
                <TableCell>
                  <span className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700">
                    {post.description}
                  </span>
                </TableCell>
                <TableCell className="text-left">
                  <a
                    href={`/post/${post.id}`}
                    className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                  >
                    Edit
                  </a>
                </TableCell>
                <TableCell className="text-left">
                  <a
                    href={
                      process.env.NEXT_PUBLIC_VERCEL_ENV
                        ? `https://${post.site!.subdomain}.${
                            env.NEXT_PUBLIC_ROOT_DOMAIN
                          }/${post.slug}`
                        : `http://${post.site!.subdomain}.localhost:3000/${
                            post.slug
                          }`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="truncate rounded-md bg-stone-100 px-2 py-1 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                  >
                    {`${post.site!.subdomain}.${env.NEXT_PUBLIC_ROOT_DOMAIN}/${
                      post.slug
                    }`}{" "}
                    ↗
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    color={colors[post.published ? "Published" : "Unpublished"]}
                    size="xs"
                  >
                    {post.published ? "Published" : "Unpublished"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Card>
  );
}
