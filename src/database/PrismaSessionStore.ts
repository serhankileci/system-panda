import { PrismaClient } from "@prisma/client";
import { SessionData, Store } from "express-session";
import { CustomSessionData, getDataStore } from "../util/index.js";

class PrismaSessionStore extends Store {
	constructor(private prisma: PrismaClient) {
		super();
	}

	private async findSessionById(sid: string) {
		try {
			const session = await this.prisma.system_panda_sessions.findUnique({
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
			const relationKey = getDataStore().authFields.relationKey;

			await this.prisma.system_panda_sessions.upsert({
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
			await this.prisma.system_panda_sessions.delete({ where: { id: sid } });

			callback();
		} catch (err) {
			callback(err);
		}
	}
}

export { PrismaSessionStore };
