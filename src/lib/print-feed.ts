import type { Feed, User } from "./schema";

export function printFeed(user: User, feed: Feed) {
    console.log(user);
    console.log(feed);
}
