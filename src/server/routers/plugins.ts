import express from "express";
import { PLUGINS_API, getDataStore, setDataStore } from "../../util/index.js";
import { plugins } from "../../plugins/index.js";
const pluginsRouter = express.Router();
const localPluginsRouter = express.Router();
const remotePluginsRouter = express.Router();

pluginsRouter
	// ...
	.use("/local", localPluginsRouter)
	.use("/remote", remotePluginsRouter);

localPluginsRouter
	.get("/", (req, res) => res.json({ plugins: getDataStore().pluginStore }))
	.get("/:title/uninstall", async (req, res, next) => {
		try {
			const { title } = req.params;

			await plugins.uninstall(title);

			setDataStore({
				pluginStore: await plugins.load(),
			});

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

			await plugins.enable(title);

			setDataStore({
				pluginStore: await plugins.load(),
			});

			return res.json({
				message: `Enabled plugin: ${title} and reloaded the plugins().`,
			});
		} catch (err) {
			next(err);
		}
	})
	.get("/:title/disable", async (req, res, next) => {
		try {
			const { title } = req.params;

			await plugins.disable(title);

			setDataStore({
				pluginStore: await plugins.load(),
			});

			res.json({
				message: `Disabled plugin: ${title} and reloaded the plugins().`,
			});
		} catch (err) {
			next(err);
		}
	});

remotePluginsRouter
	.get("/", async (req, res, next) => {
		try {
			return res.json(await (await fetch(PLUGINS_API)).json());
		} catch (err) {
			next(err);
		}
	})
	.get("/:title?", async (req, res, next) => {
		try {
			return res.json(await (await fetch(`${PLUGINS_API}/${req.params.title}`)).json());
		} catch (err) {
			next(err);
		}
	})
	.get("/:title/install", async (req, res, next) => {
		try {
			const { title } = req.params;

			await plugins.install(title);

			setDataStore({
				pluginStore: await plugins.load(),
			});

			return res.json({
				message: `Installed plugin: ${title}.`,
			});
		} catch (err) {
			next(err);
		}
	});

export { pluginsRouter };
