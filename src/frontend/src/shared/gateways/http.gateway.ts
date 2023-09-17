import { injectable } from "inversify";

import config, { ConfigType } from "../config";

import "reflect-metadata";

@injectable()
export class HttpGateway {
	headers = {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
	};

	config: ConfigType;

	constructor() {
		this.config = config;
	}

	get = async <T = unknown>(path: string) => {
		const response = await fetch(config.apiUrl + path, {
			method: "GET",
			headers: this.headers,
		});

		console.log("response: ", response);

		const dto = (await response.json()) as T;

		return dto;
	};

	post = async <T = unknown | Response>(
		path: string,
		body: unknown,
		sendDto = true
	): Promise<T | Response> => {
		const response = await fetch(config.apiUrl + path, {
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
		const response = await fetch(config.apiUrl + path, {
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
		const response = await fetch(config.apiUrl + path, {
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
