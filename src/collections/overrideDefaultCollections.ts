import { AuthFields, Collection, Collections, internalTablesKeys } from "../util/index.js";

function overrideDefaultCollections(authFields: Required<AuthFields>) {
	const defaultCollections: Record<
		(typeof internalTablesKeys)[keyof typeof internalTablesKeys],
		Collection
	> = {
		system_panda_users: {
			fields: {
				relation_session: {
					type: "relation",
					many: true,
					ref: "system_panda_sessions.id",
				},
			},
		},
		system_panda_sessions: {
			id: {
				type: "cuid",
			},
			fields: {
				data: {
					type: "Json",
				},
				created_at: {
					type: "DateTime",
					defaultValue: {
						kind: "now",
					},
				},
				updated_at: {
					type: "DateTime",
					defaultValue: {
						kind: "updatedAt",
					},
				},
			},
		},
		system_panda_plugins: {
			fields: {
				title: { required: true, type: "String", unique: true },
				description: { required: true, type: "String" },
				author: { required: true, type: "String" },
				version: { required: true, type: "String" },
				sourceCode: { required: true, type: "String" },
				active: { required: true, type: "Boolean" },
			},
		},
	};
	const { system_panda_plugins, system_panda_sessions, system_panda_users } = defaultCollections;

	const authCollection: Collections = {
		[authFields.collectionKey]: {
			...system_panda_users,
			fields: {
				...system_panda_users.fields,
				[authFields.roleField]: {
					type: "String",
					required: true,
				},
				[authFields.uniqueIdentifierField]: {
					type: "String",
					required: true,
					unique: true,
					index: true,
				},
				[authFields.secretField]: { type: "String", required: true },
			},
		},
	};

	const internalCollections: Collections = {
		system_panda_plugins,
		system_panda_sessions: {
			...system_panda_sessions,
			fields: {
				...system_panda_sessions.fields,
				[`relation_${authFields.collectionKey}`]: {
					type: "relation",
					many: false,
					ref: `${authFields.collectionKey}.id`,
				},
			},
		},
	};

	return [authCollection, internalCollections];
}

export { overrideDefaultCollections };
