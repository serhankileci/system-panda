import express, { Request, Response, NextFunction } from "express";
import morganPkg from "morgan";
import { rateLimit as rateLimitPkg } from "express-rate-limit";
import helmetPkg from "helmet";
import compressionPkg from "compression";
import corsPkg from "cors";
import { CK, Options, SESSION } from "../../util/index.js";
import sessionPkg from "express-session";
import { randomUUID } from "crypto";
import cookieParserPkg from "cookie-parser";
import { PrismaSessionStore } from "../../database/index.js";
import { PrismaClient } from "@prisma/client";

type Middlewares = ((req: Request, res: Response, next: NextFunction) => void)[];

const beforeMiddlewaresHandler = (
	serverOpt: Options,
	authOpt: Parameters<CK["authentication"]>["0"]["options"],
	db: PrismaClient
): Middlewares => {
	const { compression, cors, helmet, json, morgan, rateLimit, serveStatic, urlencoded } =
		serverOpt.server?.middlewares || {};
	const { secret, maxAge } = authOpt;

	const middlewares = [];

	if (morgan) middlewares.push(morganPkg(morgan.format, morgan.options));
	if (rateLimit) middlewares.push(rateLimitPkg(rateLimit));
	if (serveStatic) middlewares.push(express.static(serveStatic.root, serveStatic.options));

	middlewares.push(
		helmetPkg(helmet || {}),
		express.json(json || {}),
		express.urlencoded(urlencoded || { extended: false }),
		cookieParserPkg(),
		compressionPkg(compression || {}),
		corsPkg(cors || {}),
		sessionPkg({
			name: SESSION.COOKIE_NAME,
			store: new PrismaSessionStore(db),
			secret: secret || randomUUID(),
			cookie: {
				httpOnly: true,
				maxAge: maxAge || SESSION.MAX_AGE,
				secure: process.env.NODE_ENV === "production",
			},
			saveUninitialized: false,
			resave: false,
		})
	);

	return middlewares;
};

export { beforeMiddlewaresHandler };
