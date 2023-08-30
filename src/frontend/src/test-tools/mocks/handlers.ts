import { rest } from "msw";
import { getMetaDataStub } from "../metadata.stub.ts";
import config from "../../shared/config.ts";

export const handlers = [
	rest.get(config.apiUrl + "/metadata", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getMetaDataStub));
	}),

	rest.post(config.apiUrl + "/auth/login", (req, res, ctx) => {
		const { email, password } = req.body as any;

		if (email === "admin@system-panda.com" && password !== "1234") {
			return res(
				ctx.status(400),
				ctx.json({
					errorMessage: "Invalid password.",
				})
			);
		}

		if (email === "admin@system-panda.com" && password === "1234") {
			return res(ctx.status(200, "OK"));
		}

		return res(ctx.status(500));
	}),
	rest.post(config.apiUrl + "/auth/logout", (_req, res, ctx) => {
		return res(ctx.status(200));
	}),
];
