import express from "express";
import { PLUGINS_API } from "../../util/index.js";
import { plugin } from "../../plugin/index.js";
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const pluginsRouter = (prisma: PrismaClient) => {
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

				return res.json({
					message: `Installed plugin: ${title}. You can enable your plugin and restart your application to activate it.`,
				});
			} catch (err) {
				next(err);
			}
		})
		.get("/:title/uninstall", async (req, res, next) => {
			try {
				const { title } = req.params;
				await plugin(prisma).uninstall(title);

				return res.json({
					message: `Uninstalled plugin: ${title}. Restart your application for it to take effect.`,
				});
			} catch (err) {
				next(err);
			}
		})
		.get("/:title/enable", async (req, res, next) => {
			try {
				const { title } = req.params;
				await plugin(prisma).enable(title);

				return res.json({
					message: `Enabled plugin: ${title}. Restart your application for it to take effect.`,
				});
			} catch (err) {
				next(err);
			}
		})
		.get("/:title/disable", async (req, res, next) => {
			try {
				const { title } = req.params;
				await plugin(prisma).disable(title);

				return res.json({
					message: `Disabled plugin: ${title}. Restart your application for it to take effect.`,
				});
			} catch (err) {
				next(err);
			}
		});
};

export { pluginsRouter };
