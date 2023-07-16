import express, { static as serveStatic } from "express";
import { plugins } from "../plugins/index.js";
import { beforeMiddlewaresHandler, errHandler, internalMiddlewares } from "./middlewares/index.js";
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
	routes,
} from "../util/index.js";
import { apiHandler } from "./routers/index.js";

async function server(
	settings: Settings,
	collections: Collections,
	models: Models,
	globalWebhooks?: Webhook[]
) {
	const { db, port, defaultMiddlewares, extendServer, healthCheck, authSession, disableAdminUI } =
		settings;
	const prisma = getDataStore().prisma;

	console.log("🐼 Loading plugins...");
	setDataStore({
		pluginStore: await plugins.load(),
	});

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

	app.use(beforeMiddlewares, internalMiddlewares(ctx));
	if (!disableAdminUI) app.use(routes.static, serveStatic(staticDir, { extensions: ["html"] }));
	app.use(routes.api, apiHandler(ctx, globalWebhooks || [], models));
	if (!disableAdminUI) app.get("*", (req, res) => res.sendFile(staticDir + "/index.html"));

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
