import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { AuthSession, NormalizedAuthFields, selectOnQuery } from "../util/index.js";

async function databaseSeed(
	prisma: PrismaClient,
	normalizedAuthFields: NormalizedAuthFields,
	initFirstAuth: AuthSession["initFirstAuth"]
) {
	const { collectionKey, secretField } = normalizedAuthFields;
	// await prisma.systemPandaSettings.createMany();
	// await prisma.systemPandaPlugins.createMany();

	if ((await prisma[collectionKey].count()) === 0) {
		console.log("🐼 Creating initial user...");

		const hash = await bcrypt.hash(initFirstAuth[secretField], await bcrypt.genSalt(10));
		const data = {
			...initFirstAuth,
			[secretField]: hash,
		};

		await prisma[collectionKey].create({
			data,
			select: selectOnQuery(data, "*"),
		});

		console.log("🐼 Initial user created with the specified credentials.");
	}
}

export { databaseSeed };
