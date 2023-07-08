import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { Collections, Database, pathExists, setDataStore, userProjectDir } from "../util/index.js";
import { databaseSeed } from "../collections/index.js";
import { execPrismaScripts } from "./execPrismaScripts.js";
import { getModels } from "./getModels.js";
import { makePrismaModel } from "./makePrismaModel.js";

async function database(db: Database, collections: Collections) {
	const generatedSchemaString = makePrismaModel(db, collections);

	if (!(await pathExists(`${userProjectDir}/prisma`))) await mkdir(`${userProjectDir}/prisma`);
	await writeFile(path.resolve(`${userProjectDir}/prisma/schema.prisma`), generatedSchemaString);
	await execPrismaScripts();

	const models = getModels(generatedSchemaString);

	console.log("🐼 Connecting to database...");

	const { PrismaClient } = await import("@prisma/client");
	const prisma = new PrismaClient({
		errorFormat: db.errorFormat,
		log: db.log,
		datasources: { db: { url: db.URI } },
	});

	setDataStore({ prisma });

	await databaseSeed();

	return models;
}

export { database };
