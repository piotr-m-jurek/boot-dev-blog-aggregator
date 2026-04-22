import { setUser } from "./config";

const commandRegistry = {};

function main() {
    registerCommand(commandRegistry, "login", handlerLogin);

    const parsedArgs = process.argv.slice(2);
    if (parsedArgs.length === 0) {
        console.error("you have to pass at least one argument");
        process.exit(1);
    }

    const [cmdName, ...args] = parsedArgs;
    runCommand(commandRegistry, cmdName, ...args);
}

main();

// Meat
type CommandHandler = (commandName: string, ...args: string[]) => void;

type CommandRegistry = Record<string, CommandHandler>;

function registerCommand(
    registry: CommandRegistry,
    cmdName: string,
    handler: CommandHandler,
) {
    registry[cmdName] = handler;
}

function runCommand(
    registry: CommandRegistry,
    cmdName: string,
    ...args: string[]
) {
    const command = registry[cmdName];
    if (!command) {
        throw new Error(`Unknown command: ${cmdName}`);
    }

    command(cmdName, ...args);
}

function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error(
            "The login handler expects a single argument, the username.",
        );
    }

    const [username] = args;
    setUser(username);
    console.log("The user has been set.");
}
