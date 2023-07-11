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

		const {
			system_panda_plugins,
			system_panda_sessions,
			system_panda_settings,
			system_panda_users,
		} = defaultCollections;
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
				...system_panda_users,
				fields: {
					...system_panda_users.fields,
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
			system_panda_settings,
			system_panda_plugins,
			system_panda_sessions: {
				...system_panda_sessions,
				fields: {
					...system_panda_sessions.fields,
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
