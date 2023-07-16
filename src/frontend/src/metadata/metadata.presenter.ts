/* eslint-disable @typescript-eslint/await-thenable */
import metaDataRepository from "./metadata.repository";
import { Collections, Plugins } from "./metadata.types";

interface PluginsCallbackFn {
	(arg?: any): void;
}

interface CollectionsCallbackFn {
	(arg?: any): void;
}

export class MetaDataPresenter {
	loadPlugins = async (callbackFn: PluginsCallbackFn) => {
		console.log(callbackFn);
		await metaDataRepository.getPlugins((pluginsProgrammersModel: Plugins) => {
			console.log("HIT3: ", pluginsProgrammersModel);
			const pluginsViewModel = {
				activePlugins: pluginsProgrammersModel.active.map(pluginPm => pluginPm),
				inactivePlugins: pluginsProgrammersModel.inactive.map(pluginPm => pluginPm),
			};

			callbackFn(pluginsViewModel);
		});
	};

	loadCollections = async (callbackFn: CollectionsCallbackFn) => {
		await metaDataRepository.getCollections((collectionsPM: Collections) => {
			console.log("BAM: ", collectionsPM);
			const collectionsViewModel = collectionsPM.map(collectionPM => collectionPM);

			callbackFn(collectionsViewModel);
		});
	};
}
