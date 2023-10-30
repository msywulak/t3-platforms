import { type Node } from "unist";
import { visit } from "unist-util-visit";
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
