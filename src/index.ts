#!/usr/bin/env node
import { runCli } from "./cli";
import { printError } from "./ui";

runCli(process.argv.slice(2)).catch((error: unknown) => {
	printError(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});
