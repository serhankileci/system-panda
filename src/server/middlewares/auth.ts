import { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE_NAME } from "../../util/index.js";

function ifAuthenticated(req: Request, res: Response, next: NextFunction) {
	req.sessionStore.get(req.cookies[SESSION_COOKIE_NAME], (err, session) => {
		if (err) return next(err);

		if (session) return next();
		else return res.redirect("/auth/login");
	});
}

function ifNotAuthenticated(req: Request, res: Response, next: NextFunction) {
	req.sessionStore.get(req.cookies[SESSION_COOKIE_NAME], (err, session) => {
		if (err) return next(err);

		if (session) return res.redirect("/");
		else return next();
	});
}

export { ifAuthenticated, ifNotAuthenticated };
