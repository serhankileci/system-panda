import { Stats } from "fs";
import { stat } from "fs/promises";

const writeOrAppend = async (file: string, mb = 1) => {
	const data = await stat(file).catch(() => "w");

	if (data instanceof Stats) return data.size / (1024 * 1024) > mb ? "w" : "a";

	return "w";
};

export { writeOrAppend };
