import { NextFunction, Request, Response } from "express";
import { SESSION } from "../../util/index.js";

function ifAuthenticated(req: Request, res: Response, next: NextFunction) {
	try {
		req.sessionStore.get(req.cookies[SESSION.COOKIE_NAME], (err, session) => {
			if (err) return next(err);

			if (session) return next();
			else return res.sendStatus(401);
		});
	} catch (err) {
		next(err);
	}
}

function ifNotAuthenticated(req: Request, res: Response, next: NextFunction) {
	try {
		req.sessionStore.get(req.cookies[SESSION.COOKIE_NAME], (err, session) => {
			if (err) return next(err);

			if (session) return res.sendStatus(200);
			else return next();
		});
	} catch (err) {
		next(err);
	}
}

export { ifAuthenticated, ifNotAuthenticated };
