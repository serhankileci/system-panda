import bcrypt from "bcrypt";
import { CK, defaultAuthFields, log, selectOnQuery } from "../util/index.js";
import { PrismaClient } from "@prisma/client";

async function seed(db: PrismaClient, auth: Parameters<CK["authentication"]>["0"]) {
	if ((await db[auth.table!.name!].count()) === 0) {
		log("Creating initial user...", "info");

		const hash = await bcrypt.hash(
			auth.options.initial_User![auth.table!.secretField as "email"],
			await bcrypt.genSalt(10)
		);
		const data = {
			...auth.options.initial_User,
			[auth.table!.secretField!]: hash,
			[auth.table!.roleField!]: defaultAuthFields.roleField,
		};

		await db[auth.table!.name!].create({
			data,
			select: selectOnQuery(data, "*"),
		});

		log("Initial user created with the specified credentials.", "success");
	}
}

export { seed };
