import { rest } from "msw";
import { getMetaDataStub } from "../metadata.stub";

export const handlers = [
	rest.get("/system-panda-api/metadata", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getMetaDataStub));
	}),
];
