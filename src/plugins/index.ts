import {
	PLUGINS_API,
	DatabasePlugin,
	ActiveInactivePlugins,
	Plugins,
	store,
	internalTablesKeys,
} from "../util/index.js";

// need to pass the db client here somehow
const plugins: Plugins = {
	database: () => store.plugins,
	load: async function () {
		const dbPlugins: DatabasePlugin[] = await this.database()[
			internalTablesKeys.plugins
		].findMany();
		const obj: ActiveInactivePlugins = { active: [], inactive: [] };

		for (const plugin of dbPlugins) {
			const defaultExportFromFuncString = await import(
				"data:application/javascript;base64," +
					Buffer.from(plugin.sourceCode.toString()).toString("base64")
			).then(x => x.default);

			obj[plugin.active ? "active" : "inactive"].push({
				...plugin,
				sourceCode: defaultExportFromFuncString,
			});
		}

		return obj;
	},
	enable: async function (title) {
		await this.database()[internalTablesKeys.plugins].update({
			where: { title },
			data: { active: true },
		});
	},
	disable: async function (title) {
		await this.database()[internalTablesKeys.plugins].update({
			where: { title },
			data: { active: false },
		});
	},
	install: async function (title) {
		const res = await (await fetch(`${PLUGINS_API}/${title}`)).json();

		await this.database()[internalTablesKeys.plugins].create({
			data: { ...res, active: false },
		});
	},
	uninstall: async function (title) {
		await this.database()[internalTablesKeys.plugins].delete({ where: { title } });
	},
};

export { plugins };
