// === Command ===
export type CommandHandler = (
    commandName: string,
    ...args: string[]
) => Promise<void>;

export type CommandRegistry = Record<string, CommandHandler>;

export function registerCommand(
    registry: CommandRegistry,
    cmdName: string,
    handler: CommandHandler,
) {
    registry[cmdName] = handler;
}

export async function runCommand(
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
