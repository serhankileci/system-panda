import { access, constants, stat } from "fs/promises";
import { Stats } from "fs";
import {
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientRustPanicError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
} from "./types.js";

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
	[
		PrismaClientInitializationError,
		PrismaClientKnownRequestError,
		PrismaClientRustPanicError,
		PrismaClientUnknownRequestError,
		PrismaClientValidationError,
	].some(x => err?.constructor.name === x.name);

function filterObjByKeys<T extends object>(obj: T, keys: (keyof T)[]) {
	const filteredObj: Partial<T> = {};

	keys.forEach(key => {
		if (obj.hasOwnProperty(key)) {
			filteredObj[key] = obj[key];
		}
	});

	return filteredObj;
}

export {
	writeOrAppend,
	pathExists,
	selectOnQuery,
	nullIfEmptyArrOrObj,
	isPrismaErr,
	filterObjByKeys,
};
