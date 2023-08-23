import {
	Context,
	FieldInfo,
	getConfigStore,
	getDataStore,
	Models,
	Webhook,
} from "../../util/index.js";
import { webhook } from "../../webhooks/index.js";
import { collection } from "../controllers/index.js";
import { ifAuthenticated } from "../middlewares/index.js";
import { authRouter } from "./auth.js";
import { pluginsRouter } from "./plugins.js";
import express from "express";

const apiRouter = express.Router();

function apiHandler(ctx: Context, globalWebhooks: Webhook[]) {
	const {
		settings: { healthCheck },
		content: { collections },
	} = getConfigStore();
	const { prisma, models } = getDataStore();

	apiRouter
		// ...
		.get("/fields/collection/:collection_name", (req, res) => {
			const { collection_name } = req.params;

			if (!collections[collection_name]) {
				return res.status(404).json({
					success: false,
					data: null,
					error: {
						message: "Collection does not exist.",
					},
				});
			}

			const ignorableFields = /^(mJson|dateCreated|relation_(?!_).*)$/;

			let fields: string[] | FieldInfo[] = Object.keys(collections[collection_name].fields);

			fields = fields.reduce<FieldInfo[]>((accumulator, field) => {
				if (ignorableFields.test(field)) {
					return accumulator;
				}

				accumulator.push({
					name: field,
					type: collections[collection_name].fields[field].type,
				});

				return accumulator;
			}, []);

			return res.json({
				success: true,
				data: {
					fields,
				},
			});
		})
		.get("/metadata", (req, res) => {
			res.json({
				data: {
					plugins: getDataStore().pluginStore,
					collections: Object.entries(collections).map(([k, v]) => "/" + (v.slug || k)),
				},
			});
		})
		.use("/auth", authRouter)
		.use("/plugins", ifAuthenticated, pluginsRouter);

	if (healthCheck !== false)
		apiRouter.get(healthCheck?.path || "/health-check", (_, res) => {
			res.json(
				healthCheck?.data || {
					status: "healthy",
					timestamp: new Date().toISOString(),
					uptime: process.uptime(),
				}
			);
		});

	apiRouter.get("/collections", ifAuthenticated, (_, res) =>
		res.json(
			Object.entries(collections).map(([k, v]) => ({
				slug: v.slug || k,
				fields: v.fields,
			}))
		)
	);

	for (const [cKey, cValue] of Object.entries(collections)) {
		const { hooks, slug, webhooks } = cValue;
		const slugOrKey = slug || cKey;
		const query = prisma[cKey];
		const mergedWebhooks = [...(globalWebhooks || []), ...(webhooks || [])];

		mergedWebhooks?.forEach(obj => webhook(obj).init());

		apiRouter.all(
			`/collections/${slugOrKey}`,
			ifAuthenticated,
			collection(query, ctx, hooks, models || {}, mergedWebhooks, cKey, slugOrKey)
		);
	}

	return apiRouter;
}

export { apiHandler };
