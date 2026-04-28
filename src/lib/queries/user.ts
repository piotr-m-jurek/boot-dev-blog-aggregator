import { eq } from "drizzle-orm";
import { feedFollows, feeds, users } from "src/schema";
import { db } from "../db";

export async function createUser(userName: string) {
    const [result] = await db
        .insert(users)
        .values({ name: userName })
        .returning();
    return result;
}

export async function getUser(userName: string) {
    try {
        const [result] = await db
            .select()
            .from(users)
            .where(eq(users.name, userName));

        return result;
    } catch {
        return null;
    }
}

export async function deleteUsers() {
    await db.delete(users);
}

export async function getUsers() {
    return db.select().from(users);
}

export async function getFeedFollowsForUser(username: string) {
    const user = await getUser(username);
    if (!user) {
        throw new Error("Couldn't find user in the database. Register first");
    }

    return db
        .select()
        .from(feedFollows)
        .where(eq(feedFollows.userId, user.id))
        .innerJoin(users, eq(users.id, feedFollows.userId))
        .innerJoin(feeds, eq(feeds.id, feedFollows.feedId));
}
