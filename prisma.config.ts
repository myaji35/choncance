import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: "file:/Volumes/E_SSD/02_GitHub.nosync/0002_choncance(조준범 VINTEE)/prisma/dev.db",
  },
});
