import express, { json, urlencoded, ErrorRequestHandler, static as serveStatic } from "express";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { plugin } from "../plugin/index.js";
import { errHandler } from "./middlewares/index.js";
import { webhook } from "../webhook/index.js";
import { mapQuery } from "../collection/mapQuery.js";
import {
	Collections,
	Context,
	Database,
	DefaultMiddlewares,
	EventTriggerPayload,
	ExtendServer,
	flippedCrudMapping,
	Method,
	MiddlewareHandler,
	nullIfEmpty,
	packageProjectDir,
	SystemPandaError,
	Webhook,
} from "../util/index.js";
import { pluginsRouter } from "./routers/index.js";

async function server(
	port: number,
	db: Database,
	prisma: PrismaClient,
	collections: Collections,
	models: any,
	defaultMiddlewares?: DefaultMiddlewares,
	extendServer?: ExtendServer,
	globalWebhooks?: Webhook[]
) {
	const {
		compression: compressionOpt,
		cors: corsOpt,
		helmet: helmetOpt,
		json: jsonOpt,
		morgan: morganOpt,
		rateLimit: rateLimitOpt,
		serveStatic: serveStaticOpt,
		urlencoded: urlencodedOpt,
	} = defaultMiddlewares || {};

	console.log("🔃 Loading plugins...");
	let plugins = await plugin(prisma).load();

	console.log("🔃 Setting up the server...");
	const app = express();

	const beforeMiddlewares: MiddlewareHandler[] = [
		helmet(helmetOpt || {}),
		json(jsonOpt || {}),
		urlencoded(urlencodedOpt || { extended: false }),
		compression(compressionOpt || {}),
		cors(corsOpt || {}),
	];
	if (morganOpt) beforeMiddlewares.push(morgan(morganOpt.format, morganOpt.options));
	if (rateLimitOpt) beforeMiddlewares.push(rateLimit(rateLimitOpt));
	if (serveStaticOpt)
		beforeMiddlewares.push(serveStatic(serveStaticOpt.root, serveStaticOpt.options));

	const afterMiddlewares: (MiddlewareHandler | ErrorRequestHandler)[] = [errHandler];

	const ctx: Context = {
		express: {
			req: app.request,
			res: app.response,
		},
		collections: collections,
		prisma,
		sessionData: [],
		customVars: {},
		bools: {
			isLocalhost: false,
		},
		util: {
			currentHook: "beforeOperation",
		},
	};

	app
		// ...
		.use(async (req, res, next) => {
			if (!ctx.express) {
				ctx.express = {
					req,
					res,
				};
			}

			if (global.shouldReloadPlugins) {
				plugins = await plugin(prisma).load();

				global.shouldReloadPlugins = false;
			}

			next();
		})
		.use(
			serveStatic(path.join(packageProjectDir, "system-panda-static"), {
				extensions: ["html"],
			})
		);

	app
		// ...
		.use(beforeMiddlewares)
		.get("/", (req, res) => {
			res.json({
				plugins,
				collections: Object.keys(collections).map(x => "/" + x),
			});
		})
		.use("/plugins", pluginsRouter(prisma));

	for (const [cKey, cValue] of Object.entries(collections)) {
		const query = prisma[cKey];
		const { fields, hooks, slug, webhooks } = cValue;
		const { beforeOperation, validateInput, modifyInput, afterOperation } = hooks || {};
		const mergedWebhooks = [...(globalWebhooks || []), ...(webhooks || [])];

		mergedWebhooks?.forEach(obj => webhook(obj).init());

		app.all(`/${cKey}`, async (req, res, next) => {
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
					for (const obj of plugins.active) {
						obj.fn(ctx);
					}

					for (const op of hooks![ctx.util.currentHook] || []) {
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
							beforeCreate: null,
							afterCreate: mergeData,
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
							beforeUpdate: operationArgs.existingData,
							afterUpdate: mergeData,
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
							beforeDelete: operationArgs.existingData,
							afterDelete: mergeData,
						};

						operationArgs.existingData = null;
					}
				}

				ctx.util.currentHook = "afterOperation";
				await handleHookAndPlugin();

				res.json({ success: true, data: resultData });

				const webhookTriggerPayload: EventTriggerPayload = {
					event: flippedCrudMapping[reqMethod],
					collection: cKey,
					data: nullIfEmpty(resultData),
					timestamp: new Date().toISOString(),
				};

				mergedWebhooks?.forEach(obj => {
					if (obj.onOperation.includes(flippedCrudMapping[reqMethod])) {
						webhook(obj).trigger(webhookTriggerPayload);
					}
				});
			} catch (err) {
				next(err);
			}
		});
	}

	if (extendServer) extendServer(app, ctx);

	app
		// ...
		.all("*", (req, res) => res.status(404).json({ success: false, message: "Not Found." }))
		.use(afterMiddlewares)
		.listen(port, () => {
			console.log(
				`✨ Connected to ${db.URI} via Prisma ORM.\n🐼 SystemPanda live on http://localhost:${port}.`
			);
		});

	return { app };
}

export { server };
