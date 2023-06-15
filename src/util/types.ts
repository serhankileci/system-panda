import * as bodyParser from "body-parser";
import { Options as RateLimitOptions } from "express-rate-limit";
import { HelmetOptions } from "helmet";
import { ServeStaticOptions } from "serve-static";
import { CorsOptions } from "cors";
import { CompressionOptions } from "compression";
import morgan from "morgan";
import {
	Express,
	NextFunction as ExpressNext,
	Request as ExpressRequest,
	Response as ExpressResponse,
	Request,
} from "express";
import { PrismaClient } from "@prisma/client/index.js";
import { IncomingHttpHeaders } from "http";
import {
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientRustPanicError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
	PrismaClientOptions,
} from "@prisma/client/runtime/index.js";
import { crudMapping } from "./index.js";

type RequestHeaders = {
	[K in keyof IncomingHttpHeaders as string extends K
		? never
		: number extends K
		? never
		: K]: IncomingHttpHeaders[K];
} & Record<string, string>;

/* ░░░░░░░░░░░░░░░░░░░░ PLUGINS ░░░░░░░░░░░░░░░░░░░░ */
type PluginFn = (ctx: Context) => Context | Promise<Context>;
type DatabasePlugin = {
	active: boolean;
	title: string;
	author: string;
	version: string;
	fn: PluginFn;
};
type Plugins = { active: DatabasePlugin[]; inactive: DatabasePlugin[] };
type PluginOperations = {
	load: () => Promise<Plugins>;
	enable: (title: string) => Promise<void>;
	disable: (title: string) => Promise<void>;
	install: (title: string) => Promise<void>;
	uninstall: (title: string) => Promise<void>;
};
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

/* ░░░░░░░░░░░░░░░░░░░░ WEBHOOKS ░░░░░░░░░░░░░░░░░░░░ */
type Webhook = {
	name: string;
	api: string;
	// method: "GET" | "POST";
	onOperation: ("create" | "read" | "update" | "delete")[];
	headers?: RequestHeaders;
};
type WebhookPayload = Request["body"];
type EventTriggerPayload = {
	timestamp: string;
	data: WebhookPayload;
	event: keyof typeof crudMapping;
	collection: string;
};
type WebhookOperations = {
	init: () => void;
	trigger: (obj: EventTriggerPayload) => void;
};
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

/* ░░░░░░░░░░░░░░░░░░░░ FOR PROPS TYPES ░░░░░░░░░░░░░░░░░░░░ */
type OperationAccess = {
	create: CreateListAC;
	read: ReadListAC;
	update: UpdateListAC;
	delete: DeleteListAC;
};
type CreateListAC = (args: unknown) => void;
type ReadListAC = (args: unknown) => void;
type UpdateListAC = (args: unknown) => void;
type DeleteListAC = (args: unknown) => void;

type CRUD_Operation = {
	readonly operation: "create" | "read" | "update" | "delete";
};
type CU_Operation = { readonly operation: "create" | "update" };
type ExistingData = Record<string, unknown> | null | undefined;
type InputData = Record<string, unknown>;

type Context = {
	prisma: PrismaClient /*CollectionKeys*/;
	collections: Collections;
	express: {
		req: ExpressRequest;
		res: ExpressResponse;
	};
	sessionData: string[];
	bools: {
		isLocalhost: boolean;
	};
	util: {
		currentHook: keyof CRUDHooks;
	};
	customVars: Record<string, unknown>;
};
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

/* ░░░░░░░░░░░░░░░░░░░░ ACCESS CONTROL ░░░░░░░░░░░░░░░░░░░░ */
type Access = {
	operation: OperationAccess;
	filter: OperationAccess;
	item: OperationAccess;
};
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

/* ░░░░░░░░░░░░░░░░░░░░ HOOKS ░░░░░░░░░░░░░░░░░░░░ */
type CRUDHooks = {
	beforeOperation?: beforeOperation[]; // side effect, void
	validateInput?: validateInput[];
	modifyInput?: modifyInput[];
	afterOperation?: afterOperation[]; // side effect, void
};
type BeforeAfterArgs = { ctx: Context } & {
	existingData?: ExistingData;
	inputData?: InputData;
} & CRUD_Operation;
type ValidateInputObj = { ctx: Context } & {
	readonly existingData?: ExistingData;
	readonly inputData: InputData;
} & CU_Operation;

type beforeOperation = ({ ctx, operation, existingData, inputData }: BeforeAfterArgs) => void;
type afterOperation = ({ ctx, operation, existingData, inputData }: BeforeAfterArgs) => void;
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

type ModifyInputObj = { ctx: Context } & {
	existingData?: ExistingData;
	inputData: InputData;
} & CU_Operation;

type modifyInput = ({
	// input
	// existingItem
	ctx,
	operation,
}: ModifyInputObj) => Promise<InputData> | InputData;

type validateInput = ({
	// input,
	// existingItem,
	ctx,
	operation,
}: ValidateInputObj) => Promise<InputData> | InputData;
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

/* ░░░░░░░░░░░░░░░░░░░░ COLLECTIONS ░░░░░░░░░░░░░░░░░░░░ */
type Collections = Record<string, Collection>;

type CollectionID = {
	id?: {
		name: string;
		type: "autoincrement" | "uuid";
	};
};

type Collection = {
	fields: {
		[key: string]: Field;
	} & CollectionID;
	slug?: string;
	access?: Access;
	hooks?: CRUDHooks;
	webhooks?: Webhook[];
	// ui?: UI;
};

// type GlobalFieldConfig = any;
type TextFieldConfig = {
	validation?: unknown;
};
type ImageFieldConfig = unknown;
type UniqFieldProps = TextFieldConfig | ImageFieldConfig;
// type Text = (args: TextFieldConfig) => TextFieldConfig;
// type Image = (args: ImageFieldConfig) => ImageFieldConfig;

type CommonFieldProps = {
	required?: boolean;
	index?: unknown;

	hooks?: CRUDHooks;
	defaultValue?: string;

	// ui?: {
	// 	filterable?: unknown;
	// 	orderable?: unknown;
	// } & UI;
};

type Field = {
	type: "text" | "number" | "datetime" | "boolean";
	unique?: boolean;
} & CommonFieldProps &
	UniqFieldProps;

// type UI = {
// 	hidden: boolean;
// 	override: {
// 		components: Record<
// 			string,
// 			Record<
// 				string,
// 				{
// 					css: {
// 						[key: string]: (existingCSS: string) => Record<string, string>;
// 					};
// 					js: {
// 						[key: string]: (existingCSS: string) => Record<string, string>;
// 					};
// 				}
// 			>
// 		>;
// 	};
// };
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

/* ░░░░░░░░░░░░░░░░░░░░ MIDDLEWARES ░░░░░░░░░░░░░░░░░░░░ */
type BeforeAfterMiddlewares = {
	middlewares?: {
		before: MiddlewareHandler[];
		after: MiddlewareHandler[];
	};
};

type MiddlewareHandler = (
	req: ExpressRequest,
	res: ExpressResponse,
	next: ExpressNext
) => void | Promise<void>;

type DefaultMiddlewares = {
	session?: Express.SessionStore;
	serveStatic?: { root: string; options: ServeStaticOptions } | false;
	morgan?: morganOptions | false;
	cors?: CorsOptions | false;
	json?: bodyParser.OptionsJson | false;
	compression?: CompressionOptions | false;
	helmet?: HelmetOptions | false;
	urlencoded?: bodyParser.OptionsUrlencoded | false;
	rateLimit?: RateLimitOptions | false;
};
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */
type Database = {
	URI: string;
} & Omit<PrismaClientOptions, "datasources" | "__internal">;

type ExtendServer = (app: Express, ctx: Context) => void;

type Options = {
	content: {
		collections: Collections;
		webhooks?: Webhook[];
		// storage?: {
		// 	kind: "local" | "remote";
		// 	type: "file" | "image";
		// 	pathPrefix: string;
		// 	generateURL: (path: string) => string;
		// };
		// ui?: UI;
	};

	config: {
		// env?: "development" | "testing" | "staging" | "production";
		debug?: {
			verboseConsole?: boolean;
			logfiles?: boolean;
		};
		db: Database;
		// rootDir?: string;

		port: number;
		session?: {
			include: string[];
			/**
			 * default: SessionCookie, random secret, "users"
			 */
			secret: string;
			slug?: string;
		};
		defaultMiddlewares?: DefaultMiddlewares;
		/**
		 * extending the Express.js server
		 */
		extendServer?: ExtendServer;
	};
};
type SP = (args: Options) => Promise<void>;
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

/* ░░░░░░░░░░░░░░░░░░░░ MIDDLEWARES ░░░░░░░░░░░░░░░░░░░░ */
type morganOptions = {
	format: "combined" | "common" | "dev" | "short" | "tiny";
	options?: morgan.Options<ExpressRequest, ExpressResponse>;
};
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

/* ░░░░░░░░░░░░░░░░░░░░ FOR HELPERS ░░░░░░░░░░░░░░░░░░░░ */
type LogLevel = "informative" | "warning" | "error";
type Method =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "DELETE"
	| "HEAD"
	| "OPTIONS"
	| "TRACE"
	| "CONNECT";
/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

export {
	/* MISC */
	SP,
	Options,
	LogLevel,
	Database,
	Context,

	/* COLLECTIONS */
	Collection,
	Collections,

	/* SERVER */
	MiddlewareHandler,
	BeforeAfterMiddlewares,
	Method,
	DefaultMiddlewares,
	ExtendServer,

	/* PRISMA */
	PrismaClientRustPanicError,
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,

	/* HOOKS */
	CRUDHooks,
	CRUD_Operation,
	beforeOperation,
	validateInput,
	modifyInput,
	ExistingData,
	afterOperation,

	/* WEBHOOKS */
	Webhook,
	WebhookOperations,
	EventTriggerPayload,

	/* PLUGINS */
	Plugins,
	PluginFn,
	PluginOperations,
	DatabasePlugin,
};
