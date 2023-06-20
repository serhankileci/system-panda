import { database } from "./db/index.js";
import { defaultCollections } from "./collection/index.js";
import { SystemPandaError, logger, logfile, SP } from "./util/index.js";
import { server } from "./server/index.js";

const SystemPanda: SP = async function ({ content, config }) {
	try {
		console.log("🐼 Building SystemPanda...");

		const { collections, webhooks: globalWebhooks } = content || {};
		const { db, extendServer, port, defaultMiddlewares } = config || {};

		const usersCollection = { [/*session?.slug ||*/ "users"]: defaultCollections.users };
		const internalCollections = {
			systemPandaSettings: defaultCollections.settings,
			systemPandaPlugins: defaultCollections.plugins,
		};
		const visibleCollections = { ...collections, ...usersCollection };
		const { prisma, models } = await database(db, {
			...visibleCollections,
			...internalCollections,
		});

		await server(
			port,
			db,
			prisma,
			visibleCollections,
			models,
			defaultMiddlewares,
			extendServer,
			globalWebhooks
		);
	} catch (err: unknown) {
		await logger(logfile, err as SystemPandaError | Error);
	}
};

export default SystemPanda;
