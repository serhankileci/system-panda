import { MetaDataResponse } from "../metadata/metadata.types";

export class HttpGateway {
	headers = {
		"Content-Type": "application/json",
	};

	get = async (path: string) => {
		const response = await fetch(path, {
			method: "GET",
			headers: this.headers,
		});

		const dto = (await response.json()) as MetaDataResponse;

		return dto;
	};
}

const httpGateway = new HttpGateway();
export default httpGateway;
