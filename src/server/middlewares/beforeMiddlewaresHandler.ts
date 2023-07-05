import { json, urlencoded, static as serveStatic } from "express";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import {
	AuthSession,
	DefaultMiddlewares,
	MiddlewareHandler,
	SESSION_COOKIE_NAME,
} from "../../util/index.js";
import session from "express-session";
import { randomUUID } from "crypto";
import cookieParser from "cookie-parser";
import { PrismaClient } from "@prisma/client";
import { PrismaSessionStore } from "../../db/index.js";

const beforeMiddlewaresHandler = (
	defaultMiddlewares: DefaultMiddlewares,
	authSession: AuthSession,
	prisma: PrismaClient
): MiddlewareHandler[] => {
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
	const { secret, maxAge } = authSession.options;

	const middlewares = [
		helmet(helmetOpt || {}),
		json(jsonOpt || {}),
		urlencoded(urlencodedOpt || { extended: false }),
		cookieParser(),
		compression(compressionOpt || {}),
		cors(corsOpt || {}),
		session({
			name: SESSION_COOKIE_NAME,
			store: new PrismaSessionStore(prisma),
			secret: secret || randomUUID(),
			cookie: {
				httpOnly: true,
				maxAge: maxAge || 24 * 60 * 60 * 1000,
				secure: process.env.NODE_ENV === "production",
			},
			saveUninitialized: false,
			resave: false,
		}),
	];

	if (morganOpt) middlewares.push(morgan(morganOpt.format, morganOpt.options));
	if (rateLimitOpt) middlewares.push(rateLimit(rateLimitOpt));
	if (serveStaticOpt) middlewares.push(serveStatic(serveStaticOpt.root, serveStaticOpt.options));

	return middlewares;
};

export { beforeMiddlewaresHandler };
