#!/usr/bin/env node
import { execa } from "execa";
import { logToFile } from "./index.js";

(async () => {
	try {
		const cmds: { int: string[]; ext: string[] } = {
			int: [],
			ext: ["prisma"],
		};
		const [bin, ...rest] = process.argv.slice(2);
		const options = {
			stdio: "inherit",
			reject: false,
		} as const;

		if (cmds.ext.includes(bin)) {
			await execa(bin, rest, options);
		} else if (cmds.int.includes(bin)) {
			// internal scripts
			// ...
		} else {
			throw "Command not found.";
		}
	} catch (err: unknown) {
		await logToFile(err as Error);
	}
})();
