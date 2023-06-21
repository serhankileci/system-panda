import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { selectOnQuery } from "../util/index.js";

async function databaseSeed(prisma: PrismaClient) {
	// await prisma.systemPandaSettings.createMany();
	// await prisma.systemPandaPlugins.createMany();

	if ((await prisma.users.count()) === 0) {
		console.log("🐼 Creating initial user...");
		const pw = randomUUID();
		const hash = await bcrypt.hash(pw, await bcrypt.genSalt(10));
		const userData = {
			email: "admin@systempanda.com",
			name: "Admin",
			password: hash,
		};
		await prisma.users.create({
			data: userData,
			select: selectOnQuery(userData, "*"),
		});

		console.log(`🐼 Initial user created. Email: admin@systempanda.com, password: ${hash}.`);
	}
}

export { databaseSeed };
