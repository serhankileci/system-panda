import { json, urlencoded, static as serveStatic } from "express";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import { DefaultMiddlewares, MiddlewareHandler } from "../../util/index.js";

const beforeMiddlewaresHandler = (defaultMiddlewares: DefaultMiddlewares): MiddlewareHandler[] => {
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

	const middlewares = [
		helmet(helmetOpt || {}),
		json(jsonOpt || {}),
		urlencoded(urlencodedOpt || { extended: false }),
		compression(compressionOpt || {}),
		cors(corsOpt || {}),
	];

	if (morganOpt) middlewares.push(morgan(morganOpt.format, morganOpt.options));
	if (rateLimitOpt) middlewares.push(rateLimit(rateLimitOpt));
	if (serveStaticOpt) middlewares.push(serveStatic(serveStaticOpt.root, serveStaticOpt.options));

	return middlewares;
};

export { beforeMiddlewaresHandler };
