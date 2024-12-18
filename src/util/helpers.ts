import { access, constants, stat, appendFile } from "node:fs/promises";
import { Stats } from "node:fs";
import chalk from "chalk";
import { logPath } from "./constants.js";
import {
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientRustPanicError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
} from "@prisma/client/runtime/index.js";

type LogLevel = "informative" | "warning" | "error";

const PrismaErrors = [
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientRustPanicError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
];

const writeOrAppend = async (file: string, mb = 1) => {
	const data = await stat(file).catch(() => "w");

	if (data instanceof Stats) return data.size / (1024 * 1024) > mb ? "w" : "a";

	return "w";
};

const pathExists = (path: string) =>
	access(path, constants.F_OK)
		.then(() => true)
		.catch(() => false);

const selectOnQuery = (obj: object, keys: "*" | string[]) =>
	Object.fromEntries(
		Object.keys(obj).map(key =>
			keys === "*" || keys.includes(key) ? [key, true] : [key, false]
		)
	);

const nullIfEmptyArrOrObj = (x: unknown[] | Record<string, unknown>) =>
	(Array.isArray(x) && x.length > 0) || Object.keys(x).length > 0 ? x : null;

const isPrismaErr = (err: unknown) =>
	PrismaErrors.some(pErr => err?.constructor?.name === pErr.name);

function filterObjByKeys<T extends object>(obj: T, keys: (keyof T)[]) {
	const filteredObj: Partial<T> = {};

	[...new Set(keys)].forEach(key => {
		if (obj.hasOwnProperty(key)) {
			filteredObj[key] = obj[key];
		}
	});

	return filteredObj;
}

const log = (message: string, kind: "info" | "success" | "failure"): void => {
	const kinds = {
		info: "blueBright",
		success: "greenBright",
		failure: "redBright",
	} as const;

	console.log(chalk[kinds[kind]](`🐱 Content Kitty: ${message}`));
};

async function logToFile(err: ContentKittyError | Error) {
	log(err.message, "failure");

	const date = new Date(Number(Date.now())).toLocaleDateString();
	const hour = new Date().toLocaleString("default", {
		hour: "2-digit",
		minute: "2-digit",
	});
	let delimiter = "####################\n";

	if (err instanceof ContentKittyError)
		delimiter = `${delimiter}[${hour} - ${date}]:\n\t[type]: ${err.name}\n\t[level]: ${err.level}\n\t[status]: ${err.status}\n\t[message]: ${err.message}\n####################\n\n`;
	else
		delimiter = `${delimiter}[${hour} - ${date}]:\n\t[type]: Error\n\t[message]: ${err}\n####################\n\n`;

	await appendFile(logPath, delimiter, { flag: await writeOrAppend(logPath) });
}

class ContentKittyError extends Error {
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

		Error.captureStackTrace(this, this.constructor);
	}
}

export {
	writeOrAppend,
	pathExists,
	selectOnQuery,
	nullIfEmptyArrOrObj,
	isPrismaErr,
	filterObjByKeys,
	logToFile,
	log,
	ContentKittyError,
};
