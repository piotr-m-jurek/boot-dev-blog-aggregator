import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const connectionString = "postgres://mj:@localhost:5432/gator?sslmode=disabled";

export const users = pgTable("users", {
    id: uuid().primaryKey().defaultRandom().notNull(),
    name: text("name").notNull().unique(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
