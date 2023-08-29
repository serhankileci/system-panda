/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { rest } from "msw";

import config from "../../shared/config.ts";
import { getMetaDataStub } from "../metadata.stub.ts";
import {
	createCollectionAlbumStub,
	getCollectionAlbumFieldsStub,
	getCollectionAlbumStub,
	getCollectionStudentFieldsStub,
	getCollectionStudentStub,
	getSuccessfulItemDeletionStub,
	getSuccessfulItemUpdateStub,
} from "../stubs/collection.stub.ts";

export const handlers = [
	rest.get(config.apiUrl + "/metadata", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getMetaDataStub()));
	}),

	rest.get(config.apiUrl + "/fields/collection/album", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getCollectionAlbumFieldsStub()));
	}),

	rest.get(config.apiUrl + "/collections/album", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getCollectionAlbumStub()));
	}),

	rest.put(config.apiUrl + "/collections/album", async (req, res, ctx) => {
		const where = req.url.searchParams.get("where") as string;

		const id = (JSON.parse(where).id as number).toString();

		const body: {
			data: {
				[key: string]: unknown;
			};
		} = await req.json();

		return res(ctx.status(200), ctx.json(getSuccessfulItemUpdateStub(id, body)));
	}),

	rest.put(config.apiUrl + "/collections/album", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getCollectionAlbumStub()));
	}),

	rest.delete(config.apiUrl + "/collections/album", async (req, res, ctx) => {
		const body = await req.json();
		const id = body.where.id as string;

		return res(ctx.status(200), ctx.json(getSuccessfulItemDeletionStub(id)));
	}),

	rest.get(config.apiUrl + "/fields/collection/student", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getCollectionStudentFieldsStub()));
	}),

	rest.get(config.apiUrl + "/collections/student", (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(getCollectionStudentStub()));
	}),

	rest.post(config.apiUrl + "/collections/album", async (req, res, ctx) => {
		const body: {
			data: {
				[key: string]: unknown;
			};
		} = await req.json();

		return res(ctx.status(200), ctx.json(createCollectionAlbumStub(body)));
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
