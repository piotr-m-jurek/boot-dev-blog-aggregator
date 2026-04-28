import { eq } from "drizzle-orm";
import { feeds, users } from "src/schema";
import { db } from "../db";

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
