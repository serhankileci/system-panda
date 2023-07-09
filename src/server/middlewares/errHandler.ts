import { SystemPandaError, logfile, logger, isPrismaErr } from "../../util/index.js";
import { ErrorRequestHandler } from "express";

const errHandler: ErrorRequestHandler = async (err, req, res, next) => {
	if (!res.headersSent) {
		if (isPrismaErr(err)) {
			res.status(500).json({ success: false, message: err.message });
		} else {
			res.status(500).json({
				success: false,
				message:
					err instanceof Error || err instanceof SystemPandaError ? err.message : err,
			});
		}
	}

	await logger(logfile, err as SystemPandaError | Error);
};

export { errHandler };
