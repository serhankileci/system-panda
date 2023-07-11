import bcrypt from "bcrypt";
import { selectOnQuery, getDataStore } from "../util/index.js";

async function seed() {
	const { prisma, initFirstAuth, authFields } = getDataStore();
	const { collectionKey, secretField } = authFields;

	// await prisma.system_panda_settings.createMany();
	// await prisma.system_panda_plugins.createMany();

	if ((await prisma[collectionKey].count()) === 0) {
		console.log("🐼 Creating initial user...");

		const hash = await bcrypt.hash(
			initFirstAuth && initFirstAuth[secretField],
			await bcrypt.genSalt(10)
		);
		const data = {
			...initFirstAuth,
			[secretField]: hash,
			user_type: "admin",
		};

		await prisma[collectionKey].create({
			data,
			select: selectOnQuery(data, "*"),
		});

		console.log("🐼 Initial user created with the specified credentials.");
	}
}

export { seed };
