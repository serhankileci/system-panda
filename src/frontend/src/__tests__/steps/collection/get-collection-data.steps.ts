import { defineFeature, loadFeature } from "jest-cucumber";

import { InversifyConfig } from "../../../ioc/InversifyConfig";
import { CollectionPresenter } from "../../../modules/collection/collection.presenter";
import { CollectionRepository } from "../../../modules/collection/collection.repository";
import { getCollectionAlbumStub } from "../../stubs/collection.stub";
import { getMetaDataStub } from "../../stubs/metadata.stub";

const feature = loadFeature("src/__tests__/features/collection/get-collection-data.feature");

const inversifyConfig = new InversifyConfig("test");
inversifyConfig.setupBindings();

const container = inversifyConfig.container;

let collectionRepository: InstanceType<typeof CollectionRepository> | null = null;
let collectionPresenter: InstanceType<typeof CollectionPresenter> | null = null;

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
				if (path === "/collections") {
					return Promise.resolve(getMetaDataStub());
				}

				if (path === "/collections/record") {
					return Promise.resolve(getCollectionAlbumStub());
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
			await collectionPresenter!.load("record");

			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith("/collections");
			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith(
				"/collections/record"
			);
		});

		then(
			"I should see the collection table populated with its relevant fields and data",
			() => {
				expect(collectionPresenter?.viewModel.fields.length).toEqual(4);
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
