import { SESSION, store } from "../../util/index.js";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

const authenticate = () => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const db = store.db.get();
			const { name, secretField, identifierField } = store.tables.get().authentication.table;
			const { httpOnly, secure, originalMaxAge } = req.session.cookie;

			const missingCreds = [identifierField, secretField].filter(field => !req.body[field!]);
			if (missingCreds.length > 0)
				throw `Missing credentials: '${missingCreds.join("', '")}'.`;

			const data = await db[name!].findUnique({
				where: {
					[identifierField!]: req.body[identifierField!],
				},
			});

			if (!data) {
				res.status(404);
				throw `User ${req.body[identifierField!]} not found.`;
			}

			const isPasswordMatch = await bcrypt.compare(
				req.body[secretField!],
				data[secretField!]
			);

			if (!isPasswordMatch) {
				res.status(400);
				throw "Invalid password.";
			}

			req.sessionStore.set(
				req.session.id,
				{ cookie: req.session.cookie, userID: data.id },
				err => {
					if (err) return next(err);

					res.cookie(SESSION.COOKIE_NAME, req.session.id, {
						maxAge: Number(originalMaxAge),
						secure: Boolean(secure),
						httpOnly,
					});

					return res.sendStatus(200);
				}
			);
		} catch (err: unknown) {
			return next(err);
		}
	};
};

export { authenticate };
