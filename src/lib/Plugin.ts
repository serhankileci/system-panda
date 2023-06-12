import { PLUGINS_API, pluginsDir } from "../util/constants.js";
import { Plugin, PluginOperations } from "../util/index.js";
import { rm, writeFile } from "fs/promises";
import { pathExists } from "../util/pathExists.js";
import { SystemPandaError } from "../util/SystemPandaError.js";
import { PrismaClient } from "@prisma/client";

function plugin(prisma: PrismaClient): PluginOperations {
	try {
		return {
			load: async () => {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				const dbPlugins = await prisma.systemPandaPlugins.findMany();
				const obj: Plugin = { active: [], inactive: [] };

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
				if (await pathExists(`${pluginsDir}/${title}.js`)) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					await prisma.systemPandaPlugins.update({
						where: { title },
						data: { active: true },
					});
				} else {
					throw new SystemPandaError({
						level: "warning",
						message: `Plugin "${title}" is not installed.`,
					});
				}
			},
			disable: async (title: string) => {
				if (await pathExists(`${pluginsDir}/${title}.js`)) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					await prisma.systemPandaPlugins.update({
						where: { title },
						data: { active: false },
					});
				} else {
					throw new SystemPandaError({
						level: "warning",
						message: `Plugin "${title}" is not installed.`,
					});
				}
			},
			install: async (title: string) => {
				if (await pathExists(`${pluginsDir}/${title}.js`)) {
					throw new SystemPandaError({
						level: "warning",
						message: `Plugin "${title}" is already installed.`,
					});
				}

				const res = await (await fetch(`${PLUGINS_API}/${title}`)).json();

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				await prisma.systemPandaPlugins.create({
					data: { ...res, active: false },
				});

				await writeFile(`${pluginsDir}/${title}.js`, res.sourceCode);
			},
			uninstall: async (title: string) => {
				if (!(await pathExists(`${pluginsDir}/${title}.js`))) {
					throw new SystemPandaError({
						level: "warning",
						message: `Plugin "${title}" is already not installed.`,
					});
				}

				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				await prisma.systemPandaPlugins.delete({ where: { title } });

				await rm(`${pluginsDir}/${title}.js`);
			},
		};
	} catch (err: unknown) {
		throw new SystemPandaError({
			level: "warning",
			message: String(err?.toString()),
		});
	}
}

export { plugin };
