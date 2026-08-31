import process from "node:process";

const forwarded = process.argv.slice(2).filter((arg) => arg !== "--apply" && !arg.startsWith("--file="));
const file = process.argv.find((arg) => arg.startsWith("--file=")) || "--file=scripts/datasets/locations-agrigento-pilot.json";
process.argv = [process.argv[0], new URL("./import-catalog.mjs", import.meta.url).pathname, "--entity=location", file, ...forwarded, ...(process.argv.includes("--apply") ? ["--apply"] : [])];
await import("./import-catalog.mjs");
