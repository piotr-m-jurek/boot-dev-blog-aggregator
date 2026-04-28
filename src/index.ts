import { registerCommand, runCommand } from "./command";
import {
    handleFollow,
    handleFollowing,
    handlerAddFeed,
    handlerAgg,
    handlerListFeeds,
    handlerLogin,
    handlerRegister,
    handlerReset,
    handlerUsers,
    handleUnfollow,
} from "./command-handlers";
import { middlewareLoggedIn } from "./middleware";

const commandRegistry = {};

async function main() {
    registerCommand(commandRegistry, "login", handlerLogin);
    registerCommand(commandRegistry, "register", handlerRegister);
    registerCommand(commandRegistry, "reset", handlerReset);
    registerCommand(commandRegistry, "users", handlerUsers);
    registerCommand(commandRegistry, "agg", handlerAgg);
    registerCommand(
        commandRegistry,
        "addfeed",
        middlewareLoggedIn(handlerAddFeed),
    );
    registerCommand(commandRegistry, "feeds", handlerListFeeds);
    registerCommand(
        commandRegistry,
        "follow",
        middlewareLoggedIn(handleFollow),
    );
    registerCommand(
        commandRegistry,
        "following",
        middlewareLoggedIn(handleFollowing),
    );

    registerCommand(
        commandRegistry,
        "unfollow",
        middlewareLoggedIn(handleUnfollow),
    );

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
