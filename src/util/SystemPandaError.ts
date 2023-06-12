import { LogLevel } from "./types.js";

class SystemPandaError extends Error {
	message: string;
	level: LogLevel;
	status?: number | null;

	constructor({
		message,
		level,
		status,
	}: {
		message: string;
		level: LogLevel;
		status?: number | null;
	}) {
		super(message);

		this.level = level;
		this.name = this.constructor.name;
		this.status = status || null;
		this.message = message;
		// Error.captureStackTrace(this, this.constructor);
	}
}

export { SystemPandaError };
