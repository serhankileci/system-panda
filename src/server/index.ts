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
import { mapQuery } from "../collection/index.js";
import { authRouter, pluginsRouter } from "./routers/index.js";
import {
	Collections,
	Config,
	Context,
	EventTriggerPayload,
	flippedCrudMapping,
	Method,
	MiddlewareHandler,
	MutableProps,
	NormalizedAuthFields,
	nullIfEmpty,
	SystemPandaError,
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

		app.all(`/${slugOrKey}`, async (req, res, next) => {
			try {
				const inputData = req.body;
				const reqMethod = req.method as Method;
				const existingData: any = null;
				let resultData;
				const isArr = Array.isArray(inputData.data);
				const operation = flippedCrudMapping[reqMethod];
				const operationArgs = {
					existingData,
					inputData,
					operation,
					ctx,
				};

				const handleHookAndPlugin = async () => {
					for (const obj of mutableProps.plugins.active) {
						obj.fn(ctx);
					}

					for (const op of (hooks || {})[ctx.util.currentHook] || []) {
						const frozenOperationArgs = {
							...Object.freeze(Object.assign({}, operationArgs)),
							inputData: inputData.data,
							ctx: { ...ctx, customVars: ctx.customVars },
						};

						await op(frozenOperationArgs);
					}
				};

				ctx.util.currentHook = "beforeOperation";
				await handleHookAndPlugin();

				if (reqMethod === "GET") {
					const mappedQuery = mapQuery(req.query);
					resultData = await query.findMany(mappedQuery);
				} else {
					const data = await query.findMany({
						where: inputData.where,
					});

					operationArgs.existingData = nullIfEmpty(data);

					ctx.util.currentHook = "modifyInput";
					await handleHookAndPlugin();

					ctx.util.currentHook = "validateInput";
					await handleHookAndPlugin();

					let mergeData = isArr
						? inputData.data.map((x: unknown) => Object.assign({}, models[cKey], x))
						: Object.assign({}, models[cKey], inputData.data);
					mergeData = nullIfEmpty(mergeData);

					if (reqMethod === "POST") {
						await query.createMany({
							data: mergeData,
							skipDuplicates: inputData.skipDuplicates,
						});

						operationArgs.existingData = mergeData;

						resultData = {
							before: null,
							after: mergeData,
						};
					} else if (reqMethod === "PUT") {
						const updated = await query.updateMany({
							data: mergeData,
							where: inputData.where,
						});

						if (updated?.count === 0) {
							throw new SystemPandaError({
								level: "informative",
								status: 404,
								message: "No data to update.",
							});
						}

						resultData = {
							before: operationArgs.existingData,
							after: mergeData,
						};
					} else if (reqMethod === "DELETE") {
						const deleted = await query.deleteMany({
							where: inputData.where,
						});

						if (deleted?.count === 0) {
							throw new SystemPandaError({
								level: "informative",
								status: 404,
								message: "No data to delete.",
							});
						}

						resultData = {
							before: operationArgs.existingData,
							after: mergeData,
						};

						operationArgs.existingData = null;
					}
				}

				ctx.util.currentHook = "afterOperation";
				await handleHookAndPlugin();

				res.json({ success: true, data: resultData });

				const webhookTriggerPayload: EventTriggerPayload = {
					event: flippedCrudMapping[reqMethod],
					collection: {
						name: cKey,
						slug: slugOrKey,
					},
					data: nullIfEmpty(resultData) || null,
					timestamp: new Date().toISOString(),
				};

				mergedWebhooks?.forEach(obj => {
					if (obj.onOperation.includes(flippedCrudMapping[reqMethod])) {
						webhook(obj).trigger(webhookTriggerPayload);
					}
				});
			} catch (err: unknown) {
				next(err);
			}
		});
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
