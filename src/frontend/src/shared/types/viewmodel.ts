export interface ViewModel {
	plugins: {
		enabledPlugins: unknown[];
		disabledPlugins: unknown[];
	};
	collections: {
		name: string;
		endpoint: string;
	}[];
	hasCollections: boolean;
}
