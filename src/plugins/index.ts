import {
	PLUGINS_API,
	DatabasePlugin,
	ActiveInactivePlugins,
	Plugins,
	getDataStore,
} from "../util/index.js";

const plugins: Plugins = {
	prisma: () => getDataStore().prisma,
	load: async function () {
		const dbPlugins: DatabasePlugin[] = await this.prisma().system_panda_plugins.findMany();
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
		await this.prisma().system_panda_plugins.update({
			where: { title },
			data: { active: true },
		});
	},
	disable: async function (title) {
		await this.prisma().system_panda_plugins.update({
			where: { title },
			data: { active: false },
		});
	},
	install: async function (title) {
		const res = await (await fetch(`${PLUGINS_API}/${title}`)).json();

		await this.prisma().system_panda_plugins.create({
			data: { ...res, active: false },
		});
	},
	uninstall: async function (title) {
		await this.prisma().system_panda_plugins.delete({ where: { title } });
	},
};

export { plugins };
