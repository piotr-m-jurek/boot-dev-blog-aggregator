import { readConfig, setUser } from "./config";
import { fetchFeed } from "./feed";
import { parseDuration } from "./lib/duration";
import { printFeed } from "./lib/print-feed";
import {
    createFeed,
    getFeedByUrl,
    listFeeds,
    scrapeFeeds,
} from "./lib/queries/feed";
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
import type { User } from "./schema";

export async function handleLogin(_: string, ...args: string[]) {
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

export async function handleRegister(_: string, ...args: string[]) {
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

export async function handleReset() {
    try {
        await deleteUsers();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

export async function handleListUsers() {
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

export async function handleAgg(_: string, timeBetweenReqs: string) {
    const durationMs = parseDuration(timeBetweenReqs);
    if (!durationMs) {
        console.error(
            "Duration format error: <amount><unit> (eg. 1m, 50ms, 5h, 4s)",
        );
        process.exit(1);
    }
    console.log(`Collecting feeds every ${durationMs} ms`);

    scrapeFeeds().catch(handleError);

    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, durationMs);

    await new Promise<void>((resolve) => {
        process.on("SIGINT", () => {
            console.log("Shutting down feed aggregator...");
            clearInterval(interval);
            resolve();
        });
    });

    function handleError(e: unknown) {
        console.error(
            "something went wrong while scraping feeds",
            JSON.stringify(e),
        );
        process.exit(1);
    }
}

export async function handleAddFeed(
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

export async function handleListFeeds() {
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

    console.log(formatted.join("\n"));
}

export async function handleUnfollow(_: string, user: User, url: string) {
    await deleteFeedFollowRecord({ url, userId: user.id });
}
