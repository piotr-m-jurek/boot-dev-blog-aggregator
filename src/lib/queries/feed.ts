import { asc, eq, sql } from "drizzle-orm";
import { Feed, feeds, users } from "src/schema";
import { db } from "../db";
import { fetchFeed } from "src/feed";

export async function createFeed(
    feedName: string,
    url: string,
    userId: string,
) {
    const [result] = await db
        .insert(feeds)
        .values({ name: feedName, url, userId })
        .returning();
    return result;
}

export async function listFeeds() {
    return db
        .select({
            feedName: feeds.name,
            feedUrl: feeds.url,
            userName: users.name,
        })
        .from(feeds)
        .innerJoin(users, eq(users.id, feeds.userId));
}

export async function getFeedByUrl(url: string) {
    const resp = await db
        .select()
        .from(feeds)
        .where(eq(feeds.url, url))
        .limit(1);

    return resp[0];
}

export async function markFeedAsFetched(id: string) {
    const now = new Date();

    const [resp] = await db
        .update(feeds)
        .set({ updatedAt: now, lastFetchedAt: now })
        .where(eq(feeds.id, id))
        .returning();
    return resp;
}

export async function getNextFeedToFetch(): Promise<Feed> {
    const [_] = await db
        .select()
        .from(feeds)
        .orderBy(sql`${feeds.lastFetchedAt} asc nulls first`)
        .limit(1);
    return _;
}

export async function scrapeFeeds() {
    const feed = await getNextFeedToFetch();
    await markFeedAsFetched(feed.id);
    const feedData = await fetchFeed(feed.url);
    return { id: feed.id, ...feedData };
}
