/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { defineFeature, loadFeature } from "jest-cucumber";

import { InversifyConfig } from "../../../ioc/InversifyConfig";
import { CollectionPresenter } from "../../../modules/collection/collection.presenter";
import { CollectionRepository } from "../../../modules/collection/collection.repository";
import { AlbumStubResponse, getCollectionAlbumStub, getSuccessfulItemDeletionStub } from "../../stubs/collection.stub";
import { getMetaDataStub } from "../../stubs/metadata.stub";

const feature = loadFeature("src/__tests__/features/collection/delete-collection-item.feature");

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

			collectionRepository.httpGateway.delete = jest
				.fn()
				.mockImplementation((path: string, body: any) => {
					if (path.indexOf(`/collections/record`) !== -1) {
						return Promise.resolve(getSuccessfulItemDeletionStub(body.where.id));
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

			expect(collectionPresenter!.viewModel.dataList[1].title).toBe("Album 2");
			expect(collectionPresenter!.viewModel.dataList[1].year).toBe(2010);
		});

		when("I click on delete button on same row as the target collection item", async () => {
			await collectionPresenter!.removeItem("record", "2");

			expect(collectionRepository!.httpGateway.delete).toHaveBeenCalledWith(
				`/collections/record`,
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
