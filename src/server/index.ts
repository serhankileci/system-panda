import express, { json, urlencoded, ErrorRequestHandler, static as serveStatic } from "express";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { plugin } from "../plugin/index.js";
import { errHandler } from "../middlewares/errHandler.js";
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
	PLUGINS_API,
	SystemPandaError,
	Webhook,
} from "../util/index.js";

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
		session: sessionOpt,
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
	const { active: activePlugins, inactive: inactivePlugins } = await plugin(prisma).load();

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
		.use((req, res, next) => {
			ctx.express = {
				req,
				res,
			};

			next();
		})
		.get("/favicon.ico", (req, res) => res.status(204))
		.use(
			serveStatic(path.join(packageProjectDir, "system-panda-static"), {
				extensions: ["html"],
			})
		);

	app
		//
		.use(beforeMiddlewares)
		.get("/", (req, res) => {
			res.json({
				plugins: { ...activePlugins, ...inactivePlugins },
				collections: Object.keys(collections).map(x => "/" + x),
			});
		})
		.get("/plugins/:title?", async (req, res, next) => {
			try {
				const { title } = req.params;

				if (title) {
					return res.json(await (await fetch(`${PLUGINS_API}/${title}`)).json());
				} else {
					return res.json(await (await fetch(PLUGINS_API)).json());
				}
			} catch (err) {
				next(err);
			}
		})
		.get("/plugins/:title/:installOrUninstall", async (req, res, next) => {
			try {
				const { title, installOrUninstall } = req.params;
				if (installOrUninstall !== "install" && installOrUninstall !== "uninstall")
					return next();

				await plugin(prisma)[installOrUninstall](title);

				return res.json({
					message: `${
						installOrUninstall[0].toUpperCase() + installOrUninstall.slice(1)
					}led plugin: ${title}. Please restart and rebuild your application.`,
				});
			} catch (err) {
				next(err);
			}
		})
		.get("/plugins/:title/:enableOrDisable", async (req, res, next) => {
			try {
				const { title, enableOrDisable } = req.params;
				if (enableOrDisable !== "enable" && enableOrDisable !== "disable") return next();

				await plugin(prisma)[enableOrDisable](title);

				return res.json({
					message: `${
						enableOrDisable[0].toUpperCase() + enableOrDisable.slice(1)
					}d plugin: ${title}. Please restart and rebuild your application.`,
				});
			} catch (err) {
				next(err);
			}
		});

	for (const [cKey, cValue] of Object.entries(collections)) {
		const query = prisma[cKey];
		const { fields, access, hooks, slug, webhooks } = cValue;
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

				ctx.util.currentHook = "beforeOperation";
				for (const obj of activePlugins) {
					obj.fn(ctx);
				}
				for (const op of beforeOperation || []) {
					const frozenOperationArgs = {
						...Object.freeze(Object.assign({}, operationArgs)),
						inputData,
						ctx: { ...ctx, customVars: ctx.customVars },
					};

					await op(frozenOperationArgs);
				}

				if (reqMethod === "GET") {
					const mappedQuery = mapQuery(req.query);
					resultData = await query.findMany(mappedQuery);
				} else {
					const data = await query.findMany({
						where: inputData.where,
					});

					operationArgs.existingData = nullIfEmpty(data);

					let mergeData = isArr
						? inputData.data.map((x: unknown) => Object.assign({}, models[cKey], x))
						: Object.assign({}, models[cKey], inputData.data);
					mergeData = nullIfEmpty(mergeData);

					ctx.util.currentHook = "validateInput";
					for (const obj of activePlugins) {
						obj.fn(ctx);
					}
					for (const op of validateInput || []) {
						const frozenOperationArgs = {
							...Object.freeze(Object.assign({}, operationArgs)),
							inputData,
							ctx: { ...ctx, customVars: ctx.customVars },
						};

						await op(frozenOperationArgs);
					}

					ctx.util.currentHook = "modifyInput";
					for (const obj of activePlugins) {
						obj.fn(ctx);
					}
					for (const op of modifyInput || []) {
						const frozenOperationArgs = {
							...Object.freeze(Object.assign({}, operationArgs)),
							inputData,
							ctx: { ...ctx, customVars: ctx.customVars },
						};

						await op(frozenOperationArgs);
					}

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
				for (const obj of activePlugins) {
					obj.fn(ctx);
				}
				for (const op of afterOperation || []) {
					const frozenOperationArgs = {
						...Object.freeze(Object.assign({}, operationArgs)),
						inputData,
						ctx: { ...ctx, customVars: ctx.customVars },
					};

					await op(frozenOperationArgs);
				}

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

	ctx.express = {
		req: app.request,
		res: app.response,
	};

	if (extendServer) extendServer(app, ctx);

	app
		// ...
		.all("*", (req, res) => res.status(404).json({ message: "Not Found." }))
		.use(afterMiddlewares)
		.listen(port, () => {
			console.log(
				`✨ Connected to ${db.URI} via Prisma ORM.\n🐼 SystemPanda live on http://localhost:${port}.`
			);
		});

	return { app };
}

export { server };
