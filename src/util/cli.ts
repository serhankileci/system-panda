#!/usr/bin/env node
import { execa } from "execa";
import { SystemPandaError, logfile, logger } from "./index.js";

(async () => {
	try {
		await execa("prisma", process.argv.slice(3), {
			stdio: "inherit",
			reject: false,
		});
	} catch (err: unknown) {
		console.log(err);
		await logger(logfile, err as SystemPandaError | Error);
	}
})();
