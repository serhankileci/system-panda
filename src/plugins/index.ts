import {
	PLUGINS_API,
	pluginsDir,
	DatabasePlugin,
	ActiveInactivePlugins,
	pathExists,
	Plugins,
	getDataStore,
} from "../util/index.js";
import { mkdir, rm, writeFile } from "fs/promises";

if (!(await pathExists(pluginsDir))) await mkdir(pluginsDir);

const plugins: Plugins = {
	prisma: () => getDataStore().prisma,
	load: async function () {
		const dbPlugins: DatabasePlugin[] = await this.prisma().systemPandaPlugins.findMany();
		const obj: ActiveInactivePlugins = { active: [], inactive: [] };

		for (const plugin of dbPlugins) {
			const fn = (await import(`${pluginsDir}/${plugin.title}.js`)).default;
			obj[plugin.active ? "active" : "inactive"].push({
				...plugin,
				fn,
			});
		}

		return obj;
	},
	enable: async function (title) {
		await this.prisma().systemPandaPlugins.update({
			where: { title },
			data: { active: true },
		});
	},
	disable: async function (title) {
		await this.prisma().systemPandaPlugins.update({
			where: { title },
			data: { active: false },
		});
	},
	install: async function (title) {
		const res = await (await fetch(`${PLUGINS_API}/${title}`)).json();

		await this.prisma().systemPandaPlugins.create({
			data: { ...res, active: false },
		});

		await writeFile(`${pluginsDir}/${title}.js`, res.sourceCode);
	},
	uninstall: async function (title) {
		await this.prisma().systemPandaPlugins.delete({ where: { title } });

		await rm(`${pluginsDir}/${title}.js`);
	},
};

export { plugins };
