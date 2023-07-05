import { Request, Response, NextFunction, static as serveStatic } from "express";
import {
	AuthSession,
	Context,
	SESSION_COOKIE_NAME,
	filterObjByKeys,
	packageProjectDir,
} from "../../util/index.js";
import path from "node:path";

function internalMiddlewares(ctx: Context, authSession: AuthSession) {
	const loadCtxWithData = async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!ctx.express) ctx.express = { req, res };

			if (req.cookies[SESSION_COOKIE_NAME]) {
				const data = await ctx.prisma.systemPandaSession.findUnique({
					where: {
						id: req.cookies[SESSION_COOKIE_NAME],
					},
					include: {
						relation_users: true,
					},
				});

				if (data?.relation_users) {
					if (!authSession.sessionData || authSession.sessionData === "*") {
						ctx.sessionData = data.relation_users;
					} else if (
						Array.isArray(authSession.sessionData) &&
						authSession.sessionData.length > 0
					) {
						ctx.sessionData = filterObjByKeys(
							data.relation_users,
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
