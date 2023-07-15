export interface CustomPlugin {
	active: unknown[];
	inactive: unknown[];
}

export type Collection = string[];

export interface MetaDataResponse {
	data: {
		plugins: CustomPlugin;
		collections: Collection;
	};
}
