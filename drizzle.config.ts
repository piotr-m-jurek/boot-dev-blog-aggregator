import { defineConfig } from "drizzle-kit";
import { getConfig } from "./src/config";

const config = getConfig();

export default defineConfig({
    schema: "src/schema.ts",
    out: "src/lib/db",
    dialect: "postgresql",
    dbCredentials: {
        url: config.dbUrl,
    },
});
