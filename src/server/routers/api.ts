import express from "express";
import { ifAuthenticated } from "../middlewares/index.js";
import { Context, Options, Table, Webhook, store } from "../../util/index.js";
import { table } from "../controllers/index.js";
import { authRouter } from "./auth.js";
import { pluginsRouter } from "./plugins.js";
import { webhook } from "../../tables/index.js";
import { PrismaClient } from "@prisma/client";
const apiRouter = express.Router();

function apiHandler(
	ctx: Context,
	globalWebhooks: Webhook[],
	serverOpt: Options,
	tables: Table[],
	db: PrismaClient
) {
	const healthCheck = serverOpt.healthCheck;

	apiRouter
		// ...
		.use("/auth", authRouter)
		.use("/plugins", ifAuthenticated, pluginsRouter);

	if (healthCheck) {
		apiRouter.get(healthCheck.path || "/health-check", (_, res) => {
			res.json(
				healthCheck.data
					? healthCheck?.data(ctx)
					: {
							status: store.healthCheck.get().status,
							timestamp: new Date().toISOString(),
							uptime: process.uptime(),
					  }
			);
		});
	}

	apiRouter.get("/tables", ifAuthenticated, (_, res) =>
		res.json(
			Object.entries(tables).map(([k, v]) => ({
				slug: v.slug || k,
				fields: v.fields,
			}))
		)
	);

	for (const [cKey, cValue] of Object.entries(tables)) {
		const { hooks, slug, webhooks } = cValue;
		const slugOrKey = slug || cKey;
		const query = db[cKey];
		const mergedWebhooks = [...(globalWebhooks || []), ...(webhooks || [])];

		mergedWebhooks?.forEach(obj => webhook(obj).init());

		apiRouter.all(
			`/tables/${slugOrKey}`,
			ifAuthenticated,
			table(query, ctx, hooks, mergedWebhooks, cKey, slugOrKey)
		);
	}

	return apiRouter;
}

export { apiHandler };
