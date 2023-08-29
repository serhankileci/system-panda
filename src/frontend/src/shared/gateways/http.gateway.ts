import { injectable } from "inversify";

import { AuthResponse } from "../../auth/auth.types";
import { MetaDataResponse } from "../../metadata/metadata.types";
import config, { ConfigType } from "../config";

import "reflect-metadata";
import type {
	FailedUpdateResponse,
	SuccessfulUpdateResponse,
} from "../../modules/collection/collection.repository";

@injectable()
export class HttpGateway {
	headers = {
		"Content-Type": "application/json",
	};

	config: ConfigType;

	constructor() {
		this.config = config;
	}

	get = async <T = unknown>(path: string) => {
		const response = await fetch(this.config.apiUrl + path, {
			method: "GET",
			headers: this.headers,
		});

		const dto = (await response.json()) as T;

		return dto;
	};

	post = async <T = unknown | Response>(
		path: string,
		body: unknown,
		sendDto = true
	): Promise<T | Response> => {
		const response = await fetch(this.config.apiUrl + path, {
			method: "POST",
			headers: this.headers,
			body: JSON.stringify(body),
			credentials: "same-origin",
		});

		if (sendDto) {
			return (await response.json()) as T;
		}

		return response;
	};

	put = async <T = unknown | Response>(
		path: string,
		body: unknown,
		sendDto = true
	): Promise<T | Response> => {
		const response = await fetch(this.config.apiUrl + path, {
			method: "PUT",
			headers: this.headers,
			body: JSON.stringify(body),
			credentials: "same-origin",
		});

		if (sendDto) {
			return (await response.json()) as T;
		}

		return response;
	};

	delete = async <T = unknown | Response>(
		path: string,
		body: unknown,
		sendDto = true
	): Promise<T | Response> => {
		const response = await fetch(this.config.apiUrl + path, {
			method: "DELETE",
			headers: this.headers,
			body: JSON.stringify(body),
			credentials: "same-origin",
		});

		if (sendDto) {
			return (await response.json()) as T;
		}

		return response;
	};
}
