import { inject, injectable } from "inversify";
import { toJS } from "mobx";

import { CollectionRepository } from "./collection.repository";

@injectable()
class CollectionPresenter {
	@inject(CollectionRepository) collectionRepository!: InstanceType<typeof CollectionRepository>;

	load = async (collectionName: string) => {
		await this.collectionRepository.getFields(collectionName);

		await this.collectionRepository.getData(collectionName);
	};

	reset = () => {
		this.collectionRepository.reset();
	};

	updateItem = async (
		collectionName: string,
		collectionItemId: string,
		newData: { [key: string]: unknown }
	) => {
		await this.collectionRepository.updateItem(collectionName, collectionItemId, newData);
	};

	removeItem = async (collectionName: string, collectinItemId: string) => {
		await this.collectionRepository.deleteItem(collectionName, collectinItemId);
	};

	addItem = async (collectionName: string, data: { [key: string]: unknown }) => {
		return this.collectionRepository.createItem(collectionName, data);
	};

	get viewModel() {
		const fieldsVm = toJS(this.collectionRepository.collectionFieldsPm);
		const collectionDataListVm = toJS(this.collectionRepository.collectionDataPm);
		return {
			fields: fieldsVm,
			dataList: collectionDataListVm,
			hasFields: !!fieldsVm && !!fieldsVm.length,
			fieldsCount: (fieldsVm && fieldsVm.length) || 0,
			hasData: !!collectionDataListVm && !!collectionDataListVm.length,
		};
	}
}

export { CollectionPresenter };
