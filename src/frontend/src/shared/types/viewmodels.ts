import type { DatabasePlugin } from "../../metadata/metadata.types";

export interface MetaDataViewModel {
	plugins: {
		enabledPlugins: DatabasePlugin[];
		disabledPlugins: DatabasePlugin[];
	};
	collections: { name: string; endpoint: string }[];
	hasCollections: boolean;
}
