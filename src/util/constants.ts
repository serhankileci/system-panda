import { fileURLToPath } from "node:url";
import path from "node:path";

const PLUGINS_API =
	process.env.PLUGINS_API ||
	"https://mmhsc5ce5v3hv4qt64p4dpodom0msylf.lambda-url.eu-central-1.on.aws/plugins";
const projectDir = process.cwd();
const pluginsDir = `${projectDir}/plugins`;

const __filename = fileURLToPath(import.meta.url);
const basedir = path.resolve(path.dirname(__filename), "../..");

const logfile = `${projectDir}/system-panda.log` as const;
const crudMapping = {
	create: "POST",
	read: "GET",
	update: "PUT",
	delete: "DELETE",
} as const;
const flip = (data: object) => Object.fromEntries(Object.entries(data).map(([k, v]) => [v, k]));
const flippedCrudMapping = flip(crudMapping);

export { PLUGINS_API, crudMapping, basedir, flippedCrudMapping, projectDir, pluginsDir, logfile };
export const { NODE_ENV } = process.env;
