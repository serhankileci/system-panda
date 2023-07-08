import { Request, Response, NextFunction, static as serveStatic } from "express";
import {
	Context,
	SESSION,
	filterObjByKeys,
	getConfigStore,
	getDataStore,
	packageProjectDir,
} from "../../util/index.js";
import path from "node:path";

function internalMiddlewares(ctx: Context) {
	const {
		settings: { authSession },
	} = getConfigStore();
	const loadCtxWithData = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const relationKey = getDataStore().authFields.relationKey;

			if (!ctx.express) ctx.express = { req, res };

			if (req.cookies[SESSION.COOKIE_NAME]) {
				const data = await ctx.prisma.systemPandaSession.findUnique({
					where: {
						id: req.cookies[SESSION.COOKIE_NAME],
					},
					include: {
						[relationKey]: true,
					},
				});

				if (data?.[relationKey]) {
					if (!authSession.sessionData || authSession.sessionData === "*") {
						ctx.sessionData = data[relationKey];
					} else if (
						Array.isArray(authSession.sessionData) &&
						authSession.sessionData.length > 0
					) {
						ctx.sessionData = filterObjByKeys(
							data[relationKey],
							authSession.sessionData
						);
					}
				}
			}

			next();
		} catch (err) {
			next(err);
		}
	};
	const systemPandaStatic = serveStatic(path.join(packageProjectDir, "system-panda-static"), {
		extensions: ["html"],
	});

	return [loadCtxWithData, systemPandaStatic];
}

export { internalMiddlewares };
