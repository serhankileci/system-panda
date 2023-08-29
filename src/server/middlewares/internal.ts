import { Request, Response, NextFunction } from "express";
import {
	Context,
	SESSION,
	filterObjByKeys,
	getConfigStore,
	getDataStore,
} from "../../util/index.js";

function internalMiddlewares(ctx: Context) {
	const {
		settings: { authSession },
	} = getConfigStore();
	const loadCtxWithData = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { relationKey, secretField } = getDataStore().authFields;

			ctx.express = { req, res };

			if (req.cookies[SESSION.COOKIE_NAME]) {
				const data = await ctx.prisma.system_panda_sessions.findUnique({
					where: { id: req.cookies[SESSION.COOKIE_NAME] },
					include: { [relationKey]: true },
				});

				if (data?.[relationKey]) {
					if (!authSession.sessionData || authSession.sessionData === "*") {
						ctx.sessionData = { ...data[relationKey], [secretField]: null };
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
		} catch (err: unknown) {
			next(err);
		}
	};

	return [loadCtxWithData];
}

export { internalMiddlewares };
