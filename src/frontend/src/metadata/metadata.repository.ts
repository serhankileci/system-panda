import { HttpGateway } from "../shared/http.gateway";
import { makeAutoObservable, observable } from "mobx";
import { DatabasePlugin } from "./metadata.types";
import { makeLoggable } from "mobx-log";
import config from "../shared/config";

interface PluginsProgrammersModel {
	activePlugins: DatabasePlugin[];
	inactivePlugins: DatabasePlugin[];
}

type CollectionsProgrammersModel = string[];

export class MetaDataRepository {
	config = config;
	gateway!: InstanceType<typeof HttpGateway>;

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

	loadMetaData = async () => {
		const metaDataDTO = await this.gateway.get("/metadata");

		this.collectionsPM = metaDataDTO.data.collections.map(collectionDto => {
			return collectionDto;
		});

		const activePlugins = metaDataDTO.data.plugins.active.map(pluginDto => {
			return pluginDto;
		});

		const inactivePlugins = metaDataDTO.data.plugins.inactive.map(pluginDto => {
			return pluginDto;
		});

		this.pluginsPM = {
			activePlugins,
			inactivePlugins,
		};
	};
}

const metaDataRepository = new MetaDataRepository();

export default metaDataRepository;
