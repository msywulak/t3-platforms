// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { type StoredFile } from "@/types";
import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  json,
  mysqlTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `t3-platforms_${name}`);

export const users = mysqlTable(
  "users",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    username: varchar("username", { length: 256 }),
    clerkId: varchar("clerk_id", { length: 256 }).unique(),
    githubId: varchar("github_id", { length: 256 }).unique(),
    email: varchar("email", { length: 256 }).unique(),
    image: text("image"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
  },
  (user) => ({
    clerkIdIdx: index("clerk_id_idx").on(user.clerkId),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  sites: many(sites),
}));

export const posts = mysqlTable(
  "posts",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    title: text("title"),
    description: text("description"),
    content: text("content"),
    slug: varchar("slug", { length: 256 })
      .unique()
      .$defaultFn(() => createId()),
    image: json("image").$type<StoredFile[] | null>().default(null),
    imageBlurhash: text("image_blurhash").default(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAhCAYAAACbffiEAAAACXBIWXMAABYlAAAWJQFJUiTwAAABfUlEQVR4nN3XyZLDIAwE0Pz/v3q3r55JDlSBplsIEI49h76k4opexCK/juP4eXjOT149f2Tf9ySPgcjCc7kdpBTgDPKByKK2bTPFEdMO0RDrusJ0wLRBGCIuelmWJAjkgPGDSIQEMBDCfA2CEPM80+Qwl0JkNxBimiaYGOTUlXYI60YoehzHJDEm7kxjV3whOQTD3AaCuhGKHoYhyb+CBMwjIAFz647kTqyapdV4enGINuDJMSScPmijSwjCaHeLcT77C7EC0C1ugaCTi2HYfAZANgj6Z9A8xY5eiYghDMNQBJNCWhASot0jGsSCUiHWZcSGQjaWWCDaGMOWnsCcn2QhVkRuxqqNxMSdUSElCDbp1hbNOsa6Ugxh7xXauF4DyM1m5BLtCylBXgaxvPXVwEoOBjeIFVODtW74oj1yBQah3E8tyz3SkpolKS9Geo9YMD1QJR1Go4oJkgO1pgbNZq0AOUPChyjvh7vlXaQa+X1UXwKxgHokB2XPxbX+AnijwIU4ahazAAAAAElFTkSuQmCC",
    ),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    published: boolean("published").default(false),
    siteId: bigint("site_id", { mode: "number" }),
    userId: bigint("user_id", { mode: "number" }),
    clerkId: varchar("clerk_id", { length: 256 }).notNull(),
  },
  (post) => ({
    siteIdIdx: index("site_id_idx").on(post.siteId),
    userIdIdx: index("user_id_idx").on(post.userId),
    clerkIdIdx: index("clerk_id_idx").on(post.clerkId),
  }),
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId, posts.clerkId],
    references: [users.id, users.clerkId],
  }),
  site: one(sites, {
    fields: [posts.siteId],
    references: [sites.id],
  }),
}));

export const sites = mysqlTable(
  "sites",
  {
    id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
    name: varchar("name", { length: 256 }),
    description: text("description"),
    font: varchar("font", { length: 256 }).default("font-sans"),
    logo: json("logo").$type<StoredFile[] | null>().default(null),
    image: json("image").$type<StoredFile[] | null>().default(null),
    imageBlurhash: text("image_blurhash").default(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAhCAYAAACbffiEAAAACXBIWXMAABYlAAAWJQFJUiTwAAABfUlEQVR4nN3XyZLDIAwE0Pz/v3q3r55JDlSBplsIEI49h76k4opexCK/juP4eXjOT149f2Tf9ySPgcjCc7kdpBTgDPKByKK2bTPFEdMO0RDrusJ0wLRBGCIuelmWJAjkgPGDSIQEMBDCfA2CEPM80+Qwl0JkNxBimiaYGOTUlXYI60YoehzHJDEm7kxjV3whOQTD3AaCuhGKHoYhyb+CBMwjIAFz647kTqyapdV4enGINuDJMSScPmijSwjCaHeLcT77C7EC0C1ugaCTi2HYfAZANgj6Z9A8xY5eiYghDMNQBJNCWhASot0jGsSCUiHWZcSGQjaWWCDaGMOWnsCcn2QhVkRuxqqNxMSdUSElCDbp1hbNOsa6Ugxh7xXauF4DyM1m5BLtCylBXgaxvPXVwEoOBjeIFVODtW74oj1yBQah3E8tyz3SkpolKS9Geo9YMD1QJR1Go4oJkgO1pgbNZq0AOUPChyjvh7vlXaQa+X1UXwKxgHokB2XPxbX+AnijwIU4ahazAAAAAElFTkSuQmCC",
    ),
    subdomain: varchar("subdomain", { length: 256 }).unique(),
    customDomain: varchar("custom_domain", { length: 256 }).unique(),
    message404: text("message404").default(
      "Blimey! You have found a page that does not exist.",
    ),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt").onUpdateNow(),
    userId: bigint("user_id", { mode: "number" }),
    clerkId: varchar("clerk_id", { length: 256 }).notNull(),
    clerkOrgId: varchar("clerk_org_id", { length: 256 }).notNull(),
  },
  (site) => ({
    userIdIdx: index("user_id_idx").on(site.userId),
    clerkIdIdx: index("clerk_id_idx").on(site.clerkId),
    clerkOrgIdIdx: index("clerk_org_id_idx").on(site.clerkOrgId),
  }),
);

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;

export const siteRelations = relations(sites, ({ one, many }) => ({
  user: one(users, {
    fields: [sites.id, sites.clerkId],
    references: [users.id, users.clerkId],
  }),
  posts: many(posts),
}));
