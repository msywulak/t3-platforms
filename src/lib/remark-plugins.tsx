import { type Node } from "unist";
import { visit } from "unist-util-visit";
import { db } from "@/db";
import { examples } from "@/db/schema";
import type { Example } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { type ReactNode } from "react";

interface TweetLinkNode extends Node {
  url: string;
  type: string;
  name: string;
  attributes?: Array<{
    type: "mdxJsxAttribute";
    name: string;
    value: string;
  }>;
}

interface ExamplesNode extends Node {
  name: string;
  attributes?: Array<{
    type: "mdxJsxAttribute";
    name: string;
    value: string;
  }>;
}

export function replaceLinks({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
  // this is technically not a remark plugin but it
  // replaces internal links with <Link /> component
  // and external links with <a target="_blank" />
  return href?.startsWith("/") ?? href === "" ? (
    <Link href={href} className="cursor-pointer">
      {children}
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children} ↗
    </a>
  );
}

export function replaceTweets() {
  return (tree: Node) =>
    new Promise<void>((resolve, reject) => {
      const nodesToChange: Array<{ node: TweetLinkNode }> = [];

      visit(tree, "link", (node: Node) => {
        const tweetLinkNode = node as TweetLinkNode;

        if (
          tweetLinkNode.url?.match(
            /https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)([^\?])(\?.*)?/g,
          )
        ) {
          nodesToChange.push({
            node: tweetLinkNode,
          });
        }
      });

      for (const { node } of nodesToChange) {
        try {
          const regex = /\/status\/(\d+)/gm;
          const matches = regex.exec(node.url);

          if (!matches) throw new Error(`Failed to get tweet: ${node.url}`);

          const id = matches[1];

          if (id === undefined)
            throw new Error(`Failed to extract tweet ID from URL: ${node.url}`);

          node.type = "mdxJsxFlowElement";
          node.name = "Tweet";
          node.attributes = [
            {
              type: "mdxJsxAttribute",
              name: "id",
              value: id,
            },
          ];
        } catch (e) {
          console.log("ERROR", e);
          return reject(e);
        }
      }

      resolve();
    });
}

export function replaceExamples() {
  return async (tree: Node): Promise<void> => {
    const nodesToChange: Array<{ node: ExamplesNode }> = [];

    visit(tree, "mdxJsxFlowElement", (node: Node) => {
      const examplesNode = node as ExamplesNode;

      if (examplesNode.name === "Examples") {
        nodesToChange.push({
          node: examplesNode,
        });
      }
    });

    for (const { node } of nodesToChange) {
      try {
        const data = await getExamples(node);
        node.attributes = [
          {
            type: "mdxJsxAttribute",
            name: "data",
            value: data,
          },
        ];
      } catch (e) {
        throw e;
      }
    }
  };
}
async function getExamples(node: ExamplesNode): Promise<string> {
  if (!node.attributes) throw new Error("Node has no attributes");

  const names = node.attributes[0]?.value.split(",");
  const data: Example[] = [];

  if (!names) throw new Error("No names found");

  for (const name of names) {
    const results = await db
      .select()
      .from(examples)
      .where(eq(examples.id, parseInt(name)));

    if (results.length > 0) {
      const result = results[0];
      if (result) {
        data.push(result); // push the first element of the results array
      }
    }
  }

  return JSON.stringify(data);
}
