import { readConfig, setUser } from "./config";
import { fetchFeed } from "./feed";
import { createUser, deleteUsers, getUser, getUsers } from "./lib/queries/user";

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
        console.error("well something went wrong", e)
        process.exit(1);
    }
}
