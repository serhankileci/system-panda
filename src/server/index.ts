import express, { static as serveStatic } from "express";
import { plugins } from "../plugins/index.js";
import { beforeMiddlewaresHandler, errHandler, internalMiddlewares } from "./middlewares/index.js";
import {
	Context,
	MiddlewareHandler,
	getDataStore,
	setDataStore,
	routes,
	getConfigStore,
	staticDir,
} from "../util/index.js";
import { apiHandler } from "./routers/index.js";

async function server() {
	const { content, settings } = getConfigStore();
	const { collections, webhooks: globalWebhooks } = content;
	const {
		db,
		port,
		defaultMiddlewares,
		extendServer,
		authSession,
		isAccessAllowed,
		disableAdminUI,
	} = settings;

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
	app.use((_, res, next) =>
		isAccessAllowed && !isAccessAllowed(ctx) ? res.sendStatus(401) : next()
	);
	if (!disableAdminUI) app.use(routes.static, serveStatic(staticDir, { extensions: ["html"] }));
	app.use(routes.api, apiHandler(ctx, globalWebhooks || []));
	if (!disableAdminUI) app.get("*", (req, res) => res.sendFile(`${staticDir}/index.html`));
	if (extendServer) extendServer(app, ctx);
	app.all("*", (_, res) => res.status(404).json({ success: false, message: "Not Found." }));
	if (afterMiddlewares.length > 0) app.use(afterMiddlewares);
	app.use(errHandler);

	app.listen(port, () => {
		console.log(
			`🐼 Connected to ${db.URI} via Prisma ORM.\n🐼 SystemPanda live on http://localhost:${port}.`
		);
	});
}

export { server };
