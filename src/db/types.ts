import {Access, CRUDHooks, Webhook} from "../util";
import {PrismaClientOptions} from "@prisma/client/runtime";
export type Database = {
	URI: string;
} & Omit<PrismaClientOptions, "datasources" | "__internal">;

export type CollectionID = {
	id?: {
		name: string;
		type: "autoincrement" | "uuid";
	};
};

export type Collection = {
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
export type TextFieldConfig = {
	validation?: unknown;
};
export type ImageFieldConfig = unknown;
export type UniqFieldProps = TextFieldConfig | ImageFieldConfig;
// type Text = (args: TextFieldConfig) => TextFieldConfig;
// type Image = (args: ImageFieldConfig) => ImageFieldConfig;

export type CommonFieldProps = {
	required?: boolean;
	index?: unknown;

	hooks?: CRUDHooks;
	defaultValue?: string;

	// ui?: {
	// 	filterable?: unknown;
	// 	orderable?: unknown;
	// } & UI;
};

export type Field = {
	type: "text" | "number" | "datetime" | "boolean";
	unique?: boolean;
} & CommonFieldProps &
	UniqFieldProps;


export type Collections = Record<string, Collection>;
