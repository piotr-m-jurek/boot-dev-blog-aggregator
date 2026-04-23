import { readConfig, setUser } from "./config";
import { createUser, deleteUsers, getUser, getUsers } from "./lib/queries/user";

const commandRegistry = {};

async function main() {
    registerCommand(commandRegistry, "login", handlerLogin);
    registerCommand(commandRegistry, "register", handlerRegister);
    registerCommand(commandRegistry, "reset", handlerReset);
    registerCommand(commandRegistry, "users", handlerUsers);

    const parsedArgs = process.argv.slice(2);
    if (parsedArgs.length === 0) {
        console.error("you have to pass at least one argument");
        process.exit(1);
    }

    const [cmdName, ...args] = parsedArgs;
    try {
        await runCommand(commandRegistry, cmdName, ...args);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    process.exit(0);
}

main();

// === Command ===
type CommandHandler = (commandName: string, ...args: string[]) => Promise<void>;

type CommandRegistry = Record<string, CommandHandler>;

function registerCommand(
    registry: CommandRegistry,
    cmdName: string,
    handler: CommandHandler,
) {
    registry[cmdName] = handler;
}

async function runCommand(
    registry: CommandRegistry,
    cmdName: string,
    ...args: string[]
) {
    const command = registry[cmdName];
    if (!command) {
        throw new Error(`Unknown command: ${cmdName}`);
    }

    await command(cmdName, ...args);
}

// === Handlers ===
async function handlerLogin(_: string, ...args: string[]) {
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

async function handlerRegister(_: string, ...args: string[]) {
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

async function handlerReset() {
    try {
        await deleteUsers();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

async function handlerUsers() {
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
