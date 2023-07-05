import { PrismaClient } from "@prisma/client";
import { NormalizedAuthFields, SESSION_COOKIE_NAME } from "../../util/index.js";
import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";

const authenticate = (prisma: PrismaClient, normalizedAuthFields: NormalizedAuthFields) => {
	const { collectionKey, secretField, uniqueIdentifierField } = normalizedAuthFields;

	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { httpOnly, secure, originalMaxAge } = req.session.cookie;

			const data = await prisma[collectionKey].findUnique({
				where: {
					[uniqueIdentifierField]: req.body[uniqueIdentifierField],
				},
			});

			if (!data) {
				res.status(404);
				throw "User not found.";
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
					if (err) next(err);

					res.cookie(SESSION_COOKIE_NAME, req.session.id, {
						maxAge: Number(originalMaxAge),
						secure: Boolean(secure),
						httpOnly,
					});

					return res.redirect("/");
				}
			);
		} catch (err) {
			next(err);
		}
	};
};

export { authenticate };
