import type { CommandHandler, UserCommandHandler } from "src/command";
import { readConfig } from "src/config";
import { getUser } from "src/lib/queries/user";

export function middlewareLoggedIn(
    handler: UserCommandHandler,
): CommandHandler {
    return async (cmdName: string, ...args: string[]) => {
        const config = readConfig();
        const user = await getUser(config.currentUserName);
        if (!user) {
            throw new Error(
                "Couldn't find user in the database. Register first",
            );
        }
        return await handler(cmdName, user, ...args);
    };
}
