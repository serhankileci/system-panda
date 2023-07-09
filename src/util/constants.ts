import * as url from "url";

const __dirname = url.fileURLToPath(new URL("..", import.meta.url));
const PLUGINS_API =
	process.env.PLUGINS_API ||
	"https://mmhsc5ce5v3hv4qt64p4dpodom0msylf.lambda-url.eu-central-1.on.aws/plugins";
const packageProjectDir = __dirname;
const userProjectDir = process.cwd();
const pluginsDir = `${userProjectDir}/plugins`;
const logfile = `${userProjectDir}/system-panda.log` as const;
const crudMapping = {
	create: "POST",
	read: "GET",
	update: "PUT",
	delete: "DELETE",
} as const;
const flip = (data: object) => Object.fromEntries(Object.entries(data).map(([k, v]) => [v, k]));
const flippedCrudMapping = flip(crudMapping);
const SESSION = {
	COOKIE_NAME: "system-panda-sid",
	MAX_AGE: 60 * 60 * 24 * 30 * 1000,
};

export {
	PLUGINS_API,
	crudMapping,
	flippedCrudMapping,
	userProjectDir,
	pluginsDir,
	logfile,
	packageProjectDir,
	SESSION,
};
export const { NODE_ENV } = process.env;
