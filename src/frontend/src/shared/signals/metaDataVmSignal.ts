import { signal } from "@preact/signals";

import type { MetaDataViewModel } from "../../shared/types/viewmodels";

export const metaDataVmSignal = signal<MetaDataViewModel>({
	plugins: {
		enabledPlugins: [],
		disabledPlugins: [],
	},
	collections: [],
	hasCollections: false,
});
