import { Request, Response, NextFunction, static as serveStatic } from "express";
import { Context, packageProjectDir } from "../../util/index.js";
import path from "node:path";

function internalMiddlewares(ctx: Context) {
	const loadCtxWithExpress = (req: Request, res: Response, next: NextFunction) => {
		if (!ctx.express) ctx.express = { req, res };
		next();
	};
	const systemPandaStatic = serveStatic(path.join(packageProjectDir, "system-panda-static"), {
		extensions: ["html"],
	});

	return [loadCtxWithExpress, systemPandaStatic];
}

export { internalMiddlewares };
