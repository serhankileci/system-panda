import metaDataRepository from "./metadata.repository";

interface CallbackFunction {
	(arg?: any): void;
}

export class MetaDataPresenter {
	get viewModel() {
		const pluginsViewModel = {
			enabledPlugins: this.plugins.activePlugins,
			disabledPlugins: this.plugins.inactivePlugins,
		};

		return {
			plugins: pluginsViewModel,
			collections: metaDataRepository.collectionsPM,
		};
	}

	load = async () => {
		await metaDataRepository.loadMetaData();
	};

	loadPlugins = async (callbackFn: CallbackFunction) => {
		await metaDataRepository.loadMetaData();

		const pluginsViewModel = {
			enabledPlugins: this.plugins.activePlugins,
			disabledPlugins: this.plugins.inactivePlugins,
		};

		callbackFn(pluginsViewModel);
	};

	loadCollections = async (callbackFn: CallbackFunction) => {
		await metaDataRepository.loadMetaData();

		const collectionsVM = this.collections;

		callbackFn(collectionsVM);
	};

	get plugins() {
		return metaDataRepository.pluginsPM;
	}

	get collections() {
		return metaDataRepository.collectionsPM;
	}
}
