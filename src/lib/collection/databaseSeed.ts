import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { selectOnQuery } from "../../util/selectOnQuery.js";

async function databaseSeed(prisma: PrismaClient) {
	const stdlibPlugins = [{}];
	const internalTables = Object.keys(prisma).filter(x => !x.startsWith("$"));

	if (!internalTables.includes("systemPandaSettings")) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// await prisma.systemPandaSettings.createMany({
		// 	data: [],
		// });
	}

	if (!internalTables.includes("systemPandaPlugins")) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		// await prisma.systemPandaPlugins.createMany({
		// 	data: [],
		// });
	}

	if (!internalTables.includes("users")) {
		const saltRounds = 10;
		const pw = randomUUID();
		const salt = await bcrypt.genSalt(saltRounds);
		const hash = await bcrypt.hash(pw, salt);

		const userData = {
			email: "admin@systempanda.com",
			// name: "Admin",
			// password: hash,
		};

		await prisma.users.create({
			data: userData,
			select: selectOnQuery(userData, "*"),
		});

		console.log(
			`Your initial auto-generated password is: ${hash}, you should change it. It was also written to "system-panda.log".`
		);
	}
}

export { databaseSeed };
