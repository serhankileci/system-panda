import { inject, injectable } from "inversify";
import { action, makeAutoObservable, remove, set, toJS } from "mobx";
import { makeLoggable } from "mobx-log";

import config from "../../shared/config";
import { HttpGateway } from "../../shared/gateways/http.gateway";
import { Types } from "../../shared/types/ioc-types";

import type { MetaDataResponse } from "../../modules/metadata/metadata.types";
interface CollectionResponse {
	success: true;
	data: { id?: string; [key: string]: unknown }[];
}

type FieldInfo = {
	name: string;
	[key: string]: unknown;
};

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
		id?: string;
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
		const fieldsDto = await this.httpGateway.get<MetaDataResponse>(`/collections`);

		if (fieldsDto && fieldsDto.length) {
			const collectionEntry = fieldsDto.find(field => field.slug === collectionName);

			if (collectionEntry && collectionEntry.fields) {
				const fieldsPm = [];

				for (const field in collectionEntry.fields) {
					const fieldValue = collectionEntry.fields[field] as { type?: string };

					if (fieldValue.type === "relation") {
						continue;
					}

					fieldsPm.push({
						name: field,
						type: fieldValue.type,
					});
				}

				this.collectionFieldsPm = fieldsPm;
			}
		}
	};

	@action getData = async (collectionName: string) => {
		const collectionDataDto = await this.httpGateway.get<CollectionResponse>(
			`/collections/${collectionName}`
		);

		this.collectionDataPm = collectionDataDto.data;

		return toJS(this.collectionDataPm);
	};

	@action createItem = async (collectionName: string, data: unknown) => {
		const itemDto = await this.httpGateway.post<
			SuccessfulUpdateResponse | FailedUpdateResponse
		>(`/collections/${collectionName}`, { data });

		if ("success" in itemDto && itemDto.success) {
			if ("data" in itemDto && "after" in itemDto.data) {
				this.collectionDataPm.push(itemDto.data.after);
			}

			return {
				success: itemDto.success,
			};
		}

		return {
			success: false,
		};
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
		>(`/collections/${collectionName}`, {
			where: {
				id,
			},
			data,
		});

		if ("data" in updatedDto && "after" in updatedDto.data) {
			const itemIndex = this.collectionDataPm.findIndex(item => item.id === id);

			set(this.collectionDataPm[itemIndex], updatedDto.data.after);
		} else if ("message" in updatedDto) {
			console.error(updatedDto.message);
		}
	};

	@action deleteItem = async (collectionName: string, id: string) => {
		if (!id) {
			throw new Error("Id is required.");
		}

		if (!collectionName) {
			throw new Error("Collection name is required.");
		}

		const deletionDto = await this.httpGateway.delete<
			SuccessfulUpdateResponse | FailedUpdateResponse
		>(`/collections/${collectionName}`, {
			where: {
				id,
			},
		});

		if ("success" in deletionDto && "message" in deletionDto && !deletionDto.success) {
			return {
				success: deletionDto.success,
				message: deletionDto.message,
			};
		}

		if ("success" in deletionDto && deletionDto.success) {
			const targetIndex = this.collectionDataPm.findIndex(item => {
				return item.id === id;
			});

			remove(this.collectionDataPm, targetIndex.toString());

			return {
				success: deletionDto.success,
			};
		}

		return {
			success: false,
		};
	};

	@action reset = () => {
		this.collectionDataPm = [];
		this.collectionFieldsPm = [];
	};
}

export { CollectionRepository };
