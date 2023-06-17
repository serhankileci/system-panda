import { Collection } from "../util/index.js";

const defaultCollections: Record<"users" | "plugins" | "settings", Collection> = {
	users: {
		fields: {
			email: { required: true, type: "String", unique: true, index: true },
			name: { required: true, type: "String" },
			password: { required: true, type: "String" },
		},
	},
	plugins: {
		fields: {
			title: { required: true, type: "String", unique: true },
			description: { required: true, type: "String" },
			author: { required: true, type: "String" },
			version: { required: true, type: "String" },
			sourceCode: { required: true, type: "String" },
			active: { required: true, type: "Boolean" },
		},
	},
	settings: {
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
