import { HttpGateway } from "../shared/http.gateway";
import { observable } from "mobx";
import { DatabasePlugin } from "./metadata.types";

interface PluginsProgrammersModel {
	activePlugins: DatabasePlugin[];
	inactivePlugins: DatabasePlugin[];
}

type CollectionsProgrammersModel = string[];

export class MetaDataRepository {
	httpGateway: unknown;
	gateway!: InstanceType<typeof HttpGateway>;

	@observable pluginsPM: PluginsProgrammersModel = {
		activePlugins: [],
		inactivePlugins: [],
	};

	@observable collectionsPM: CollectionsProgrammersModel = [];

	constructor() {
		this.gateway = new HttpGateway();
	}

	loadMetaData = async () => {
		console.log("hit");
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
