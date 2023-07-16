import { Observable } from "../shared/Observable";
import { HttpGateway } from "../shared/http.gateway";

export class MetaDataRepository {
	httpGateway: unknown;
	gateway!: InstanceType<typeof HttpGateway>;

	pluginsPM: Observable | null = null;
	collectionsPM: Observable | null = null;

	constructor() {
		this.gateway = new HttpGateway();
		this.pluginsPM = new Observable({
			active: [],
			inactive: [],
		});
		this.collectionsPM = new Observable([]);
	}

	getPlugins = async (callback: (arg?: any) => void) => {
		console.log(callback);
		this.pluginsPM?.subscribe(callback);
		await this.loadMetaData();
	};

	getCollections = async (callback: (arg?: any) => void) => {
		this.collectionsPM?.subscribe(callback);
		await this.loadMetaData();
	};

	loadMetaData = async () => {
		const metaDataDTO = await this.gateway.get("/system-panda-api/metadata");

		this.collectionsPM!.value = metaDataDTO.data.collections.map((collectionDto: unknown) => {
			return collectionDto;
		});

		console.log(this.collectionsPM?.value);

		const activePlugins = metaDataDTO.data.plugins.active.map(plugin => {
			return plugin;
		});

		const inactivePlugins = metaDataDTO.data.plugins.inactive.map(plugin => {
			return plugin;
		});

		this.pluginsPM!.value = {
			active: activePlugins,
			inactive: inactivePlugins,
		};

		console.log(this.pluginsPM?.value);
	};
}

const metaDataRepository = new MetaDataRepository();

export default metaDataRepository;
