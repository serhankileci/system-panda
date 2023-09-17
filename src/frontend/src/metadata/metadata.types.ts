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

// export type MetaDataResponse = Array<>;
