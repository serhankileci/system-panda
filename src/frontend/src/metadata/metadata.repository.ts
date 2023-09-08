import { action, makeAutoObservable } from "mobx";

import { HttpGateway } from "../shared/gateways/http.gateway";

import type { DatabasePlugin, MetaDataResponse } from "./metadata.types";
import { makeLoggable } from "mobx-log";
import config from "../shared/config";
import { injectable, inject } from "inversify";
import { Types } from "../shared/types/ioc-types";

export interface PluginsProgrammersModel {
	activePlugins: DatabasePlugin[];
	inactivePlugins: DatabasePlugin[];
}

export type CollectionsProgrammersModel = Array<{
	name: string;
	fieldNames: string[];
	fields: {
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
}>;

@injectable()
export class MetaDataRepository {
	config = config;
	@inject(Types.IHttpGateway) gateway!: InstanceType<typeof HttpGateway>;

	pluginsPM: PluginsProgrammersModel = {
		activePlugins: [],
		inactivePlugins: [],
	};

	collectionsPM: CollectionsProgrammersModel = [];

	constructor() {
		this.gateway = new HttpGateway();
		makeAutoObservable(this);

		!config.isEnvironmentProd &&
			makeLoggable(this, {
				filters: {
					events: {
						computeds: true,
						observables: true,
						actions: true,
					},
				},
			});
	}

	@action setPluginsProgrammersModel(value: PluginsProgrammersModel) {
		this.pluginsPM = value;
	}

	@action setCollectionsProgrammersModel(value: CollectionsProgrammersModel) {
		this.collectionsPM = value;
	}

	loadMetaData = async () => {
		const metaDataDTO = await this.gateway.get<MetaDataResponse>("/collections");

		console.log("metaDataDto: ", metaDataDTO.data);

		const collectionsPM = metaDataDTO.data.map(collectionDto => {
			console.log("dto: ", collectionDto);
			return {
				name: collectionDto.slug,
				fieldNames: Object.keys(collectionDto.fields),
				fields: collectionDto.fields,
			};
		});

		// console.log("pm: ", collectionsPM);

		this.setCollectionsProgrammersModel(collectionsPM);

		// const activePlugins = metaDataDTO.data.plugins.active.map(pluginDto => {
		// 	return pluginDto;
		// });

		// const inactivePlugins = metaDataDTO.data.plugins.inactive.map(pluginDto => {
		// 	return pluginDto;
		// });

		// this.setPluginsProgrammersModel({
		// 	activePlugins,
		// 	inactivePlugins,
		// });
	};
}
