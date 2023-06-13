import {
	SystemPandaError,
	logfile,
	logger,
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientRustPanicError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
} from "../util/index.js";
import { ErrorRequestHandler } from "express";

const errHandler: ErrorRequestHandler = async (err, req, res, next) => {
	const isPrismaErr = [
		PrismaClientInitializationError,
		PrismaClientKnownRequestError,
		PrismaClientRustPanicError,
		PrismaClientUnknownRequestError,
		PrismaClientValidationError,
	].some(x => err instanceof x);

	if (!res.headersSent) res.status(500).json(isPrismaErr ? err.message : err);
	await logger(logfile, err as SystemPandaError | Error);
	console.log(err);
};

export { errHandler };
