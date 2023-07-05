import express from "express";
import { PrismaClient } from "@prisma/client";
import { ifAuthenticated, ifNotAuthenticated } from "../middlewares/index.js";
import { NormalizedAuthFields, SESSION_COOKIE_NAME } from "../../util/index.js";
import { authenticate } from "../controllers/index.js";
const router = express.Router();

const authRouter = (prisma: PrismaClient, normalizedAuthFields: NormalizedAuthFields) => {
	return router
		.get("/login", ifNotAuthenticated, (req, res) =>
			res.render("auth", {
				title: "SystemPanda - Login",
				page: "login",
			})
		)
		.post("/login", ifNotAuthenticated, authenticate(prisma, normalizedAuthFields))
		.get("/logout", ifAuthenticated, (req, res) => {
			res.render("auth", {
				title: "SystemPanda - Logout",
				page: "logout",
			});
		})
		.post("/logout", ifAuthenticated, (req, res, next) => {
			req.sessionStore.destroy(req.cookies[SESSION_COOKIE_NAME], err => {
				if (err) next(err);
				res.clearCookie(SESSION_COOKIE_NAME);
				res.send("Logged out.");
			});
		});
};

export { authRouter };
