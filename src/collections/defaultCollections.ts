import { Collection } from "../util/index.js";

const defaultCollections: Record<
	"systemPandaUsers" | "systemPandaSession" | "systemPandaPlugins" | "systemPandaSettings",
	Collection
> = {
	systemPandaUsers: {
		fields: {},
	},
	systemPandaSession: {
		id: {
			type: "cuid",
		},
		fields: {
			data: {
				type: "Json",
			},
			createdAt: {
				type: "DateTime",
				defaultValue: {
					kind: "now",
				},
			},
			updatedAt: {
				type: "DateTime",
				defaultValue: {
					kind: "updatedAt",
				},
			},
		},
	},
	systemPandaPlugins: {
		fields: {
			title: { required: true, type: "String", unique: true },
			description: { required: true, type: "String" },
			author: { required: true, type: "String" },
			version: { required: true, type: "String" },
			sourceCode: { required: true, type: "String" },
			active: { required: true, type: "Boolean" },
		},
	},
	systemPandaSettings: {
		fields: {
			name: {
				type: "String",
				required: true,
				unique: true,
			},
			value: {
				type: "String",
				required: true,
				defaultValue: "null",
			},
			type: {
				type: "String",
			},
		},
	},
};

export { defaultCollections };
