import { Options as ExecaOptions, execa } from "execa";
import { SystemPandaError, pathExists, userProjectDir } from "../util/index.js";

async function execPrismaScripts() {
	const options: ExecaOptions = {
		reject: false,
		stdio: ["inherit", "inherit", "pipe"],
	};

	console.log("🐼 Checking for Prisma files...");
	if (!pathExists("prisma") && !pathExists("prisma/schema.prisma")) {
		console.log("🐼 Executing: 'prisma init'...");
		const initCmd = await execa("npx", ["prisma", "init"], options);

		if (initCmd.failed) {
			throw new SystemPandaError({ level: "error", message: initCmd.stderr?.toString() });
		}
	}

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
