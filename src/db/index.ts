import {PrismaClient} from "@prisma/client";
import {makePrismaModel} from "./makePrismaModel";
import {Collection, Collections, Database} from "./types";
import {execPrismaScripts} from "./execPrismaScripts";
import {databaseSeed} from "../lib";
import {pathExists, projectDir} from "../util";
import {mkdir, writeFile} from "node:fs/promises";
import path from "path";


async function generateSchema(
	db: Database,
	databaseColelctions: {
	collections: Collections,
	usersCollection: { [p: string]: Collection },
	internalCollections: { systemPandaSettings: Collection, systemPandaPlugins: Collection }
}): Promise<string> {
	return await makePrismaModel({
			...databaseColelctions.collections,
			...databaseColelctions.usersCollection,
			...databaseColelctions.internalCollections,
		},
		db);
}

function getModels(schemaString: string): any {
	const modelRegex = /model\s+(\w+)\s*{([\s\S]*?)}/g;
	const models: any = {};
	let match;
	while ((match = modelRegex.exec(schemaString)) !== null) {
		const modelName = match[1];
		const fieldsContent = match[2].trim();

		const fields = fieldsContent
			.split("\n")
			.map(line => line.trim().split(" ")[0])
			.filter(field => field !== "");

		fields.forEach(x => {
			if (!models[modelName]) models[modelName] = {};
			if (models[modelName]) models[modelName][x] = null;
		});
	}
	return models;
}

export async function setupDatabase(db: Database, databaseColelctions: {
	collections: Collections,
	usersCollection: { [p: string]: Collection },
	internalCollections: { systemPandaSettings: Collection, systemPandaPlugins: Collection }
}): Promise<{
	prisma: any,
	models: any
}> {
	const schemastring = await generateSchema(db, databaseColelctions);
	if (!(await pathExists(`${projectDir}/prisma`))) await mkdir(`${projectDir}/prisma`);
	await writeFile(path.resolve(`${projectDir}/prisma/schema.prisma`), schemaString);
	await execPrismaScripts();
	const models = getModels(schemastring);
	const prisma = new PrismaClient({
		errorFormat: db.errorFormat,
		log: db.log,
		datasources: { db: { url: db.URI } },
	});
	await databaseSeed(prisma);

	return {
		prisma,
		models,
	};
}
