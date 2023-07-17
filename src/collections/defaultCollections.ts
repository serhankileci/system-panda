import { Collection, InternalTablesKeys } from "../util/index.js";

const defaultCollections: Record<InternalTablesKeys, Collection> = {
	system_panda_users: {
		fields: {
			user_type: {
				type: "String",
				required: true,
			},
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

export { defaultCollections };
