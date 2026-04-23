import { registerCommand, runCommand } from "./command";
import {
    handlerAgg,
    handlerLogin,
    handlerRegister,
    handlerReset,
    handlerUsers,
} from "./command-handlers";

const commandRegistry = {};

async function main() {
    registerCommand(commandRegistry, "login", handlerLogin);
    registerCommand(commandRegistry, "register", handlerRegister);
    registerCommand(commandRegistry, "reset", handlerReset);
    registerCommand(commandRegistry, "users", handlerUsers);
    registerCommand(commandRegistry, "agg", handlerAgg);

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
