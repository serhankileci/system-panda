import { MetaDataPresenter } from "../../../metadata/metadata.presenter";
import { useState, useEffect } from "react";
import { block, For } from "million/react";

export const OverviewScreen = block(() => {
	const presenter = new MetaDataPresenter();

	const [viewModel, setViewModel] = useState(presenter.viewModel);

	const { collections, plugins } = viewModel;

	useEffect(() => {
		async function load() {
			await presenter.load();
			setViewModel(presenter.viewModel);
		}

		load();
	}, []);

	return (
		<article className="h-full p-4 rounded-lg">
			<h1 className="mb-6 text-6xl font-bold">General Overview</h1>

			<div className="flex gap-4 mb-6">
				<article className="w-auto p-4 text-center bg-white rounded-lg">
					<h3 className="font-normal">Collections</h3>
					<p className="text-6xl font-bold">{collections.length}</p>
				</article>
				<article className="w-auto p-4 text-center bg-white rounded-lg">
					<h3 className="font-normal">Enabled plugins</h3>
					<p className="text-6xl font-bold">{plugins.enabledPlugins.length}</p>
				</article>
				<article className="w-auto p-4 text-center bg-white rounded-lg">
					<h3 className="font-normal">Disabled plugins</h3>
					<p className="text-6xl font-bold">{plugins.disabledPlugins.length}</p>
				</article>
			</div>
			<article>
				<h2 className="mb-2 text-3xl font-bold">List of collections</h2>
				<ul className="px-4 py-3 bg-white rounded-lg">
					<For each={collections}>
						{(collection: string) => {
							return <li className="mb-2 ml-4">{collection.replace("/", "")}</li>;
						}}
					</For>
					<li className={`${collections.length === 0 ? "block" : "hidden"}`}>
						There are no collections
					</li>
				</ul>
			</article>
		</article>
	);
});
