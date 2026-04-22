import { getConfig, setUser } from "./config";

function main() {
    setUser("Piotr");
    const config = getConfig();
    console.log(config);
}

main();
