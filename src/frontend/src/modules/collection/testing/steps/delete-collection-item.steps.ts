/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { defineFeature, loadFeature } from "jest-cucumber";

import { InversifyConfig } from "../../../../ioc/InversifyConfig";
import {
	AlbumFieldsStubResponse,
	AlbumStubResponse,
	getCollectionAlbumFieldsStub,
	getCollectionAlbumStub,
	getSuccessfulItemDeletionStub,
	getSuccessfulItemUpdateStub,
} from "../../../../test-tools/stubs/collection.stub";
import { CollectionPresenter } from "../../collection.presenter";
import { CollectionRepository } from "../../collection.repository";

const feature = loadFeature(
	"src/modules/collection/testing/features/delete-collection-item.feature"
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

			collectionRepository.httpGateway.delete = jest
				.fn()
				.mockImplementation((path: string, body: any) => {
					if (path.indexOf(`/collections/album`) !== -1) {
						return Promise.resolve(getSuccessfulItemDeletionStub(body.where.id));
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

			expect(collectionPresenter!.viewModel.dataList[1].title).toBe("Album 2");
			expect(collectionPresenter!.viewModel.dataList[1].year).toBe(2010);
		});

		when("I click on delete button on same row as the target collection item", async () => {
			await collectionPresenter!.removeItem("album", "2");

			expect(collectionRepository!.httpGateway.delete).toHaveBeenCalledWith(
				`/collections/album`,
				{
					where: {
						id: "2",
					},
				}
			);
		});

		then("I should see that collection item removed from the table", () => {
			expect(collectionPresenter!.viewModel.dataList.length).toEqual(2);
			expect(collectionPresenter!.viewModel.dataList[1].title).toBe("Album 3");
			expect(collectionPresenter!.viewModel.dataList[1].year).toBe(2023);
		});
	});
});
