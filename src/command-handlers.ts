import { readConfig, setUser } from "./config";
import { fetchFeed } from "./feed";
import { createFeed, listFeeds } from "./lib/queries/feed";
import { createUser, deleteUsers, getUser, getUsers } from "./lib/queries/user";
import { printFeed } from "./print-feed";

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

export async function handlerAddFeed(_: string, name: string, url: string) {
    if (!name) {
        console.error("Name required when adding feed");
        process.exit(1);
    }

    if (!url) {
        console.error("URL required when adding feed");
        process.exit(1);
    }
    const config = readConfig();

    const currentUser = await getUser(config.currentUserName);
    if (!currentUser) {
        throw new Error("Couldn't find user in the database. Register first");
    }

    const resp = await createFeed(name, url, currentUser.id);

    printFeed(currentUser, resp);
}

export async function handlerListFeeds() {
    const resp = await listFeeds();
    const formatted = resp.map(
        (feed) => `${feed.feedName} (${feed.feedUrl}) - ${feed.userName}`,
    );

    console.log(formatted.join("\n"));
}
