import { type Config } from "drizzle-kit";

import { env } from "@/env.mjs";

export default {
  schema: "./src/db/schema.ts",
  driver: "mysql2",
  out: "./drizzle",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
    // uri: env.DATABASE_URL, -- when https://github.com/drizzle-team/drizzle-orm/issues/1428 is fixed
  },
  tablesFilter: ["t3-platforms_*"],
} satisfies Config;
