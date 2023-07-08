import express from "express";
import { ifAuthenticated, ifNotAuthenticated } from "../middlewares/index.js";
import { SESSION } from "../../util/index.js";
import { authenticate } from "../controllers/index.js";
const authRouter = express.Router();

authRouter
	.get("/login", ifNotAuthenticated, (req, res) =>
		res.render("auth", {
			title: "SystemPanda - Login",
			page: "login",
		})
	)
	.post("/login", ifNotAuthenticated, authenticate)
	.get("/logout", ifAuthenticated, (req, res) => {
		res.render("auth", {
			title: "SystemPanda - Logout",
			page: "logout",
		});
	})
	.post("/logout", ifAuthenticated, (req, res, next) => {
		req.sessionStore.destroy(req.cookies[SESSION.COOKIE_NAME], err => {
			if (err) next(err);

			res.clearCookie(SESSION.COOKIE_NAME);
			res.send("Logged out.");
		});
	});

export { authRouter };
