import fs from "node:fs";
import os from "node:os";
import path from "node:path";

class ParseError extends Error {}

export type Config = {
    dbUrl: string;
    currentUserName: string;
};

export function setUser(username: string) {
    writeConfig({ ...readConfig(), currentUserName: username });
}

/** @throws ParseError */
export function readConfig() {
    const rawConfig = fs.readFileSync(getConfigFilePath(), {
        encoding: "utf-8",
    });
    return validateConfig(rawConfig);
}

function validateConfig(rawConfig: string): Config {
    try {
        const json = JSON.parse(rawConfig);
        return {
            dbUrl: json.db_url,
            currentUserName: json.current_user_name,
        };
    } catch {
        throw new ParseError("error validating config");
    }
}

function writeConfig(cfg: Config): void {
    const data = JSON.stringify(
        {
            db_url: cfg.dbUrl,
            current_user_name: cfg.currentUserName,
        },
        null,
        4,
    );

    fs.writeFileSync(getConfigFilePath(), data, { encoding: "utf-8" });
}

function getConfigFilePath(): string {
    const configName = ".gatorconfig.json";
    return path.join(os.homedir(), configName);
}
