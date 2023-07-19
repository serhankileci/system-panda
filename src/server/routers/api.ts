import express from "express";
import { ifAuthenticated } from "../middlewares/index.js";
import { Context, Models, Webhook, getConfigStore, getDataStore } from "../../util/index.js";
import { collection } from "../controllers/index.js";
import { authRouter } from "./auth.js";
import { pluginsRouter } from "./plugins.js";
import { webhook } from "../../webhooks/index.js";
const apiRouter = express.Router();

function apiHandler(ctx: Context, globalWebhooks: Webhook[], models: Models) {
	const {
		settings: { healthCheck },
		content: { collections },
	} = getConfigStore();
	const { prisma } = getDataStore();

	apiRouter
		// ...
		.use("/auth", authRouter)
		.use("/plugins", ifAuthenticated, pluginsRouter);

	if (healthCheck !== false)
		apiRouter.get(healthCheck?.path || "/health-check", (req, res) => {
			res.json(
				healthCheck?.data || {
					status: "healthy",
					timestamp: new Date().toISOString(),
					uptime: process.uptime(),
				}
			);
		});

	apiRouter.get("/collections", ifAuthenticated, (req, res) =>
		res.json(Object.entries(collections).map(([k, v]) => "/" + (v.slug || k)))
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
			collection(query, ctx, hooks, models, mergedWebhooks, cKey, slugOrKey)
		);
	}

	return apiRouter;
}

export { apiHandler };
