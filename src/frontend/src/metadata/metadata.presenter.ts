import { inject, injectable } from "inversify";
import { MetaDataRepository } from "./metadata.repository";

interface CallbackFunction {
	(arg?: any): void;
}

@injectable()
export class MetaDataPresenter {
	@inject(MetaDataRepository) metaDataRepository!: InstanceType<typeof MetaDataRepository>;

	get viewModel() {
		const pluginsViewModel = {
			enabledPlugins: this.plugins.activePlugins || [],
			disabledPlugins: this.plugins.inactivePlugins || [],
		};

		return {
			plugins: pluginsViewModel,
			collections: this.metaDataRepository.collectionsPM.map(collection => {
				return {
					name: collection.replace("/", ""),
					endpoint: collection,
				};
			}),
			hasCollections: this.metaDataRepository.collectionsPM.length ? true : false,
		};
	}

	load = async () => {
		await this.metaDataRepository.loadMetaData();
	};

	get plugins() {
		return this.metaDataRepository.pluginsPM;
	}

	get collections() {
		return this.metaDataRepository.collectionsPM;
	}
}
