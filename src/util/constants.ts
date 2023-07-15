import * as url from "url";

const __dirname = url.fileURLToPath(new URL("..", import.meta.url));
const PLUGINS_API =
	process.env.PLUGINS_API ||
	"https://mmhsc5ce5v3hv4qt64p4dpodom0msylf.lambda-url.eu-central-1.on.aws/plugins";
const packageProjectDir = __dirname;
const staticDir = `${packageProjectDir}server/static`;
const userProjectDir = process.cwd();
const cmsTablePrefix = "system_panda";
const cmsNamePrefix = "system-panda";
const logfile = `${userProjectDir}/${cmsNamePrefix}.log` as const;
const crudMapping = {
	create: "POST",
	read: "GET",
	update: "PUT",
	delete: "DELETE",
} as const;
const methodMapping = {
	POST: "create",
	GET: "read",
	PUT: "update",
	DELETE: "delete",
} as const;
const SESSION = {
	COOKIE_NAME: `${cmsNamePrefix}-sid`,
	MAX_AGE: 60 * 60 * 24 * 30 * 1000,
};
const routes = {
	static: `/${cmsNamePrefix}-static`,
	api: `/${cmsNamePrefix}-api`,
} as const;

export {
	cmsNamePrefix,
	cmsTablePrefix,
	routes,
	PLUGINS_API,
	crudMapping,
	methodMapping,
	userProjectDir,
	logfile,
	packageProjectDir,
	SESSION,
	staticDir,
};
export const { NODE_ENV } = process.env;
