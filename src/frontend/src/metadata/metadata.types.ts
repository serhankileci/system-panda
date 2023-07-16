type DatabasePlugin = {
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

export interface MetaDataResponse {
	data: {
		plugins: Plugins;
		collections: Collections;
	};
}
