import { loadFeature, defineFeature } from "jest-cucumber";
import { getMetaDataStub } from "../../test-tools/metadata.stub";
import { MetaDataPresenter } from "../metadata.presenter";
import metaDataRepository from "../metadata.repository";

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
		metaDataRepository.pluginsPM = {
			activePlugins: [],
			inactivePlugins: [],
		};
		metaDataRepository.collectionsPM = [];

		metaDataLoadStub = getMetaDataStub;

		metaDataRepository.gateway.get = jest.fn().mockImplementation(path => {
			return Promise.resolve(metaDataLoadStub);
		});
	});

	const testSuite = async () => {
		await metaDataPresenter.loadPlugins((result: any) => {
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
