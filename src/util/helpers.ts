import { access, constants, stat } from "fs/promises";
import { Stats } from "fs";

const writeOrAppend = async (file: string, mb = 1) => {
	const data = await stat(file).catch(() => "w");

	if (data instanceof Stats) return data.size / (1024 * 1024) > mb ? "w" : "a";

	return "w";
};

const pathExists = (path: string) =>
	access(path, constants.F_OK)
		.then(() => true)
		.catch(() => false);

const toPascalCase = (str: string) =>
	str
		.split(/[^a-zA-Z0-9]/g)
		.map(group => group[0].toUpperCase() + group.slice(1))
		.join("");

const selectOnQuery = (obj: object, keys: "*" | string[]) =>
	Object.fromEntries(
		Object.keys(obj).map(key =>
			keys === "*" || keys.includes(key) ? [key, true] : [key, false]
		)
	);

export { writeOrAppend, pathExists, toPascalCase, selectOnQuery };
