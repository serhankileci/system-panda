import { MutableDataStore } from "./types.js";

const store: MutableDataStore = {
	tables: undefined as any,
	options: undefined as any,
	db: undefined as any,
	plugins: {
		store: { active: [], inactive: [] },
		get: function () {
			return this.store;
		},
		set: function (arg) {
			Object.assign(this.store, arg);
		},
	},
	healthCheck: {
		store: {
			status: "healthy",
		},
		get: function () {
			return this.store;
		},
		set: function (arg) {
			Object.assign(this.store, arg);
		},
	},
};

export { store };
