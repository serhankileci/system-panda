/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { defineFeature, loadFeature } from "jest-cucumber";

import { InversifyConfig } from "../../../../ioc/InversifyConfig";
import {
	AlbumFieldsStubResponse,
	AlbumStubResponse,
	getCollectionAlbumFieldsStub,
	getCollectionAlbumStub,
	getSuccessfulItemUpdateStub,
} from "../../../../test-tools/stubs/collection.stub";
import { CollectionPresenter } from "../../collection.presenter";
import { CollectionRepository } from "../../collection.repository";

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

type GetResponseType = AlbumStubResponse | AlbumFieldsStubResponse | ErrorResponse;

type GetStubMapType = { [key: string]: () => Promise<GetResponseType> };

defineFeature(feature, test => {
	test("After collection table is populated", ({ given, when, then }) => {
		beforeEach(() => {
			collectionRepository = container.get(CollectionRepository);

			collectionPresenter = container.get(CollectionPresenter);

			collectionRepository.httpGateway.get = jest.fn().mockImplementation((path: string) => {
				const getStubMap: GetStubMapType = {
					"/collections/album": () => Promise.resolve(getCollectionAlbumStub()),
					"/fields/collection/album": () =>
						Promise.resolve(getCollectionAlbumFieldsStub()),
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
					if (path.indexOf(`/collections/album?where={"id"`) !== -1) {
						return Promise.resolve(getSuccessfulItemUpdateStub(body.where.id, body));
					}

					return Promise.resolve({
						success: false,
					});
				});
		});

		given("I see my target collection item", async () => {
			await collectionPresenter!.load("album");
			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith(
				"/fields/collection/album"
			);
			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith(
				"/collections/album"
			);

			expect(collectionPresenter!.viewModel.hasData).toBe(true);
			expect(collectionPresenter!.viewModel.hasFields).toBe(true);
		});

		when(
			"I click on an item row's edit button, change at least one value, and submit the change",
			async () => {
				expect(collectionPresenter!.viewModel.dataList[1].title).toBe("Album 2");
				expect(collectionPresenter!.viewModel.dataList[1].year).toBe(2010);

				await collectionPresenter!.updateItem("album", "2", {
					title: "The Dark Side of the Moon",
					year: 1973,
				});

				expect(collectionRepository!.httpGateway.put).toHaveBeenCalledWith(
					`/collections/album?where={"id": 2}`,
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

		then("I should that the collection item's value(s) has my changes", () => {
			expect(collectionPresenter!.viewModel.dataList[1].title).toBe(
				"The Dark Side of the Moon"
			);
			expect(collectionPresenter!.viewModel.dataList[1].year).toBe(1973);
		});
	});
});
