import { defineFeature, loadFeature } from "jest-cucumber";

import { InversifyConfig } from "../../ioc/InversifyConfig";
import { getMetaDataStub } from "../../test-tools/metadata.stub";
import { MetaDataPresenter } from "../metadata.presenter";
import { MetaDataRepository } from "../metadata.repository";

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

const inversifyConfig = new InversifyConfig("test");
inversifyConfig.setupBindings();
const container = inversifyConfig.container;

defineFeature(feature, test => {
	const metaDataRepository = container.get(MetaDataRepository);

	beforeEach(() => {
		viewModel = {
			collections: [],
			plugins: {
				activePlugins: [],
				inactivePlugins: [],
			},
		};
		metaDataLoadStub = null;
		metaDataPresenter = container.get(MetaDataPresenter);
		metaDataRepository.pluginsPM = {
			activePlugins: [],
			inactivePlugins: [],
		};
		metaDataRepository.collectionsPM = [];

		metaDataLoadStub = getMetaDataStub();

		metaDataRepository.gateway.get = jest.fn().mockImplementation(_path => {
			return Promise.resolve(metaDataLoadStub);
		});
	});

	const testSuite = async () => {
		await metaDataPresenter.load();

		viewModel = Object.assign({}, viewModel, {
			plugins: metaDataPresenter.plugins,
		});

		viewModel = Object.assign({}, viewModel, {
			collections: metaDataPresenter.collections,
		});
	};

	test("Arriving on Dashboard screen", ({ given, then }) => {
		given("the dashboard tell its Presenter to load data on mount.", async () => {
			await testSuite();
		});

		then("I should have a list of plugins and collections.", () => {
			expect(viewModel.collections.length).toEqual(6);
			expect(viewModel.collections[0]).toBe("/student");
			expect(viewModel.collections[2]).toBe("/song");
			expect(viewModel.collections[4]).toBe("/users");
		});
	});
});
