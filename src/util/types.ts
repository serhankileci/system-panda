import * as bodyParser from "body-parser";
import { Options as RateLimitOptions } from "express-rate-limit";
import { HelmetOptions } from "helmet";
import { ServeStaticOptions } from "serve-static";
import { CorsOptions } from "cors";
import { CompressionOptions } from "compression";
import morgan from "morgan";
import { Express, Request, Response } from "express";
import { PrismaClient } from "@prisma/client/index.js";
import { IncomingHttpHeaders } from "node:http";
import { defaultAuthFields } from "./index.js";
import { DeepReadonly, Optional } from "utility-types";

/**********************/

declare global {
	/* eslint-disable no-var */
	// node globals have to be declared with var
	/* eslint-enable no-var */
}

/*********** UTILITY TYPES ***********/
type InferringSelf<Self, T> = Self extends unknown ? T : Self;

type FieldSuggestiontables<
	FieldNames extends string[],
	AuthTableName extends string | undefined
> = {
	[K in keyof FieldNames]: Table<FieldNames[K], FieldNames[number], AuthTableName>;
};

type NonEmptyArray<T> = [T, ...T[]];

/*********** PACKAGE TYPES ***********/
type ExistingData = any;
type InputData = any;
type CRUD = "create" | "read" | "update" | "delete";
type RequestMethods = {
	main: "GET" | "POST" | "PUT" | "DELETE";
	others: "PATCH" | "HEAD" | "OPTIONS" | "TRACE" | "CONNECT";
};
type Locale = "en" | "tr" | "de" | "ru" | "cn" | "jp" | "it" | "fr";
type Labels = Partial<Record<Exclude<Locale, "en">, string>>;

type DatabasePlugin = {
	active: boolean;
	title: string;
	author: string;
	version: string;
	sourceCode: (ctx: Context) => Context | Promise<Context>;
};

type ActiveInactivePlugins = { active: DatabasePlugin[]; inactive: DatabasePlugin[] };

type Plugins = {
	database: () => PrismaClient;
	load: () => Promise<ActiveInactivePlugins>;
	enable: (title: string) => Promise<void>;
	disable: (title: string) => Promise<void>;
	install: (title: string) => Promise<void>;
	uninstall: (title: string) => Promise<void>;
};

type Webhook = {
	name: string;
	api: string;
	onOperation: CRUD[];
	headers?: IncomingHttpHeaders;
};

type EventTriggerPayload = {
	timestamp: string;
	data: Request["body"];
	event: CRUD;
	table: {
		name: string;
		slug: string;
	};
};

type WebhookFunc = (webhook: Webhook) => {
	init: () => void;
	trigger: (obj: EventTriggerPayload) => void;
};

type HookFunc = ({ hook, onTrigger }: { hook: keyof Hooks; onTrigger: () => void }) => {
	init: () => void;
	trigger: () => void;
};

type Context = {
	db: PrismaClient;
	tables: Table[];
	express: {
		req: Request;
		res: Response;
	};
	session: Record<string, unknown> | undefined;
	util: {
		currentHook: keyof Hooks;
	};
	custom: Record<string, unknown>;
};

type Hooks = {
	beforeOperation?: Hook<boolean | Promise<boolean>>[];
	validateInput?: Hook<InputData | Promise<InputData>>[];
	modifyInput?: Hook<InputData | Promise<InputData>>[];
	afterOperation?: Hook<void | Promise<void>>[];
};

type HookOperationArgs = {
	ctx: DeepReadonly<Omit<Context, "express" | "custom">> & {
		express: {
			req: Request;
			res: Response;
		};
		custom: Record<string, unknown>;
	};
} & {
	readonly existingData?: ExistingData;
	inputData?: InputData;
	readonly operation: CRUD;
};

type Hook<T> = ({ ctx, operation, existingData, inputData }: HookOperationArgs) => T;

type Options = {
	database: string;
	server?: {
		/**
		 * Server port.
		 * default: 3000
		 */
		port?: number;
		/**
		 * Extend the underlying Express.js server by writing your own custom endpoints.
		 */
		extend?: (app: Express, context: Context) => void;
		/**
		 * Middlewares turned on by default.
		 * Caution: turning certain middlewares off can cause Content Kitty to malfunction.
		 */
		middlewares?: DefaultMiddlewares;
	};
	/**
	 * When true, Content Kitty does not serve a frontend admin panel.
	 * default: false
	 */
	disableAdminUI?: boolean;
	/**
	 * initial decider for whether the user should be able to access a resource
	 * returning false here will immediately respond with Unauthorized
	 * and no operation will have ran
	 * CONSIDERING REPLACING THIS WITH A publicPages array property to
	 * let developers decide public routes
	 */
	isAccessAllowed?: (context: Context) => boolean;
	/**
	 * default: {
	 *     status: "healthy" | "warning" | "error",
	 *     timestamp: new Date().toISOString(),
	 *     uptime: process.uptime()
	 * }
	 */
	healthCheck?:
		| {
				/**
				 * The endpoint to serve the health check from.
				 */
				path?: string;
				/**
				 * Response body to send.
				 */
				data?: (context: Context) => Record<string, any> | any[];
		  }
		| false;
};

type AuthenticationTable = Omit<Optional<Table, "fields">, "name"> & {
	/**
	 * Table name.
	 * default: "User"
	 */
	name?: string;
	/**
	 * Unique identifier.
	 * default: "email"
	 */
	identifierField?: string;
	/**
	 * default: "password"
	 */
	secretField?: string;
	/**
	 * default: "user_type"
	 */
	roleField?: string;
};

type CK = {
	/**
	 * Set authentication method, initial authentication row, what data to keep in the session, etc.
	 */
	authentication: <const AuthenticationClctn extends AuthenticationTable>(
		args: {
			table?: AuthenticationClctn;
		} & {
			options: Partial<
				Record<
					`initial_${AuthenticationClctn["name"] extends string
						? AuthenticationClctn["name"]
						: "User"}`,
					Record<
						AuthenticationClctn["fields"] extends object
							? AuthenticationClctn["fields"][number]["name"]
							:
									| never
									| (
											| (AuthenticationClctn["identifierField"] extends string
													? AuthenticationClctn["identifierField"]
													: (typeof defaultAuthFields)["identifierField"])
											| (AuthenticationClctn["roleField"] extends string
													? AuthenticationClctn["roleField"]
													: (typeof defaultAuthFields)["roleField"])
											| (AuthenticationClctn["secretField"] extends string
													? AuthenticationClctn["secretField"]
													: (typeof defaultAuthFields)["secretField"])
									  ),
						string
					>
				>
			> & {
				/**
				 * Add table fields to include in the user session.
				 * default: everything except table's secret field
				 */
				data?:
					| "*"
					| (AuthenticationClctn["fields"] extends object
							? AuthenticationClctn["fields"][number]["name"]
							:
									| never
									| (
											| (AuthenticationClctn["identifierField"] extends string
													? AuthenticationClctn["identifierField"]
													: (typeof defaultAuthFields)["identifierField"])
											| (AuthenticationClctn["roleField"] extends string
													? AuthenticationClctn["roleField"]
													: (typeof defaultAuthFields)["roleField"])
											| (AuthenticationClctn["secretField"] extends string
													? AuthenticationClctn["secretField"]
													: (typeof defaultAuthFields)["secretField"])
									  ))[];
				kind: "session" | "jwt";
				/**
				 * default: 60 * 60 * 24 * 30 * 1000 (30 days)
				 */
				maxAge?: number;
				secret: string;
			};
		}
	) => {
		/**
		 * Database tables.
		 */
		tables: <
			const FieldNames extends string[],
			const T extends FieldSuggestiontables<
				FieldNames,
				AuthenticationClctn["name"] extends string ? AuthenticationClctn["name"] : undefined
			>
		>(
			args: InferringSelf<
				T,
				FieldSuggestiontables<
					FieldNames,
					AuthenticationClctn["name"] extends string
						? AuthenticationClctn["name"]
						: undefined
				>
			>
		) => {
			/**
			 * Additional configurations.
			 */
			options: (args: Options) => {
				/**
				 * Launch your Content Kitty application.
				 */
				init: () => void;
			};
		};
	};
};

type DupeAuthName = "This table's name is a duplicate of your authentication table's name.";

type InternalTables = { authentication: AuthenticationTable; sessions: Table; plugins: Table };

interface Table<
	FieldName extends string = string,
	AllFields extends string = string,
	AuthTableName extends string | undefined = undefined
> {
	id?: {
		name?: string;
		type: "autoincrement" | "uuid" | "cuid";
	};
	name: undefined extends AuthTableName
		? FieldName extends (typeof defaultAuthFields)["name"]
			? DupeAuthName
			: FieldName
		: FieldName extends AuthTableName
		? DupeAuthName
		: FieldName;

	label?: Labels;
	fields: NonEmptyArray<Field<Exclude<AllFields, FieldName>>>;
	slug?: string;
	hooks?: Hooks;
	webhooks?: Webhook[];
}

type Field<AllowedReferences extends string> = {
	name: string;
	label?: Labels;
	unique?: boolean;
	required?: boolean;
	index?: boolean;
	map?: string;
} & (Str | Json | Num | Bool | Date | Relation<AllowedReferences>);

type Str = {
	type: "string";
	defaultValue?: string;
};

type Json = {
	type: "json";
	defaultValue?: string;
};

type Num = {
	type: "number";
	defaultValue?: number;
};

type Bool = {
	type: "boolean";
	defaultValue?: boolean;
};

type Date = {
	type: "date";
	defaultValue?: { kind: "now" | "updatedAt" } | string;
};

type Relation<AllowedReferences extends string> = {
	type: "relation";
	ref: AllowedReferences;
	many: boolean;
};

type DefaultMiddlewares = {
	serveStatic?: { root: string; options: ServeStaticOptions } | false;
	morgan?:
		| {
				format: "combined" | "common" | "dev" | "short" | "tiny";
				options?: morgan.Options<Request, Response>;
		  }
		| false;
	cors?: CorsOptions | false;
	json?: bodyParser.OptionsJson | false;
	compression?: CompressionOptions | false;
	helmet?: HelmetOptions | false;
	urlencoded?: bodyParser.OptionsUrlencoded | false;
	rateLimit?: RateLimitOptions | false;
};

type StoreGetterSetter<T> = {
	get: () => T;
	set: (arg: T) => void;
};

type MutableDataStore = {
	tables: {
		store: {
			authentication: {
				table: unknown;
				options: unknown;
			};
			other: Table[];
		};
	} & StoreGetterSetter<{
		authentication: {
			table: AuthenticationTable;
			options: Parameters<CK["authentication"]>["0"]["options"];
		};
		other: Table[];
	}>;
	options: { store: Options } & StoreGetterSetter<Options>;
	db: { store: PrismaClient } & StoreGetterSetter<PrismaClient>;
	plugins: { store: ActiveInactivePlugins } & StoreGetterSetter<ActiveInactivePlugins>;
	healthCheck: { store: Record<"status", "healthy" | "warning" | "error"> } & StoreGetterSetter<
		Record<"status", "healthy" | "warning" | "error">
	>;
};

/**********************/

export {
	CK,
	Options,
	Context,
	Table,
	RequestMethods,
	DefaultMiddlewares,
	Webhook,
	WebhookFunc,
	EventTriggerPayload,
	ActiveInactivePlugins,
	Plugins,
	DatabasePlugin,
	ExistingData,
	InputData,
	MutableDataStore,
	HookOperationArgs,
	AuthenticationTable,
	CRUD,
	InternalTables,
	HookFunc,
};
