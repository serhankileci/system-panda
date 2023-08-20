import { inject, injectable } from "inversify";
import { action, makeAutoObservable, makeObservable, observable, toJS } from "mobx";
import { makeLoggable } from "mobx-log";

import config from "../../shared/config";
import { HttpGateway } from "../../shared/gateways/http.gateway";
import { Types } from "../../shared/types/ioc-types";

interface CollectionResponse {
	success: true;
	data: { id: string; name: null | string }[];
}

@injectable()
class CollectionRepository {
	config = config;
	@inject(Types.IHttpGateway) httpGateway!: InstanceType<typeof HttpGateway>;

	collectionDataPm: {
		id: string;
		name: null | string;
	}[] = [];

	constructor() {
		this.httpGateway = new HttpGateway();

		makeAutoObservable(this);

		!config.isEnvironmentProd &&
			makeLoggable(this, {
				filters: {
					events: {
						computeds: true,
						observables: true,
						actions: true,
					},
				},
			});
	}

	@action getCollectionData = async (collectionName: string) => {
		const collectionDataDto = await this.httpGateway.get<CollectionResponse>(
			`/collections/${collectionName}`
		);

		this.collectionDataPm = collectionDataDto.data;

		return toJS(this.collectionDataPm);
	};
}

export { CollectionRepository };
