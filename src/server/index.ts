import express, { static as serveStatic, Request, Response, NextFunction } from "express";
import { plugins } from "../plugins/index.js";
import { beforeMiddlewaresHandler, errHandler, internalMiddlewares } from "./middlewares/index.js";
import {
	Context,
	routes,
	store,
	packageAssetsDir,
	Options,
	log,
	Table,
	CK,
} from "../util/index.js";
import { apiHandler } from "./routers/index.js";
import { PrismaClient } from "@prisma/client";

async function server(
	serverOpt: Options,
	db: PrismaClient,
	tables: Table[],
	authOpt: Parameters<CK["authentication"]>["0"]["options"]
) {
	log("Loading plugins...", "info");
	store.plugins.set(await plugins.load());

	log("Setting up the server...", "info");
	const app = express();
	const PORT = serverOpt.server?.port || 3000;

	const beforeMiddlewares = beforeMiddlewaresHandler(serverOpt, authOpt, db);
	const afterMiddlewares: ((
		req: Request,
		res: Response,
		next: NextFunction
	) => void | Promise<void>)[] = [];

	const ctx: Context = {
		express: {
			req: app.request,
			res: app.response,
		},
		tables,
		db,
		session: undefined,
		custom: {},
		util: {
			currentHook: "beforeOperation",
		},
	};

	app.use(beforeMiddlewares, internalMiddlewares(ctx));
	app.use((_, res, next) =>
		serverOpt.isAccessAllowed && !serverOpt.isAccessAllowed(ctx) ? res.sendStatus(401) : next()
	);

	// serve assets
	if (!serverOpt.disableAdminUI) {
		app.use(routes.assets, serveStatic(packageAssetsDir, { extensions: ["html"] }));
	}

	// tables routes
	app.use(
		routes.api,
		apiHandler(
			ctx,
			/* global, top table webhooks */ tables[0].webhooks || [],
			serverOpt,
			tables,
			db
		)
	);

	if (!serverOpt?.disableAdminUI) {
		app.get("*", (req, res) => res.sendFile(`${packageAssetsDir}/index.html`));
	}

	// extend server with user defined routes
	// might want to handle overlapping routes here as well
	// or provide the user with a fixed set of methods to define routes
	// or handle it at a type level?
	if (serverOpt.server?.extend) {
		serverOpt.server.extend(app, ctx);
	}

	// 404
	app.all("*", (_, res) => res.status(404).json({ success: false, message: "Not Found." }));

	if (afterMiddlewares.length > 0) {
		app.use(afterMiddlewares);
	}

	// handle errors
	app.use(errHandler);

	app.listen(PORT, () => {
		log(`Connected to ${serverOpt.database} via Prisma ORM.`, "info");
		log(`Live on http://localhost:${PORT}.`, "success");
	});
}

export { server };
