import express from "express";
import { ifAuthenticated, ifNotAuthenticated } from "../middlewares/index.js";
import { SESSION } from "../../util/index.js";
import { authenticate } from "../controllers/index.js";
const authRouter = express.Router();

authRouter
	.post("/login", ifNotAuthenticated, authenticate)
	.post("/logout", ifAuthenticated, (req, res, next) => {
		req.sessionStore.destroy(req.cookies[SESSION.COOKIE_NAME], err => {
			if (err) next(err);

			res.clearCookie(SESSION.COOKIE_NAME);
			res.send("Logged out.");
		});
	});

export { authRouter };
