import express, { static as serveStatic } from "express";
import * as url from "node:url";
import path from "node:path";
import { plugins } from "../plugins/index.js";
import {
	beforeMiddlewaresHandler,
	ifAuthenticated,
	errHandler,
	internalMiddlewares,
} from "./middlewares/index.js";
import { webhook } from "../webhooks/index.js";
import { authRouter, pluginsRouter } from "./routers/index.js";
import { collection } from "./controllers/index.js";
import {
	Collections,
	Settings,
	Context,
	MiddlewareHandler,
	Webhook,
	Models,
	getDataStore,
	setDataStore,
	staticDir,
} from "../util/index.js";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

async function server(
	settings: Settings,
	collections: Collections,
	models: Models,
	globalWebhooks?: Webhook[]
) {
	const { db, port, defaultMiddlewares, extendServer, healthCheck, authSession } = settings;

	setDataStore({
		pluginStore: await plugins.load(),
	});

	console.log("🐼 Loading plugins...");
	const { prisma, pluginStore } = getDataStore();

	console.log("🐼 Setting up the server...");
	const app = express();

	const beforeMiddlewares = beforeMiddlewaresHandler(defaultMiddlewares || {}, authSession);
	const afterMiddlewares: MiddlewareHandler[] = [];

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
		.use(internalMiddlewares(ctx))
		.use(
			"/system-panda-static",
			serveStatic(staticDir, {
				extensions: ["html"],
			})
		)
		.get("/", (req, res) => {
			res.render("index", {
				title: "SystemPanda - Dashboard",
				page: "index",
				plugins: pluginStore,
				collections: Object.entries(collections).map(([k, v]) => "/" + (v.slug || k)),
			});
		})
		.use("/auth", authRouter)
		.use("/plugins", ifAuthenticated, pluginsRouter);

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
			collection(query, ctx, hooks, models, mergedWebhooks, cKey, slugOrKey)
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
