import path from "path";
import { mkdir, writeFile } from "node:fs/promises";
import prisma from "@prisma/client";
import express, { json, urlencoded, static as serveStatic, ErrorRequestHandler } from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { makePrismaModel, webhook, databaseSeed, plugin } from "./lib/index.js";
import { errHandler } from "./middlewares/index.js";
import { defaultCollections, mapQuery } from "./lib/collection/index.js";
import {
	SystemPandaError,
	logger,
	pathExists,
	projectDir,
	flippedCrudMapping,
	logfile,
	PLUGINS_API,
	pluginsDir,
	SP,
	Context,
	MiddlewareHandler,
	ExistingData,
	Method,
} from "./util/index.js";
import { prismaScript } from "./util/prismaScript.js";
const { Prisma } = prisma;

const SystemPanda: SP = async function ({ content, config }) {
	try {
		const { collections, webhooks: baseWebhooks } = content || {};
		const { db, session, debug, extendServer, port, defaultMiddlewares } = config || {};
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

		const schemaFile = await makePrismaModel(
			{
				...collections,
				systemPandaSettings: defaultCollections.settings,
				systemPandaPlugins: defaultCollections.plugins,
				[session?.slug || "users"]: defaultCollections.users,
			},
			db
		);

		if (!(await pathExists(pluginsDir))) await mkdir(pluginsDir);
		if (!(await pathExists(`${projectDir}/prisma`))) await mkdir(`${projectDir}/prisma`);
		await writeFile(path.resolve(`${projectDir}/prisma/schema.prisma`), schemaFile);
		await prismaScript();

		const { PrismaClient } = await import("@prisma/client");
		const prisma = new PrismaClient({
			errorFormat: db.errorFormat,
			log: db.log,
			datasources: { db: { url: db.URI } },
		});

		await databaseSeed(prisma);

		const modelRegex = /model\s+(\w+)\s*{([\s\S]*?)}/g;
		const models: any = {};
		let match;
		while ((match = modelRegex.exec(schemaFile)) !== null) {
			const modelName = match[1];
			const fieldsContent = match[2].trim();

			const fields = fieldsContent
				.split("\n")
				.map(line => line.trim().split(" ")[0])
				.filter(field => field !== "");

			fields.forEach(x => {
				if (!models[modelName]) models[modelName] = {};
				if (models[modelName]) models[modelName][x] = null;
			});
		}

		const srvDefaultbefore: MiddlewareHandler[] = [
			morganOpt ? morgan(morganOpt.format, morganOpt.options) : morgan("tiny"),
			helmet(helmetOpt || {}),
			json(jsonOpt || {}),
			urlencoded(urlencodedOpt || { extended: false }),
			compression(compressionOpt || {}),
			cors(corsOpt || {}),
		];
		if (rateLimitOpt) srvDefaultbefore.push(rateLimit(rateLimitOpt));

		const srvDefaultAfterResponse: (MiddlewareHandler | ErrorRequestHandler)[] = [errHandler];
		const app = express();

		const ctx: Context = {
			express: { req: app.request, res: app.response },
			collections,
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
				serveStatic(path.join(projectDir, "content-static"), {
					extensions: ["html"],
				})
			);

		serveStaticOpt && app.use(serveStatic(serveStaticOpt.root, serveStaticOpt.options));

		const { active: activePlugins, inactive: inactivePlugins } = await plugin(prisma).load();

		app
			//
			.use(srvDefaultbefore)
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
					if (enableOrDisable !== "enable" && enableOrDisable !== "disable")
						return next();

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
			const query: any = prisma[cKey as Uncapitalize<keyof typeof Prisma.ModelName>];

			const { fields, access, hooks, slug, webhooks } = cValue;
			const { beforeOperation, validateInput, modifyInput, afterOperation } = hooks || {};

			// global webhooks for every collection
			baseWebhooks?.forEach(obj => webhook(obj).init());
			// webhooks for each collection
			webhooks?.forEach(obj => webhook(obj).init());

			app.all(`/${cKey}`, async (req, res, next) => {
				try {
					const inputData = req.body;
					let existingData: ExistingData;
					const reqMethod = req.method as Method;
					let resultData = {};

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
						await op(operationArgs);
					}

					if (reqMethod === "GET") {
						const mappedQuery = mapQuery(req.query);
						resultData = await query.findMany(mappedQuery);
					} else {
						ctx.util.currentHook = "validateInput";
						for (const obj of activePlugins) {
							obj.fn(ctx);
						}
						for (const op of validateInput || []) {
							await op(operationArgs);
						}

						ctx.util.currentHook = "modifyInput";
						for (const obj of activePlugins) {
							obj.fn(ctx);
						}
						for (const op of modifyInput || []) {
							await op(operationArgs);
						}

						const isArr = Array.isArray(inputData.data);
						const mergeData = isArr
							? inputData.data.map((x: unknown) => Object.assign({}, models[cKey], x))
							: Object.assign({}, models[cKey], inputData.data);

						if (reqMethod === "POST") {
							if (isArr) {
								resultData = await query.createMany({
									data: mergeData,
									skipDuplicates: inputData.skipDuplicates,
								});
							} else {
								resultData = await query.create({
									data: mergeData,
									select: inputData.select,
								});
							}
						} else if (reqMethod === "PUT") {
							resultData = await query[isArr ? "updateMany" : "update"]({
								data: mergeData,
								where: inputData.where,
							});
						} else if (reqMethod === "DELETE") {
							resultData = await query[isArr ? "deleteMany" : "delete"]({
								where: inputData.where,
							});
						}
					}

					ctx.util.currentHook = "afterOperation";
					for (const obj of activePlugins) {
						obj.fn(ctx);
					}
					for (const op of afterOperation || []) {
						await op(operationArgs);
					}

					res.json(resultData);

					// trigger global and collection-specific webhooks
					baseWebhooks?.forEach(obj => {
						if (obj.onOperation.includes(flippedCrudMapping[reqMethod])) {
							webhook(obj).init();
						}
					});
					webhooks?.forEach(obj => {
						if (obj.onOperation.includes(flippedCrudMapping[reqMethod])) {
							webhook(obj).trigger(resultData);
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
			.all("*", (req, res) => res.status(404).json({ message: "Not Found." }))
			.use(srvDefaultAfterResponse)
			.listen(port, () => {
				console.log(
					`\n✨ Connected to ${db.URI} via Prisma ORM.\n✨ SystemPanda live on http://localhost:${port}.`
				);
			});
	} catch (err: unknown) {
		console.log(err);
		await logger(logfile, err as SystemPandaError | Error);
	}
};

export default SystemPanda;
