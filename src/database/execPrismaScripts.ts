import { Options as ExecaOptions, execa } from "execa";
import { SystemPandaError, pathExists, userProjectDir } from "../util/index.js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

async function execPrismaScripts(prismaSchema: string) {
	const options: ExecaOptions = {
		reject: false,
		stdio: ["inherit", "inherit", "pipe"],
	};

	console.log("🐼 Checking for Prisma files...");
	const prismaDir = `${userProjectDir}/prisma`;
	if (!(await pathExists(prismaDir))) await mkdir(prismaDir);
	await writeFile(path.resolve(`${prismaDir}/schema.prisma`), prismaSchema);

	const formatSchema = await execa("npx", ["prisma", "format"]);
	if (formatSchema.failed)
		throw new SystemPandaError({ level: "error", message: formatSchema.stderr?.toString() });

	console.log("🐼 Executing: 'prisma migrate dev'...");
	const migrateCmd = await execa(
		"npx",
		["prisma", "migrate", "dev", `--schema=${userProjectDir}/prisma/schema.prisma`],
		options
	);
	if (migrateCmd.failed) {
		throw new SystemPandaError({ level: "error", message: migrateCmd.stderr?.toString() });
	}

	console.log("🐼 Executing: 'prisma generate'...");
	const generateCmd = await execa(
		"npx",
		["prisma", "generate", `--schema=${userProjectDir}/prisma/schema.prisma`],
		options
	);
	if (generateCmd.failed) {
		throw new SystemPandaError({ level: "error", message: generateCmd.stderr?.toString() });
	}
}

export { execPrismaScripts };
