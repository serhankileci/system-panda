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
import { DeepReadonly } from "utility-types";
import { SessionData } from "express-session";

/* ********** PLUGINS ********** */
type PluginExportFn = (ctx: Context) => Context | Promise<Context>;
type PluginFn = (prisma: PrismaClient) => PluginOperations;

type DatabasePlugin = {
	active: boolean;
	title: string;
	author: string;
	version: string;
	fn: PluginExportFn;
};
type Plugins = { active: DatabasePlugin[]; inactive: DatabasePlugin[] };
type PluginOperations = {
	load: () => Promise<Plugins>;
	enable: (title: string) => Promise<void>;
	disable: (title: string) => Promise<void>;
	install: (title: string) => Promise<void>;
	uninstall: (title: string) => Promise<void>;
};
/* ******************** */

/* ********** WEBHOOKS ********** */
type Webhook = {
	name: string;
	api: string;
	onOperation: ("create" | "read" | "update" | "delete")[];
	headers?: RequestHeaders;
};
type WebhookPayload = Request["body"];
type EventTriggerPayload = {
	timestamp: string;
	data: WebhookPayload;
	event: keyof typeof crudMapping;
	collection: {
		name: string;
		slug: string;
	};
};
type WebhookFn = (webhook: Webhook) => {
	init: () => void;
	trigger: (obj: EventTriggerPayload) => void;
};
/* ******************** */

/* ********** CONTEXT ********** */
type Context = {
	prisma: PrismaClient;
	collections: Collections;
	express: {
		req: ExpressRequest;
		res: ExpressResponse;
	};
	sessionData: Record<string, unknown> | undefined;
	bools: Record<string, boolean>;
	util: {
		currentHook: keyof CRUDHooks;
	};
	customVars: Record<string, unknown>;
};
/* ******************** */

/* ********** HOOKS ********** */
type ExistingData = any;
type InputData = any;

type CRUDHooks = {
	beforeOperation?: BeforeAfterOperation[];
	validateInput?: ModifyValidateInputOperation[];
	modifyInput?: ModifyValidateInputOperation[];
	afterOperation?: BeforeAfterOperation[];
};

type ReadonlyHookOperationArgs = {
	ctx: DeepReadonly<Omit<Context, "express" | "customVars">> & {
		express: {
			req: ExpressRequest;
			res: ExpressResponse;
		};
		customVars: Record<string, unknown>;
	};
} & {
	readonly existingData?: ExistingData;
	inputData?: InputData;
} & CRUD_Operation;

type Hook<T> = ({ ctx, operation, existingData, inputData }: ReadonlyHookOperationArgs) => T;

type BeforeAfterOperation = Hook<void>;
type ModifyValidateInputOperation = Hook<InputData | Promise<InputData>>;

/* ********** COLLECTIONS ********** */
type Collections = Record<string, Collection>;

type Collection = {
	id?: {
		name?: string;
		type: "autoincrement" | "uuid" | "cuid";
	};
	fields: {
		[key: string]: Field;
	};
	slug?: string;
	hooks?: CRUDHooks;
	webhooks?: Webhook[];
};

type CommonFieldProps = {
	unique?: boolean;
	required?: boolean;
	index?: boolean;
	map?: string;
};
type Field = RelationField | (OtherFields & CommonFieldProps);
type OtherFields = StringFields | NumField | BoolField | DateTimeField;
type RelationField = {
	type: "relation";
	ref: string;
	many: boolean;
};
type StringFields = {
	type: "String" | "Json";
	defaultValue?: string;
};
type NumField = {
	type: "number";
	defaultValue?: number;
	subtype: "Int" | "BigInt" | "Float" | "Decimal";
};
type BoolField = {
	type: "Boolean";
	defaultValue?: boolean;
};
type DateTimeField = {
	type: "DateTime";
	defaultValue?: { kind: "now" | "updatedAt" } | string;
};

/* ******************** */

/* ********** MIDDLEWARES ********** */
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
	serveStatic?: { root: string; options: ServeStaticOptions } | false;
	morgan?: morganOptions | false;
	cors?: CorsOptions | false;
	json?: bodyParser.OptionsJson | false;
	compression?: CompressionOptions | false;
	helmet?: HelmetOptions | false;
	urlencoded?: bodyParser.OptionsUrlencoded | false;
	rateLimit?: RateLimitOptions | false;
};

type morganOptions = {
	format: "combined" | "common" | "dev" | "short" | "tiny";
	options?: morgan.Options<ExpressRequest, ExpressResponse>;
};
/* ******************** */
type Database = {
	URI: string;
} & Omit<PrismaClientOptions, "datasources" | "__internal">;

type ExtendServer = (app: Express, ctx: Context) => void;

type AuthSession = {
	/**
	 * default: "user"
	 */
	collectionKey?: string;
	/**
	 * unique identifier field example: "email"
	 */
	uniqueIdentifierField?: string;
	/**
	 * default: "password"
	 * rename password field
	 */
	secretField?: string;
	initFirstAuth: { [key: string]: any };
	/**
	 * add collection fields to include in the session
	 * default: "*"
	 */
	sessionData?: "*" | string[];
	options: {
		/**
		 * default: 24 * 60 * 60 * 1000 (30 days)
		 */
		maxAge?: number;
		secret: string;
	};
};

type NormalizedAuthFields = {
	collectionKey: string;
	secretField: string;
	uniqueIdentifierField: string;
};

type Config = {
	db: Database;
	authSession: AuthSession;
	port: number;
	defaultMiddlewares?: DefaultMiddlewares;
	extendServer?: ExtendServer;
	healthCheck?:
		| {
				path?: string;
				data?: Record<string, any> | (() => Record<string, any>);
		  }
		| false;
};

type Options = {
	content: {
		collections: Collections;
		webhooks?: Webhook[];
	};
	config: Config;
};
type SP = (args: Options) => Promise<void>;
/* ******************** */

/* ********** MISC. ********** */
type MutableProps = {
	plugins: Plugins;
};
type CRUD_Operation = {
	readonly operation: "create" | "read" | "update" | "delete";
};
type RequestHeaders = {
	[K in keyof IncomingHttpHeaders as string extends K
		? never
		: number extends K
		? never
		: K]: IncomingHttpHeaders[K];
} & Record<string, string>;

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

declare global {
	/* eslint-disable no-var */
	// node globals have to be declared with var
	/* eslint-enable no-var */
}

declare module "express-session" {
	interface SessionData {
		userID?: string;
	}
}

interface CustomSessionData extends SessionData {
	userID?: string;
}

type AllPrismaErrors =
	| PrismaClientInitializationError
	| PrismaClientKnownRequestError
	| PrismaClientRustPanicError
	| PrismaClientUnknownRequestError
	| PrismaClientValidationError;
/* ******************** */

export {
	SP,
	Options,
	LogLevel,
	Database,
	Context,
	Collection,
	Collections,
	MiddlewareHandler,
	BeforeAfterMiddlewares,
	Method,
	DefaultMiddlewares,
	ExtendServer,
	AllPrismaErrors,
	PrismaClientRustPanicError,
	PrismaClientInitializationError,
	PrismaClientKnownRequestError,
	PrismaClientUnknownRequestError,
	PrismaClientValidationError,
	Webhook,
	WebhookFn,
	EventTriggerPayload,
	Plugins,
	PluginExportFn,
	PluginOperations,
	PluginFn,
	DatabasePlugin,
	CRUDHooks,
	BeforeAfterOperation,
	ModifyValidateInputOperation,
	MutableProps,
	Field,
	Config,
	AuthSession,
	NormalizedAuthFields,
	RelationField,
	CustomSessionData,
};
