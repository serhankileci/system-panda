import * as url from "url";
import { AuthenticationTable, CRUD, RequestMethods } from "./types.js";

const __dirname = url.fileURLToPath(new URL("..", import.meta.url));

// let the user define a plugin repository in case the repo url changes
const PLUGINS_API =
	process.env.CK_PLUGINS_API ||
	"https://mmhsc5ce5v3hv4qt64p4dpodom0msylf.lambda-url.eu-central-1.on.aws/plugins";
const packageRootDir = __dirname;
const packageAssetsDir = `${packageRootDir}server/assets`;
const userDir = process.cwd();
const internalTablePrefix = "content_kitty";
const ck = "content-kitty";
const internalTablesKeys = {
	users: `${internalTablePrefix}__users`,
	sessions: `${internalTablePrefix}__sessions`,
	plugins: `${internalTablePrefix}__plugins`,
} as const;
const logPath = `${userDir}/${ck}.log` as const;

// request method / crud operation mappings
const crudMapping: Record<CRUD, RequestMethods["main"]> = {
	create: "POST",
	read: "GET",
	update: "PUT",
	delete: "DELETE",
} as const;
const methodMapping: Record<RequestMethods["main"], CRUD> = {
	POST: "create",
	GET: "read",
	PUT: "update",
	DELETE: "delete",
} as const;

const SESSION = {
	COOKIE_NAME: `${ck}-sid`,
	MAX_AGE: 60 * 60 * 24 * 30 * 1000,
};

// Content Kitty routes
const routes = {
	assets: `/${ck}-assets`,
	api: `/${ck}-api`,
} as const;

const defaultAuthFields = {
	name: "User",
	identifierField: "email",
	secretField: "password",
	roleField: "user_type",
} as const satisfies Required<
	Pick<AuthenticationTable, "name" | "identifierField" | "roleField" | "secretField">
>;

export {
	ck,
	internalTablePrefix,
	routes,
	PLUGINS_API,
	crudMapping,
	methodMapping,
	userDir,
	logPath,
	packageRootDir,
	SESSION,
	packageAssetsDir,
	internalTablesKeys,
	defaultAuthFields,
};
