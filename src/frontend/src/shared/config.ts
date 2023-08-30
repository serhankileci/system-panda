export class Config {
	isEnvironmentProd = false;
	apiUrl = "/";
	baseUrl = "/";

	constructor() {
		this.isEnvironmentProd = import.meta.env?.PROD;
		this.apiUrl = "/system-panda-api";
		this.baseUrl = import.meta.env?.BASE_URL;
	}
}

export type ConfigType = InstanceType<typeof Config>;

const config = new Config();

export default config;
