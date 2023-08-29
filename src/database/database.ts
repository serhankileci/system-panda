import { getConfigStore, setDataStore } from "../util/index.js";
import { seed } from "./seed.js";
import { execPrismaScripts } from "./execPrismaScripts.js";
import { collectionFromModel } from "../collections/collectionFromModel.js";
import { makePrismaModel } from "../collections/makePrismaModel.js";

async function database() {
	const db = getConfigStore().settings.db;
	const generatedSchemaString = makePrismaModel(db);
	await execPrismaScripts(generatedSchemaString);
	const models = collectionFromModel(generatedSchemaString);

	console.log("🐼 Connecting to database...");
	const { PrismaClient } = await import("@prisma/client");
	const prisma = new PrismaClient({
		errorFormat: db.errorFormat,
		log: db.log,
		datasources: { db: { url: db.URI } },
	});

	setDataStore({ prisma, models });
	await seed();
}

export { database };
