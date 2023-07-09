import { database } from "./database/index.js";
import { defaultCollections } from "./collections/index.js";
import {
	SystemPandaError,
	logger,
	logfile,
	SP,
	Collections,
	getConfigStore,
	setConfigStore,
	dataStore,
	setDataStore,
} from "./util/index.js";
import { server } from "./server/index.js";

const SystemPanda: SP = async function (options) {
	try {
		console.log("🐼 Building SystemPanda...");

		setConfigStore(options);
		const { content, settings } = getConfigStore();

		const { systemPandaPlugins, systemPandaSession, systemPandaSettings, systemPandaUsers } =
			defaultCollections;
		const { collections, webhooks: globalWebhooks } = content || {};
		const {
			authSession: { authFields, initFirstAuth },
		} = settings;

		setDataStore({
			authFields: {
				...authFields,
				...dataStore.authFields,
			},
			initFirstAuth,
		});

		const authCollection: Collections = {
			[dataStore.authFields.collectionKey]: {
				...systemPandaUsers,
				fields: {
					...systemPandaUsers.fields,
					[dataStore.authFields.uniqueIdentifierField]: {
						type: "String",
						required: true,
						unique: true,
						index: true,
					},
					[dataStore.authFields.secretField]: { type: "String", required: true },
				},
			},
		};
		const internalCollections: Collections = {
			systemPandaSettings,
			systemPandaPlugins,
			systemPandaSession: {
				...systemPandaSession,
				fields: {
					...systemPandaSession.fields,
					[`relation_${dataStore.authFields.collectionKey}`]: {
						type: "relation",
						many: false,
						ref: `${dataStore.authFields.collectionKey}.id`,
					},
				},
			},
		};
		const visibleCollections = { ...collections, ...authCollection };
		const models = await database(settings.db, {
			...visibleCollections,
			...internalCollections,
		});
		await server(settings, visibleCollections, models, globalWebhooks);
	} catch (err: unknown) {
		await logger(logfile, err as SystemPandaError | Error);
	}
};

export default SystemPanda;
