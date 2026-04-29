import * as command from "./command";
import {
    handleFollow,
    handleFollowing,
    handleAddFeed,
    handleAgg,
    handleListFeeds,
    handleLogin,
    handleRegister,
    handleReset,
    handleListUsers,
    handleUnfollow,
} from "./command-handlers";
import { middlewareLoggedIn } from "./middleware";

const commandRegistry = {};

async function main() {
    command.registerCommand(commandRegistry, "login", handleLogin);
    command.registerCommand(commandRegistry, "register", handleRegister);
    command.registerCommand(commandRegistry, "reset", handleReset);
    command.registerCommand(commandRegistry, "users", handleListUsers);
    command.registerCommand(commandRegistry, "agg", handleAgg);
    command.registerCommand(
        commandRegistry,
        "addfeed",
        middlewareLoggedIn(handleAddFeed),
    );
    command.registerCommand(commandRegistry, "feeds", handleListFeeds);
    command.registerCommand(
        commandRegistry,
        "follow",
        middlewareLoggedIn(handleFollow),
    );
    command.registerCommand(
        commandRegistry,
        "following",
        middlewareLoggedIn(handleFollowing),
    );

    command.registerCommand(
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
        await command.runCommand(commandRegistry, cmdName, ...args);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    process.exit(0);
}

main();
