import { Options as ExecaOptions, execa } from "execa";
import { ContentKittyError, log, pathExists, userDir } from "../util/index.js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

async function prismaScripts(prismaSchema: string) {
	const options: ExecaOptions = {
		reject: false,
		stdio: ["inherit", "inherit", "pipe"],
	};

	log("Checking for Prisma files...", "info");

	const prismaDir = `${userDir}/prisma`;
	const prismaDirExists = await pathExists(prismaDir);

	if (!prismaDirExists) {
		await mkdir(prismaDir);
	}

	await writeFile(path.resolve(`${prismaDir}/schema.prisma`), prismaSchema);

	const formatSchema = await execa("npx", ["prisma", "format"]);
	if (formatSchema.failed)
		throw new ContentKittyError({ level: "error", message: formatSchema.stderr?.toString() });

	log("Executing: 'prisma migrate dev'...", "info");

	const migrateCmd = await execa(
		"npx",
		["prisma", "migrate", "dev", `--schema=${userDir}/prisma/schema.prisma`],
		options
	);
	if (migrateCmd.failed) {
		throw new ContentKittyError({ level: "error", message: migrateCmd.stderr?.toString() });
	}

	log("Executing: 'prisma generate'...", "info");

	const generateCmd = await execa(
		"npx",
		["prisma", "generate", `--schema=${userDir}/prisma/schema.prisma`],
		options
	);

	if (generateCmd.failed) {
		throw new ContentKittyError({ level: "error", message: generateCmd.stderr?.toString() });
	}
}

export { prismaScripts };
