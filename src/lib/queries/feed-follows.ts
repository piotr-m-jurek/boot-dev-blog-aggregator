import { and, eq } from "drizzle-orm";
import { feedFollows, feeds, users } from "src/schema";
import { db } from "../db";
import { getFeedByUrl } from "./feed";

export async function createFeedFollow({
    feedId,
    userId,
}: {
    feedId: string;
    userId: string;
}) {
    const [newFeedFollow] = await db
        .insert(feedFollows)
        .values({ feedId, userId })
        .returning();

    const [additionalInfo] = await db
        .select()
        .from(feedFollows)
        .where(eq(feedFollows.id, newFeedFollow.id))
        .innerJoin(users, eq(users.id, feedFollows.userId))
        .innerJoin(feeds, eq(feeds.id, feedFollows.feedId));

    return additionalInfo;
}

export async function deleteFeedFollowRecord({
    userId,
    url,
}: {
    userId: string;
    url: string;
}) {
    const feed = await getFeedByUrl(url);
    await db
        .delete(feedFollows)
        .where(
            and(
                eq(feedFollows.userId, userId),
                eq(feedFollows.feedId, feed.id),
            ),
        );
}
