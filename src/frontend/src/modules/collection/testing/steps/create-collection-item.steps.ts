/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { defineFeature, loadFeature } from "jest-cucumber";

import { InversifyConfig } from "../../../../ioc/InversifyConfig";
import {
	AlbumFieldsStubResponse,
	AlbumStubResponse,
	createCollectionAlbumStub,
	getCollectionAlbumFieldsStub,
	getCollectionAlbumStub,
	getSuccessfulItemUpdateStub,
} from "../../../../test-tools/stubs/collection.stub";
import { CollectionPresenter } from "../../collection.presenter";
import { CollectionRepository } from "../../collection.repository";

const feature = loadFeature(
	"src/modules/collection/testing/features/create-collection-item.feature"
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
	test("On collection table screen,", ({ given, when, then }) => {
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

			collectionRepository.httpGateway.post = jest
				.fn()
				.mockImplementation((path: string, body: any) => {
					if (path === `/collections/album`) {
						return Promise.resolve(createCollectionAlbumStub(body));
					}

					return Promise.resolve({
						success: false,
					});
				});
		});

		given("when the collection table screen is loaded", async () => {
			await collectionPresenter!.load("album");
			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith(
				"/fields/collection/album"
			);
			expect(collectionRepository!.httpGateway.get).toHaveBeenCalledWith(
				"/collections/album"
			);

			expect(collectionPresenter!.viewModel.hasData).toBe(true);
			expect(collectionPresenter!.viewModel.hasFields).toBe(true);
			expect(collectionPresenter!.viewModel.dataList.length).toEqual(3);
		});

		when(
			"I click on add/create button, enter values of the collection, and submit the creation",
			async () => {
				expect(collectionPresenter!.viewModel.dataList[3]).toBe(undefined);

				await collectionPresenter!.addItem("album", {
					title: "The Dark Side of the Moon",
					year: 1973,
				});

				expect(collectionRepository!.httpGateway.post).toHaveBeenCalledWith(
					`/collections/album`,
					{
						id: "4",
						title: "The Dark Side of the Moon",
						year: 1973,
					}
				);
			}
		);

		then("I should see that collection item added into the table", () => {
			expect(collectionPresenter!.viewModel.dataList[3].title).toBe(
				"The Dark Side of the Moon"
			);
			expect(collectionPresenter!.viewModel.dataList[3].year).toBe(1973);
		});
	});
});
