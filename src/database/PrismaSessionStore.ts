import { PrismaClient } from "@prisma/client";
import { SessionData, Store } from "express-session";
import { CustomSessionData, getDataStore } from "../util/index.js";

class PrismaSessionStore extends Store {
	constructor(private prisma: PrismaClient) {
		super();
	}

	private async findSessionById(sid: string) {
		try {
			const session = await this.prisma.systemPandaSession.findUnique({
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

			await this.prisma.systemPandaSession.upsert({
				where: { id: sid },
				create: {
					id: sid,
					data: rest,
					[getDataStore().authFields.relationKey]: {
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
			await this.prisma.systemPandaSession.delete({ where: { id: sid } });

			callback();
		} catch (err) {
			callback(err);
		}
	}
}

export { PrismaSessionStore };
