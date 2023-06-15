import { Collection } from "../util/index.js";

const defaultCollections: Record<"users" | "plugins" | "settings", Collection> = {
	users: {
		fields: {
			email: { required: true, type: "text", unique: true, index: true },
			name: { required: true, type: "text" },
			password: { required: true, type: "text" },
		},
	},
	plugins: {
		fields: {
			title: { required: true, type: "text", unique: true },
			author: { required: true, type: "text" },
			version: { required: true, type: "text" },
			sourceCode: { required: true, type: "text" },
			active: { required: true, type: "boolean" },
		},
	},
	settings: {
		fields: {
			name: {
				type: "text",
				required: true,
				unique: true,
			},
			value: {
				type: "text",
				required: true,
				defaultValue: "null",
			},
			type: {
				type: "text",
			},
		},
	},
};

export { defaultCollections };
