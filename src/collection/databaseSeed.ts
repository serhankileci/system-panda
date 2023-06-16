import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { SystemPandaError, logfile, logger, selectOnQuery } from "../util/index.js";

async function databaseSeed(prisma: PrismaClient) {
	// await prisma.systemPandaSettings.createMany();
	// await prisma.systemPandaPlugins.createMany();

	if ((await prisma.users.count()) === 0) {
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

		await logger(
			logfile,
			new SystemPandaError({
				level: "informative",
				message: `Initial user created. Email: admin@systempanda.com, password: ${hash}.`,
			})
		);
		console.log(
			`Your initial auto-generated password is: ${hash}, you should change it. It was also written to "system-panda.log".`
		);
	}
}

export { databaseSeed };
