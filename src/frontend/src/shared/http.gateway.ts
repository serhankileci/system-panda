import { MetaDataResponse } from "../metadata/metadata.types";
import config, { ConfigType } from "./config";

export class HttpGateway {
	headers = {
		"Content-Type": "application/json",
	};

	config: ConfigType;

	constructor() {
		this.config = config;
	}

	get = async (path: string) => {
		const response = await fetch(this.config.apiUrl + path, {
			method: "GET",
			headers: this.headers,
		});

		const dto = (await response.json()) as MetaDataResponse;

		return dto;
	};
}

const httpGateway = new HttpGateway();

export default httpGateway;
