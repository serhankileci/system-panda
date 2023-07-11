import { Options, MutableDataStore } from "./types.js";

/*
	storing the main function's args
	for later importing
*/
const configStore: Options = {} as Options;
const getConfigStore = () => configStore;
const setConfigStore = (obj: Partial<Options>) => {
	Object.assign(configStore, obj);
};

/*
	store for data that can't be assigned with default values
	and will need to be imported by multiple files/functions
*/
const dataStore: MutableDataStore & { authFields: { relationKey: string } } = {
	authFields: {
		collectionKey: "users",
		relationKey: "relation_users",
		secretField: "password",
		uniqueIdentifierField: "email",
	},
	pluginStore: { active: [], inactive: [] },
};
const getDataStore = () => dataStore;
const setDataStore = (obj: Partial<MutableDataStore>) => {
	Object.assign(dataStore, obj);
};

export { configStore, dataStore, getDataStore, setDataStore, getConfigStore, setConfigStore };
