import { defineRelations } from "drizzle-orm";
import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export type Feed = typeof feeds.$inferSelect;
export type User = typeof users.$inferSelect;
export type FeedFollows = typeof feedFollows.$inferSelect;

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
    url: text("url").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    lastFetchedAt: timestamp(),
    id: uuid().primaryKey().defaultRandom().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const feedRelations = defineRelations({ feeds, users }, (r) => ({
    users: {
        feeds: r.one.feeds({ from: r.users.id, to: r.feeds.userId }),
    },
}));

export const feedFollows = pgTable(
    "feed_follows",
    {
        id: uuid("id").primaryKey().defaultRandom().notNull(),
        createdAt: timestamp().defaultNow().notNull(),
        updatedAt: timestamp()
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
        userId: uuid("user_id").references(() => users.id, {
            onDelete: "cascade",
        }),
        feedId: uuid("feed_id").references(() => feeds.id, {
            onDelete: "cascade",
        }),
    },
    (t) => [unique().on(t.userId, t.feedId)],
);

export const feedFollowsRelations = defineRelations(
    { feeds, users, feedFollows },
    (r) => ({
        users: {
            feeds: r.many.feeds({
                from: r.users.id.through(r.feedFollows.userId),
                to: r.feeds.id.through(r.feedFollows.feedId),
            }),
        },
        feeds: { subscribers: r.many.users() },
    }),
);
