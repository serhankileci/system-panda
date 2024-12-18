import { checkOverlappingTables, populateInternalTables, makePrismaModel } from "./tables/index.js";
import { prismaScripts, seed } from "./database/index.js";
import { server } from "./server/index.js";
import { CK, ContentKittyError, Table, log, logToFile, store } from "./util/index.js";

const ContentKitty: CK = {
	authentication: auth => {
		try {
			log("Configuring authentication...", "info");

			log("Building your data tables...", "info");

			// override default auth fields with user defined auth fields
			return {
				tables: tables => {
					// group internal Content Kitty tables and user defined tables

					// override any table that might overlap the auth table
					// might be able to prevent that at a type level?

					const defaultTables = populateInternalTables(auth.table);

					const overlappingTableNames = checkOverlappingTables(
						defaultTables,
						tables as Table[]
					);

					if (overlappingTableNames.length > 0) {
						throw `
						The following tables overlap with existing internal tables:
						('${overlappingTableNames.join("', '")}'), rename them and try again.
					`;
					}

					const allTables = (tables as Table[]).concat(
						Object.values(defaultTables) as Table[]
					);

					return {
						options: opt => {
							log("Configuring additional options...", "info");

							return {
								init: async () => {
									log("Launching your application...", "info");

									const prismaSchema = makePrismaModel(opt.database, allTables);
									await prismaScripts(prismaSchema);

									log("Connecting to database...", "info");

									const { PrismaClient } = await import("@prisma/client");
									const db = new PrismaClient({
										datasources: { db: { url: opt.database } },
									});

									log("Connected to database!", "success");

									store.tables.set({
										authentication: {
											table: defaultTables.authentication,
											options: auth.options as any,
										},
										other: [],
									});
									store.options.set(opt);
									store.db.set(db);

									await seed(db, {
										table: defaultTables.authentication,
										options: auth.options as Parameters<
											CK["authentication"]
										>["0"]["options"],
									});

									await server(
										opt,
										db,
										allTables,
										auth.options as Parameters<
											CK["authentication"]
										>["0"]["options"]
									);
								},
							};
						},
					};
				},
			};
		} catch (err: unknown) {
			logToFile(
				new ContentKittyError({
					level: "error",
					message: JSON.stringify(err),
				})
			);

			process.exit(1);
		}
	},
};

// ContentKitty
// 	// ...
// 	.authentication({
// 		table: {
// 			name: "Foobar",
// 		},
// 		options: {
// 			kind: "session",
// 			secret: "i-like-cookies",
// 		},
// 	})
// 	.tables([
// 		{
// 			name: "Customer",
// 			fields: [{ name: "business", type: "relation", many: false, ref: "Business" }],
// 		},
// 		{
// 			name: "Business",
// 			fields: [{ name: "customer", type: "relation", many: true, ref: "Customer" }],
// 		},
// 	])
// 	.options({
// 		database: "db uri here",
// 		server: {},
// 	})
// 	.init();

export default ContentKitty;
export { ContentKitty };
