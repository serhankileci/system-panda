import express from "express";
import * as url from "node:url";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { plugin } from "../plugin/index.js";
import {
	beforeMiddlewaresHandler,
	ifAuthenticated,
	errHandler,
	internalMiddlewares,
} from "./middlewares/index.js";
import { webhook } from "../webhook/index.js";
import { authRouter, collection, pluginsRouter } from "./routers/index.js";
import {
	Collections,
	Config,
	Context,
	MiddlewareHandler,
	MutableProps,
	NormalizedAuthFields,
	Webhook,
} from "../util/index.js";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

async function server(
	config: Config,
	prisma: PrismaClient,
	collections: Collections,
	models: any,
	normalizedAuthFields: NormalizedAuthFields,
	globalWebhooks?: Webhook[]
) {
	console.log("🐼 Setting up the server...");
	const { db, port, defaultMiddlewares, extendServer, healthCheck, authSession } = config;
	const app = express();

	const beforeMiddlewares = beforeMiddlewaresHandler(
		defaultMiddlewares || {},
		authSession,
		prisma
	);
	const afterMiddlewares: MiddlewareHandler[] = [];

	console.log("🐼 Loading plugins...");
	const initialPlugins = await plugin(prisma).load();
	const mutableProps: MutableProps = {
		plugins: initialPlugins,
	};

	const ctx: Context = {
		express: {
			req: app.request,
			res: app.response,
		},
		collections,
		prisma,
		sessionData: undefined,
		customVars: {},
		bools: {},
		util: {
			currentHook: "beforeOperation",
		},
	};

	app
		// ...
		.set("view engine", "ejs")
		.set("views", path.resolve(__dirname, "views"))
		.use(beforeMiddlewares)
		.use(internalMiddlewares(ctx, authSession))
		.get("/", (req, res) => {
			res.render("index", {
				title: "SystemPanda - Dashboard",
				page: "index",
				plugins: mutableProps.plugins,
				collections: Object.entries(collections).map(([k, v]) => "/" + (v.slug || k)),
			});
		})
		.use("/auth", authRouter(prisma, normalizedAuthFields))
		.use("/plugins", ifAuthenticated, pluginsRouter(mutableProps, prisma));

	if (healthCheck !== false)
		app.get(healthCheck?.path || "/health-check", (req, res) => {
			res.json(
				healthCheck?.data || {
					status: "healthy",
					timestamp: new Date().toISOString(),
					uptime: process.uptime(),
				}
			);
		});

	for (const [cKey, cValue] of Object.entries(collections)) {
		const { hooks, slug, webhooks } = cValue;
		const slugOrKey = slug || cKey;
		const query = prisma[cKey];
		const mergedWebhooks = [...(globalWebhooks || []), ...(webhooks || [])];

		mergedWebhooks?.forEach(obj => webhook(obj).init());

		app.all(
			`/${slugOrKey}`,
			collection(query, mutableProps, ctx, hooks, models, mergedWebhooks, cKey, slugOrKey)
		);
	}

	if (extendServer) extendServer(app, ctx);

	app.all("*", (req, res) => res.status(404).json({ success: false, message: "Not Found." }));

	if (afterMiddlewares.length > 0) app.use(afterMiddlewares);

	app
		// ...
		.use(errHandler)
		.listen(port, () => {
			console.log(
				`🐼 Connected to ${db.URI} via Prisma ORM.\n🐼 SystemPanda live on http://localhost:${port}.`
			);
		});

	return { app };
}

export { server };
