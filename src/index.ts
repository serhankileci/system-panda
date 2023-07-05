import { database } from "./db/index.js";
import { defaultCollections } from "./collection/index.js";
import { SystemPandaError, logger, logfile, SP, Collections } from "./util/index.js";
import { server } from "./server/index.js";

const SystemPanda: SP = async function ({ content, config }) {
	try {
		console.log("🐼 Building SystemPanda...");
		const { systemPandaPlugins, systemPandaSession, systemPandaSettings, systemPandaUsers } =
			defaultCollections || {};
		const { collections, webhooks: globalWebhooks } = content || {};
		const {
			authSession: { collectionKey, uniqueIdentifierField, secretField, initFirstAuth },
		} = config;
		const normalizedAuthFields = {
			collectionKey: collectionKey || "users",
			uniqueIdentifierField: uniqueIdentifierField || "email",
			secretField: secretField || "password",
		};
		const authCollection: Collections = {
			[normalizedAuthFields.collectionKey]: {
				...systemPandaUsers,
				fields: {
					[normalizedAuthFields.uniqueIdentifierField]: {
						type: "String",
						required: true,
						unique: true,
						index: true,
					},
					[normalizedAuthFields.secretField]: { type: "String", required: true },
					relation_session: {
						type: "relation",
						many: true,
						ref: "systemPandaSession.id",
					},
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
					[`relation_${normalizedAuthFields.collectionKey}`]: {
						type: "relation",
						many: false,
						ref: `${normalizedAuthFields.collectionKey}.id`,
					},
				},
			},
		};
		const visibleCollections = { ...collections, ...authCollection };

		const { prisma, models } = await database(
			config.db,
			{
				...visibleCollections,
				...internalCollections,
			},
			normalizedAuthFields,
			initFirstAuth
		);

		await server(
			config,
			prisma,
			visibleCollections,
			models,
			normalizedAuthFields,
			globalWebhooks
		);
	} catch (err: unknown) {
		await logger(logfile, err as SystemPandaError | Error);
	}
};

export default SystemPanda;
