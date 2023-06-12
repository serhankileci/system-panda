import prisma from "@prisma/client";
const { Prisma } = prisma;

import { SystemPandaError, logfile, logger } from "../util/index.js";
import { ErrorRequestHandler } from "express";

const errHandler: ErrorRequestHandler = async (err, req, res, next) => {
	const isPrismaErr = [
		Prisma.PrismaClientInitializationError,
		Prisma.PrismaClientKnownRequestError,
		Prisma.PrismaClientRustPanicError,
		Prisma.PrismaClientUnknownRequestError,
		Prisma.PrismaClientValidationError,
	].some(x => err instanceof x);

	if (!res.headersSent) res.status(500).json(isPrismaErr ? err.message : err);
	await logger(logfile, err as SystemPandaError | Error);
	console.log(err);
};

export { errHandler };
