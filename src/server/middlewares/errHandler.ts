import { ContentKittyError, logToFile, isPrismaErr } from "../../util/index.js";
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
					err instanceof Error || err instanceof ContentKittyError ? err.message : err,
			});
		}
	}

	await logToFile(err as ContentKittyError | Error);
};

export { errHandler };
