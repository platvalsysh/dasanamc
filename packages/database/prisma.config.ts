import { defineConfig } from "prisma/config";

import { DIRECT_URL } from "@repo/env/server";

if (!DIRECT_URL) {
  throw new Error("DIRECT_URL is not defined");
}
console.log("DIRECT_URL:", DIRECT_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: DIRECT_URL,
  },
});
