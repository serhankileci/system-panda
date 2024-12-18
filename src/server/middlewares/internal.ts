import { Request, Response, NextFunction } from "express";
import { Context, SESSION, filterObjByKeys, internalTablesKeys, store } from "../../util/index.js";

function internalMiddlewares(ctx: Context) {
	const loadCtxWithData = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { options, table } = store.tables.get().authentication;
			ctx.express = { req, res };

			if (req.cookies[SESSION.COOKIE_NAME]) {
				const data = await ctx.db[internalTablesKeys.sessions].findUnique({
					where: { id: req.cookies[SESSION.COOKIE_NAME] },
					include: { ["relation_" + table.name]: true },
				});

				if (data?.["relation_" + table.name]) {
					if (!options.data || options.data === "*") {
						ctx.session = {
							...data["relation_" + table.name],
							[table.secretField!]: null,
						};
					} else if (Array.isArray(options.data) && options.data.length > 0) {
						ctx.session = filterObjByKeys(data["relation_" + table.name], options.data);
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
