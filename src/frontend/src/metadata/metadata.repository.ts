import { Observable } from "../shared/Observable";
import { HttpGateway } from "../shared/http.gateway";

export class MetaDataRepository {
	httpGateway: unknown;
	gateway!: InstanceType<typeof HttpGateway>;

	pluginsPM: Observable | null = null;
	collectionsPM: Observable | null = null;

	constructor() {
		this.gateway = new HttpGateway();
		this.pluginsPM = new Observable({});
		this.collectionsPM = new Observable([]);
	}

	loadMetaData = async () => {
		const metaDataDTO = await this.gateway.get("/metadata");

		this.collectionsPM!.value = metaDataDTO.data.collections.map((collectionDto: unknown) => {
			return collectionDto;
		});

		const activePlugins = metaDataDTO.data.plugins.active.map(plugin => {
			return plugin;
		});

		const inactivePlugins = metaDataDTO.data.plugins.active.map(plugin => {
			return plugin;
		});

		this.pluginsPM!.value = {
			activePlugins,
			inactivePlugins,
		};
	};
}

const metaDataRepository = new MetaDataRepository();

export default metaDataRepository;
