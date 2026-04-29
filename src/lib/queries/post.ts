import { desc, eq, inArray } from "drizzle-orm";
import { feedFollows, posts, type User } from "src/schema";
import { db } from "../db";

export async function createPost({
    url,
    title,
    description,
    feedId,
    publishedAt,
}: {
    feedId: string;
    description?: string;
    url: string;
    title: string;
    publishedAt: Date;
}) {
    const [result] = await db
        .insert(posts)
        .values({ url, title, description, feedId, publishedAt })
        .returning();

    return result;
}

export async function getPostsForUser(user: User, limit = 10) {
    const userFeedFollows = await db
        .select({ feedId: feedFollows.feedId })
        .from(feedFollows)
        .where(eq(feedFollows.userId, user.id));

    const resp = await db
        .select()
        .from(posts)
        .where(
            inArray(
                posts.feedId,
                userFeedFollows.map((f) => f.feedId!),
            ),
        )
        .orderBy(desc(posts.publishedAt))
        .limit(limit);

    return resp;
}
