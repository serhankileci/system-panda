import { appendFile } from "fs/promises";
import { writeOrAppend, SystemPandaError } from "./index.js";

async function logger(path: string, err: SystemPandaError | Error) {
	console.log(err);

	const date = new Date(Number(Date.now())).toLocaleDateString();
	const hour = new Date().toLocaleString("default", {
		hour: "2-digit",
		minute: "2-digit",
	});
	let delimiter = "####################\n";

	if (err instanceof SystemPandaError)
		delimiter = `${delimiter}[${hour} - ${date}]:\n\t[type]: ${err.name}\n\t[level]: ${err.level}\n\t[status]: ${err.status}\n\t[message]: ${err.message}\n####################\n\n`;
	else
		delimiter = `${delimiter}[${hour} - ${date}]:\n\t[type]: Error\n\t[message]: ${err}\n####################\n\n`;

	await appendFile(path, delimiter, { flag: await writeOrAppend(path) });
}

export { logger };
