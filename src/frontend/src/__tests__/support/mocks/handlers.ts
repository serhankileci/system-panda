/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { rest } from "msw";

import config from "../../../shared/config.ts";
import {
	createCollectionAlbumStub,
	createCollectionStudentStub,
	getCollectionAlbumStub,
	getCollectionStudentStub,
	getSuccessfulItemDeletionStub,
	getSuccessfulItemUpdateStub,
} from "../../stubs/collection.stub.ts";
import { getMetaDataStub } from "../../stubs/metadata.stub.ts";

export const handlers = [
	rest.get(config.apiUrl + "/collections", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getMetaDataStub()));
	}),

	rest.get(config.apiUrl + "/collections/record", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getCollectionAlbumStub()));
	}),

	rest.put(config.apiUrl + "/collections/record", async (req, res, ctx) => {
		const where = req.url.searchParams.get("where") as string;

		const id = (JSON.parse(where).id as number).toString();

		const body: {
			data: {
				[key: string]: unknown;
			};
		} = await req.json();

		return res(ctx.status(200), ctx.json(getSuccessfulItemUpdateStub(id, body)));
	}),

	rest.put(config.apiUrl + "/collections/record", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getCollectionAlbumStub()));
	}),

	rest.delete(config.apiUrl + "/collections/record", async (req, res, ctx) => {
		const body = await req.json();
		const id = body.where.id as string;

		return res(ctx.status(200), ctx.json(getSuccessfulItemDeletionStub(id)));
	}),

	rest.post(config.apiUrl + "/collections/record", async (req, res, ctx) => {
		const body: {
			data: {
				[key: string]: unknown;
			};
		} = await req.json();

		return res(ctx.status(200), ctx.json(createCollectionAlbumStub(body)));
	}),

	rest.get(config.apiUrl + "/collections/student", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getCollectionStudentStub()));
	}),

	rest.post(config.apiUrl + "/collections/student", async (req, res, ctx) => {
		const body: {
			data: {
				[key: string]: unknown;
			};
		} = await req.json();

		return res(ctx.status(200), ctx.json(createCollectionStudentStub(body.data)));
	}),

	rest.put(config.apiUrl + "/collections/student", async (req, res, ctx) => {
		const body: {
			data: {
				[key: string]: unknown;
			};
			where?: {
				id?: string;
			};
		} = await req.json();

		const id = body.where?.id;

		return res(ctx.status(200), ctx.json(getSuccessfulItemUpdateStub(id!, body)));
	}),

	rest.post(config.apiUrl + "/auth/login", (req, res, ctx) => {
		const { email, password } = req.body as { email: string; password: string };

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
