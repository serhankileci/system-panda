import { injectable } from "inversify";
import { AuthResponse } from "../auth/auth.types";
import { MetaDataResponse } from "../metadata/metadata.types";
import config, { ConfigType } from "./config";

@injectable()
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

	post = async (path: string, body: unknown, sendDto = true) => {
		const response = await fetch(this.config.apiUrl + path, {
			method: "POST",
			headers: this.headers,
			body: JSON.stringify(body),
			credentials: "same-origin",
		});

		if (sendDto) {
			return (await response.json()) as AuthResponse;
		}

		return response;
	};
}
