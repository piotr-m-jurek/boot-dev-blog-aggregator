import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readConfig } from "src/config";

const config = readConfig();
const queryClient = postgres(config.dbUrl);
export const db = drizzle({ client: queryClient });
