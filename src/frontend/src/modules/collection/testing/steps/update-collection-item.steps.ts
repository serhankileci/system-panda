/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { defineFeature, loadFeature } from "jest-cucumber";

import { InversifyConfig } from "../../../../ioc/InversifyConfig";
import {
	AlbumStubResponse,
	getCollectionAlbumStub,
	getSuccessfulItemUpdateStub,
} from "../../../../test-tools/stubs/collection.stub";
import { CollectionPresenter } from "../../collection.presenter";
import { CollectionRepository } from "../../collection.repository";
import { getMetaDataStub } from "../../../../test-tools/stubs/metadata.stub";

const feature = loadFeature(
	"src/modules/collection/testing/features/update-collection-item.feature"
);

const inversifyConfig = new InversifyConfig("test");
inversifyConfig.setupBindings();

const container = inversifyConfig.container;

let collectionRepository: InstanceType<typeof CollectionRepository> | null = null;
let collectionPresenter: InstanceType<typeof CollectionPresenter> | null = null;

type ErrorResponse = {
	success: false;
};

type GetResponseType = AlbumStubResponse | ErrorResponse | ReturnType<typeof getMetaDataStub>;

type GetStubMapType = { [key: string]: () => Promise<GetResponseType> };

defineFeature(feature, test => {
	test("After collection table is populated", ({ given, when, then }) => {
		beforeEach(() => {
			collectionRepository = container.get(CollectionRepository);

			collectionPresenter = container.get(CollectionPresenter);

			collectionRepository.httpGateway.get = jest.fn().mockImplementation((path: string) => {
				const getStubMap: GetStubMapType = {
					"/collections/record": () => Promise.resolve(getCollectionAlbumStub()),
					"/collections": () => Promise.resolve(getMetaDataStub()),
				};

				for (const requestUrl in getStubMap) {
					if (path.indexOf(requestUrl) !== -1) {
						return getStubMap[requestUrl]();
					}
				}

				return Promise.resolve({
					success: false,
				});
			});

			collectionRepository.httpGateway.put = jest
				.fn()
				.mockImplementation((path: string, body: any) => {
					if (path.indexOf(`/collections/record`) !== -1) {
						return Promise.resolve(getSuccessfulItemUpdateStub(body.where.id, body));
					}

					return Promise.resolve({
						success: false,
					});
				});
		});

		given("I see my target collection item", async () => {
			await collectionPresenter!.load("record");
			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith("/collections");
			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith(
				"/collections/record"
			);

			expect(collectionPresenter!.viewModel.hasData).toBe(true);
			expect(collectionPresenter!.viewModel.hasFields).toBe(true);
		});

		when(
			"I click on an item's value in the table cell, change at the value, and submit the change",
			async () => {
				expect(collectionPresenter!.viewModel.dataList[1].title).toBe("Album 2");
				expect(collectionPresenter!.viewModel.dataList[1].year).toBe(2010);

				await collectionPresenter!.updateItem("record", "2", {
					title: "The Dark Side of the Moon",
					year: 1973,
				});

				expect(collectionRepository!.httpGateway.put).toHaveBeenCalledWith(
					`/collections/record`,
					{
						where: {
							id: "2",
						},
						data: {
							title: "The Dark Side of the Moon",
							year: 1973,
						},
					}
				);
			}
		);

		then("I should that the collection item's value has my change", () => {
			expect(collectionPresenter!.viewModel.dataList[1].title).toBe(
				"The Dark Side of the Moon"
			);
			expect(collectionPresenter!.viewModel.dataList[1].year).toBe(1973);
		});
	});
});
