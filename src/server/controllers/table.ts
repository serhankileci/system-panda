import { NextFunction, Request, Response } from "express";
import {
	Table,
	RequestMethods,
	Context,
	EventTriggerPayload,
	ExistingData,
	InputData,
	Webhook,
	methodMapping,
	nullIfEmptyArrOrObj,
	ContentKittyError,
} from "../../util/index.js";
import { PrismaClient } from "@prisma/client";
import { webhook, handleHooksPlugins } from "../../tables/index.js";
import { mapQuery } from "../middlewares/index.js";

function table(
	query: PrismaClient,
	ctx: Context,
	hooks: Table["hooks"],
	mergedWebhooks: Webhook[],
	cKey: string,
	slugOrKey: string
) {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!["get", "post", "put", "delete"].includes(req.method.toLocaleLowerCase())) {
				throw new ContentKittyError({
					level: "warning",
					status: 405,
					message: "Method not allowed.",
				});
			}

			let resultData;
			const existingData: ExistingData = null;
			const inputData: InputData = req.body;
			const reqMethod = req.method as RequestMethods["main"];
			const isArr = Array.isArray(inputData.data);
			const operation = methodMapping[reqMethod];
			const operationArgs = {
				existingData,
				inputData,
				operation,
				ctx,
			};

			const triggerHooksPlugins = await handleHooksPlugins(
				ctx,
				hooks,
				inputData,
				operationArgs
			);

			ctx.util.currentHook = "beforeOperation";
			await triggerHooksPlugins();

			if (reqMethod === "GET") {
				const mappedQuery = mapQuery(req.query);
				resultData = await query.findMany(mappedQuery);
			} else {
				const data = await query.findMany({
					where: inputData.where,
				});

				operationArgs.existingData = nullIfEmptyArrOrObj(data);

				ctx.util.currentHook = "modifyInput";
				await triggerHooksPlugins();

				ctx.util.currentHook = "validateInput";
				await triggerHooksPlugins();

				// let mergeData = isArr
				// 	? inputData.data.map((x: unknown) => Object.assign({}, tables[cKey], x))
				// 	: Object.assign({}, tables[cKey], inputData.data);
				const mergeData = nullIfEmptyArrOrObj(inputData.data);

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
						throw new ContentKittyError({
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
						throw new ContentKittyError({
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
			await triggerHooksPlugins();

			res.json({ success: true, data: resultData });

			const webhookTriggerPayload: EventTriggerPayload = {
				event: methodMapping[reqMethod],
				table: {
					name: cKey,
					slug: slugOrKey,
				},
				data: nullIfEmptyArrOrObj(resultData),
				timestamp: new Date().toISOString(),
			};

			mergedWebhooks?.forEach(obj => {
				if (obj.onOperation.includes(methodMapping[reqMethod])) {
					webhook(obj).trigger(webhookTriggerPayload);
				}
			});
		} catch (err: unknown) {
			return next(err);
		}
	};
}

export { table };
