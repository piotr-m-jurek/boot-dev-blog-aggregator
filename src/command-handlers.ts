import { readConfig, setUser } from "./config";
import { fetchFeed } from "./feed";
import { printFeed } from "./lib/print-feed";
import { createFeed, getFeedByUrl, listFeeds } from "./lib/queries/feed";
import {
    createFeedFollow,
    deleteFeedFollowRecord,
} from "./lib/queries/feed-follows";
import {
    createUser,
    deleteUsers,
    getFeedFollowsForUser,
    getUser,
    getUsers,
} from "./lib/queries/user";
import { User } from "./schema";

export async function handlerLogin(_: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(
            "The login handler expects a single argument, the username.",
        );
    }

    const [username] = args;
    const response = await getUser(username);
    if (!response) {
        throw new Error("Couldn't find user in the database. Register first");
    }
    setUser(username);
    console.log("The user has been set.");
}

export async function handlerRegister(_: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(
            "The register handler expects a single argument, the username.",
        );
    }

    const [username] = args;

    const exists = await getUser(username);
    if (exists) {
        console.error("User already exists.");
        process.exit(1);
    }

    try {
        await createUser(username);
        setUser(username);
        console.log("The user has been created.");
    } catch (e) {
        console.error(e);
        throw new Error("User already exists", { cause: e });
    }
}

export async function handlerReset() {
    try {
        await deleteUsers();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

export async function handlerUsers() {
    try {
        const config = readConfig();
        const resp = await getUsers();
        const formattedUsers = resp
            .map((user) => {
                if (user.name === config.currentUserName) {
                    return `* ${user.name} (current)`;
                }

                return `* ${user.name}`;
            })
            .join("\n");
        console.log(formattedUsers);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

export async function handlerAgg() {
    try {
        const result = await fetchFeed("https://www.wagslane.dev/index.xml");
        console.log(JSON.stringify(result));
        process.exit(0);
    } catch (e) {
        // todo: more catching
        console.error("well something went wrong", e);
        process.exit(1);
    }
}

export async function handlerAddFeed(
    _: string,
    user: User,
    name: string,
    url: string,
) {
    if (!name) {
        console.error("Name required when adding feed");
        process.exit(1);
    }

    if (!url) {
        console.error("URL required when adding feed");
        process.exit(1);
    }

    const resp = await createFeed(name, url, user.id);
    await createFeedFollow({ userId: user.id, feedId: resp.id });
    printFeed(user, resp);
}

export async function handlerListFeeds() {
    const resp = await listFeeds();
    const formatted = resp.map(
        (feed) => `${feed.feedName} (${feed.feedUrl}) - ${feed.userName}`,
    );

    console.log(formatted.join("\n"));
}

export async function handleFollow(_: string, user: User, url: string) {
    const feed = await getFeedByUrl(url);
    const resp = await createFeedFollow({ userId: user.id, feedId: feed.id });

    console.log(`Feed (${resp.feeds.name}) created for: ${resp.users.name}`);
}

export async function handleFollowing(_: string, user: User) {
    const resp = await getFeedFollowsForUser(user.name);

    const formatted = resp.map((item) => `- ${item.feeds.name}`);
    console.log(resp);

    console.log(formatted.join("\n"));
}

export async function handleUnfollow(_: string, user: User, url: string) {
     await deleteFeedFollowRecord({ url, userId: user.id });
}
