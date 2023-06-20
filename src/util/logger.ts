import { appendFile } from "fs/promises";
import { writeOrAppend, SystemPandaError } from "./index.js";

async function logger(path: string, err: SystemPandaError | Error) {
	const date = new Date(Number(Date.now())).toLocaleDateString();
	const hour = new Date(date).toLocaleString("default", {
		hour: "2-digit",
		minute: "2-digit",
	});
	let content = "####################\n";

	if (err instanceof SystemPandaError)
		content = `${content}[${hour} - ${date}]:\n\t[type]: ${err.name}\n\t[level]: ${err.level}\n\t[status]: ${err.status}\n\t[message]:${err.message}\n####################\n`;
	else
		content = `${content}[${hour} - ${date}]:\n[type]: Unintentional Error\n${err}\n####################\n`;

	await appendFile(path, content, { flag: await writeOrAppend(path) });
}

export { logger };
