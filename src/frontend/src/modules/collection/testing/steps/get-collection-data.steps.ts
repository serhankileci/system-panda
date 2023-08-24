import { defineFeature, loadFeature } from "jest-cucumber";

import { InversifyConfig } from "../../../../ioc/InversifyConfig";
import {
	AlbumFieldsStubResponse,
	AlbumStubResponse,
	getCollectionAlbumFieldsStub,
	getCollectionAlbumStub,
} from "../../../../test-tools/stubs/collection.stub";
import { CollectionPresenter } from "../../collection.presenter";
import { CollectionRepository } from "../../collection.repository";

const feature = loadFeature("src/modules/collection/testing/features/get-collection-data.feature");

const inversifyConfig = new InversifyConfig("test");
inversifyConfig.setupBindings();

const container = inversifyConfig.container;

let collectionRepository: InstanceType<typeof CollectionRepository> | null = null;
let collectionPresenter: InstanceType<typeof CollectionPresenter> | null = null;

type ErrorResponse = {
	success: false;
};

type GetResponseType = AlbumStubResponse | AlbumFieldsStubResponse | ErrorResponse;

type GetStubMapType = { [key: string]: () => Promise<GetResponseType> };

defineFeature(feature, test => {
	test("After clicking on the collection link from dashboard's sidebar, populate table with that collection's data", ({
		given,
		when,
		then,
	}) => {
		beforeEach(() => {
			collectionRepository = container.get(CollectionRepository);

			collectionPresenter = container.get(CollectionPresenter);

			collectionRepository.httpGateway.get = jest.fn().mockImplementation((path: string) => {
				let getRequest = null;

				const getStubMap: GetStubMapType = {
					"/collections/album": () => Promise.resolve(getCollectionAlbumStub()),
					"/fields/collection/album": () =>
						Promise.resolve(getCollectionAlbumFieldsStub()),
				};

				for (const requestUrl in getStubMap) {
					if (path.indexOf(requestUrl) !== -1) {
						getRequest = getStubMap[requestUrl];
						return getRequest();
					}
				}

				return Promise.resolve({
					success: false,
				});
			});
		});

		given("I am on the Overview screen", () => {
			expect(collectionPresenter!.viewModel.hasData).toBe(false);
		});

		when("I click on the collection", async () => {
			await collectionPresenter!.load("album");

			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith(
				"/fields/collection/album"
			);
			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith(
				"/collections/album"
			);
		});

		then(
			"I should see the collection table populated with its relevant fields and data",
			() => {
				expect(collectionPresenter?.viewModel.fields.length).toEqual(2);
				expect(collectionPresenter?.viewModel.fields[0]).toStrictEqual({
					name: "year",
					type: "number",
				});
				expect(collectionPresenter?.viewModel.fields[1]).toStrictEqual({
					name: "title",
					type: "String",
				});

				expect(collectionPresenter!.viewModel.dataList.length).toEqual(3);
				expect(collectionPresenter!.viewModel.dataList[0].title).toBe("Album 1");
				expect(collectionPresenter!.viewModel.dataList[0].year).toBe(1994);
				expect(collectionPresenter!.viewModel.dataList[1].title).toBe("Album 2");
				expect(collectionPresenter!.viewModel.dataList[1].year).toBe(2010);
				expect(collectionPresenter!.viewModel.dataList[2].title).toBe("Album 3");
				expect(collectionPresenter!.viewModel.dataList[2].year).toBe(2023);
			}
		);
	});
});
