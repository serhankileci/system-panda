import { SESSION, getDataStore } from "../../util/index.js";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { prisma, authFields } = getDataStore();
		const { collectionKey, secretField, uniqueIdentifierField } = authFields;
		const { httpOnly, secure, originalMaxAge } = req.session.cookie;

		const missingCreds = [uniqueIdentifierField, secretField].filter(field => !req.body[field]);
		if (missingCreds.length > 0) throw `Missing credentials: '${missingCreds.join("', '")}'.`;

		const data = await prisma[collectionKey].findUnique({
			where: {
				[uniqueIdentifierField]: req.body[uniqueIdentifierField],
			},
		});

		if (!data) {
			res.status(404);
			throw `User ${req.body[uniqueIdentifierField]} not found.`;
		}

		const isPasswordMatch = await bcrypt.compare(req.body[secretField], data[secretField]);

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

export { authenticate };
