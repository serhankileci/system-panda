import {
	Plugins,
	PluginOperations,
	pathExists,
	PLUGINS_API,
	pluginsDir,
	DatabasePlugin,
} from "../util/index.js";
import { mkdir, rm, writeFile } from "fs/promises";
import { PrismaClient } from "@prisma/client";

function plugin(prisma: PrismaClient): PluginOperations {
	(async () => {
		if (!(await pathExists(pluginsDir))) await mkdir(pluginsDir);
	})();

	return {
		load: async () => {
			const dbPlugins: DatabasePlugin[] = await prisma.systemPandaPlugins.findMany();
			const obj: Plugins = { active: [], inactive: [] };

			for (const plugin of dbPlugins) {
				const fn = (await import(`${pluginsDir}/${plugin.title}.js`)).default;
				obj[plugin.active ? "active" : "inactive"].push({
					...plugin,
					fn,
				});
			}

			return obj;
		},
		enable: async (title: string) => {
			await prisma.systemPandaPlugins.update({
				where: { title },
				data: { active: true },
			});
		},
		disable: async (title: string) => {
			await prisma.systemPandaPlugins.update({
				where: { title },
				data: { active: false },
			});
		},
		install: async (title: string) => {
			const res = await (await fetch(`${PLUGINS_API}/${title}`)).json();

			await prisma.systemPandaPlugins.create({
				data: { ...res, active: false },
			});
			await writeFile(`${pluginsDir}/${title}.js`, res.sourceCode);
		},
		uninstall: async (title: string) => {
			await prisma.systemPandaPlugins.delete({ where: { title } });
			await rm(`${pluginsDir}/${title}.js`);
		},
	};
}

export { plugin };
