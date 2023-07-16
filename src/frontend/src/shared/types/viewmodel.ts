export interface ViewModel {
	plugins: {
		enabledPlugins: unknown[];
		disabledPlugins: unknown[];
	};
	collections: string[];
}
