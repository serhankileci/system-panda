import { HttpGateway } from "../shared/http.gateway";
import { action, makeAutoObservable } from "mobx";
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

	@action setPluginsProgrammersModel(value: PluginsProgrammersModel) {
		this.pluginsPM = value;
	}

	@action setCollectionsProgrammersModel(value: CollectionsProgrammersModel) {
		this.collectionsPM = value;
	}

	loadMetaData = async () => {
		const metaDataDTO = await this.gateway.get("/metadata");

		const collectionsPM = metaDataDTO.data.collections.map(collectionDto => {
			return collectionDto;
		});

		this.setCollectionsProgrammersModel(collectionsPM);

		const activePlugins = metaDataDTO.data.plugins.active.map(pluginDto => {
			return pluginDto;
		});

		const inactivePlugins = metaDataDTO.data.plugins.inactive.map(pluginDto => {
			return pluginDto;
		});

		this.setPluginsProgrammersModel({
			activePlugins,
			inactivePlugins,
		});
	};
}

const metaDataRepository = new MetaDataRepository();

export default metaDataRepository;
