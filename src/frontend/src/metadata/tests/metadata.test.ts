/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/await-thenable */
import { loadFeature, defineFeature } from "jest-cucumber";
import { Observable } from "../../shared/Observable";
import { getMetaDataStub } from "../../test-tools/metadata.stub";
import { MetaDataPresenter } from "../metadata.presenter";
import metaDataRepository from "../metadata.repository";

// require("src/metadata/tests/features/metadata.feature")
const feature = loadFeature("src/metadata/tests/features/metadata.feature");

let metaDataPresenter: InstanceType<typeof MetaDataPresenter>;
let viewModel = {
	collections: [],
	plugins: {
		activePlugins: [],
		inactivePlugins: [],
	},
};
let metaDataLoadStub: unknown = null;

defineFeature(feature, test => {
	beforeEach(() => {
		viewModel = {
			collections: [],
			plugins: {
				activePlugins: [],
				inactivePlugins: [],
			},
		};
		metaDataLoadStub = null;
		metaDataPresenter = new MetaDataPresenter();
		metaDataRepository.pluginsPM = new Observable([]);
		metaDataRepository.collectionsPM = new Observable([]);

		metaDataLoadStub = getMetaDataStub;

		metaDataRepository.gateway.get = jest.fn().mockImplementation(path => {
			console.log("path: ", path);
			return Promise.resolve(metaDataLoadStub);
		});
	});

	const testSuite = async () => {
		console.log("hit: ", viewModel);
		await metaDataPresenter.loadPlugins((result: any) => {
			console.error("result: ", result);
			viewModel = Object.assign({}, viewModel, {
				plugins: result,
			});
		});

		await metaDataPresenter.loadCollections(result => {
			viewModel = Object.assign({}, viewModel, {
				collections: result,
			});
		});
	};

	test("Arriving on Dashboard screen", ({ given, then }) => {
		given("the dashboard tell its Presenter to load data on mount.", async () => {
			await testSuite();
		});

		then("I should have a list of plugins and collections.", () => {
			expect(viewModel.collections.length).toEqual(5);
			expect(viewModel.collections[0]).toBe("/student");
			expect(viewModel.collections[2]).toBe("/song");
			expect(viewModel.collections[4]).toBe("/users");
		});
	});
});
