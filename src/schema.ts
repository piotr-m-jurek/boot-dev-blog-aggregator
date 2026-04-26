import { defineRelations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;

export const users = pgTable("users", {
    name: text("name").notNull().unique(),
    id: uuid().primaryKey().defaultRandom().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const feeds = pgTable("feeds", {
    name: text("name"),
    url: text("url").unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    id: uuid().primaryKey().defaultRandom().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const feedRelations = defineRelations({ feeds, users }, (r) => ({
    users: {
        feeds: r.one.feeds({
            from: r.users.id,
            to: r.feeds.userId,
        }),
    },
}));
