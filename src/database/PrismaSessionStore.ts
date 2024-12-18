import { PrismaClient } from "@prisma/client";
import { SessionData, Store } from "express-session";
import { internalTablesKeys, store } from "../util/index.js";

interface CustomSessionData extends SessionData {
	userID?: string;
}

declare module "express-session" {
	interface SessionData {
		userID?: string;
	}
}

class PrismaSessionStore extends Store {
	constructor(private prisma: PrismaClient) {
		super();
	}

	private async findSessionById(sid: string) {
		try {
			const session = await this.prisma[internalTablesKeys.sessions].findUnique({
				where: { id: sid },
			});

			return session ? session.data : null;
		} catch (err) {
			return null;
		}
	}

	async get(sid: string, callback: (err: any, session?: SessionData | null) => void) {
		try {
			const session = await this.findSessionById(sid);

			callback(null, session);
		} catch (err) {
			callback(err);
		}
	}

	async set(sid: string, session: CustomSessionData, callback: (err?: any) => void) {
		try {
			const { userID, ...rest } = session;
			const relationKey = "relation_" + store.tables.get().authentication.table.name;

			await this.prisma[internalTablesKeys.sessions].upsert({
				where: { id: sid },
				create: {
					id: sid,
					data: rest,
					[relationKey]: {
						connect: { id: Number(userID) },
					},
				},
				update: { data: session },
			});

			callback();
		} catch (err) {
			callback(err);
		}
	}

	async destroy(sid: string, callback: (err?: any) => void) {
		try {
			await this.prisma[internalTablesKeys.sessions].delete({ where: { id: sid } });

			callback();
		} catch (err) {
			callback(err);
		}
	}
}

export { PrismaSessionStore };
