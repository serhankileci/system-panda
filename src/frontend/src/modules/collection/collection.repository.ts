import { inject, injectable } from "inversify";
import { action, makeAutoObservable, set, toJS } from "mobx";
import { makeLoggable } from "mobx-log";

import config from "../../shared/config";
import { HttpGateway } from "../../shared/gateways/http.gateway";
import { Types } from "../../shared/types/ioc-types";

interface CollectionResponse {
	success: true;
	data: { id: string; [key: string]: unknown }[];
}

type FieldInfo = {
	name: string;
	type: string;
};

interface FieldsResponse {
	success: boolean;
	data: { fields: FieldInfo[] };
	error?: unknown;
}

export interface SuccessfulUpdateResponse {
	success: boolean;
	data: {
		before: {
			[key: string]: unknown;
		}[];
		after: {
			[key: string]: unknown;
		};
	};
}

export interface FailedUpdateResponse {
	success: boolean;
	message: string;
}

@injectable()
class CollectionRepository {
	config = config;
	@inject(Types.IHttpGateway) httpGateway!: InstanceType<typeof HttpGateway>;

	collectionDataPm: {
		id: string;
		[key: string]: unknown;
	}[] = [];

	collectionFieldsPm: FieldInfo[] = [];

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

	@action getFields = async (collectionName: string) => {
		const fieldsDto = await this.httpGateway.get<FieldsResponse>(
			`/fields/collection/${collectionName}`
		);

		this.collectionFieldsPm = fieldsDto.data.fields;
	};

	@action getData = async (collectionName: string) => {
		const collectionDataDto = await this.httpGateway.get<CollectionResponse>(
			`/collections/${collectionName}`
		);

		this.collectionDataPm = collectionDataDto.data;

		return toJS(this.collectionDataPm);
	};

	@action updateItem = async (
		collectionName: string,
		id: string,
		data: { [key: string]: unknown }
	) => {
		if (!id) {
			throw new Error("Id is required.");
		}

		if (!collectionName) {
			throw new Error("Collection name is required.");
		}

		const updatedDto = await this.httpGateway.put<
			SuccessfulUpdateResponse | FailedUpdateResponse
		>(`/collections/${collectionName}?where={"id": ${id}}`, {
			where: {
				id,
			},
			data,
		});

		console.log("updatedDto: ", updatedDto);

		if ("data" in updatedDto && "after" in updatedDto.data) {
			const itemIndex = this.collectionDataPm.findIndex(item => item.id === id);

			set(this.collectionDataPm[itemIndex], updatedDto.data.after);

			console.log(toJS(this.collectionDataPm));
		} else if ("message" in updatedDto) {
			console.error(updatedDto.message);
		}
	};

	@action reset = () => {
		this.collectionDataPm = [];
		this.collectionFieldsPm = [];
	};
}

export { CollectionRepository };
