import { SystemPandaError, logfile, logger, isPrismaErr } from "../../util/index.js";
import { ErrorRequestHandler } from "express";

const errHandler: ErrorRequestHandler = async (err, _, res, __) => {
	const success = false;

	if (!res.headersSent) {
		res.status(500);

		if (isPrismaErr(err)) {
			res.json({ success, message: err.message });
		} else {
			res.json({
				success,
				message:
					err instanceof Error || err instanceof SystemPandaError ? err.message : err,
			});
		}
	}

	await logger(logfile, err as SystemPandaError | Error);
};

export { errHandler };
