import { database } from "./database/index.js";
import { overrideDefaultCollections } from "./collections/index.js";
import { server } from "./server/index.js";
import {
	SystemPandaError,
	logger,
	logfile,
	SP,
	setConfigStore,
	setDataStore,
	getDataStore,
} from "./util/index.js";

const SystemPanda: SP = async function (options) {
	try {
		console.log("🐼 Building SystemPanda...");

		setConfigStore(options);

		const mergedAuthFields = {
			...getDataStore().authFields,
			...options.settings.authSession.authFields,
		};
		mergedAuthFields.relationKey = "relation_" + mergedAuthFields.collectionKey;

		const [authCollection, internalCollections] = overrideDefaultCollections(mergedAuthFields);

		setDataStore({
			authFields: mergedAuthFields,
			initFirstAuth: options.settings.authSession.initFirstAuth,
			normalizedCollections: {
				visible: { ...options.content.collections, ...authCollection },
				internal: internalCollections,
			},
		});

		await database();
		await server();
	} catch (err: unknown) {
		await logger(logfile, err as SystemPandaError | Error);
	}
};

export default SystemPanda;
