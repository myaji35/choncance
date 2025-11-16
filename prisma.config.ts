import "dotenv/config";
import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/choncance?schema=public";
const DIRECT_URL = process.env.DIRECT_URL || DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: DATABASE_URL,
    directUrl: DIRECT_URL,
  },
});
