export type DatabasePlugin = {
	active: boolean;
	title: string;
	author: string;
	version: string;
};

export interface Plugins {
	active: DatabasePlugin[];
	inactive: DatabasePlugin[];
}

export type Collections = string[];

export type Field = {
	[key: string]: {
		type?: string;
		required?: string;
		ref?: string;
		many?: boolean;
		subtype?: string;
		unique?: boolean;
		index?: boolean;
		defaultValue?:
		| {
			kind?: string;
		}
		| string;
	};
};

export type MetaDataResponse = Array<{
	slug: string;
	fields: Field;
}>;
