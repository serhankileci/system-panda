import "reflect-metadata";

import { injectable } from "inversify";

@injectable()
export class FakeHttpGateway {
	get = (path: string) => {
		return {};
	};

	post = (path: string, body: unknown, sendDto = true) => {
		return {};
	};
}
