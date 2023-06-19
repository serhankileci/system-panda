import express from "express";
import { MutableProps, PLUGINS_API } from "../../util/index.js";
import { plugin } from "../../plugin/index.js";
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const pluginsRouter = (mutableProps: MutableProps, prisma: PrismaClient) => {
	return router
		.get("/", async (req, res, next) => {
			try {
				return res.json(await (await fetch(PLUGINS_API)).json());
			} catch (err) {
				next(err);
			}
		})
		.get("/:title?", async (req, res, next) => {
			try {
				const { title } = req.params;
				return res.json(await (await fetch(`${PLUGINS_API}/${title}`)).json());
			} catch (err) {
				next(err);
			}
		})
		.get("/:title/install", async (req, res, next) => {
			try {
				const { title } = req.params;
				await plugin(prisma).install(title);
				mutableProps.plugins = await plugin(prisma).load();

				return res.json({
					message: `Installed plugin: ${title}.`,
				});
			} catch (err) {
				next(err);
			}
		})
		.get("/:title/uninstall", async (req, res, next) => {
			try {
				const { title } = req.params;
				await plugin(prisma).uninstall(title);
				mutableProps.plugins = await plugin(prisma).load();

				return res.json({
					message: `Uninstalled plugin: ${title}.`,
				});
			} catch (err) {
				next(err);
			}
		})
		.get("/:title/enable", async (req, res, next) => {
			try {
				const { title } = req.params;
				await plugin(prisma).enable(title);
				mutableProps.plugins = await plugin(prisma).load();

				return res.json({
					message: `Enabled plugin: ${title} and reloaded the plugins.`,
				});
			} catch (err) {
				next(err);
			}
		})
		.get("/:title/disable", async (req, res, next) => {
			try {
				const { title } = req.params;
				await plugin(prisma).disable(title);
				mutableProps.plugins = await plugin(prisma).load();

				return res.json({
					message: `Disabled plugin: ${title} and reloaded the plugins.`,
				});
			} catch (err) {
				next(err);
			}
		});
};

export { pluginsRouter };
