import { For } from "million/react";

import { metaDataVmSignal } from "../../../shared/signals/metaDataVmSignal";

export const OverviewScreenComponent = () => {
	return (
		<article className="h-full pt-4 px-4 rounded-lg pb-12">
			<h1 className="mb-6 text-6xl font-bold">General Overview</h1>

			<div className="flex gap-4 mb-6">
				<article className="w-auto p-4 text-center bg-white rounded-lg shadow-lg shadow-[#c2ead5]">
					<h3 className="font-normal">Collections</h3>
					<p className="text-6xl font-bold">
						{metaDataVmSignal.value.collections.length}
					</p>
				</article>
				<article className="w-auto p-4 text-center bg-white rounded-lg shadow-lg shadow-[#c2ead5]">
					<h3 className="font-normal">Enabled plugins</h3>
					<p className="text-6xl font-bold">
						{metaDataVmSignal.value.plugins.enabledPlugins.length}
					</p>
				</article>
				<article className="w-auto p-4 text-center bg-white rounded-lg shadow-lg shadow-[#c2ead5]">
					<h3 className="font-normal">Disabled plugins</h3>
					<p className="text-6xl font-bold">
						{metaDataVmSignal.value.plugins.disabledPlugins.length}
					</p>
				</article>
			</div>
			<article>
				<h2 className="mb-2 text-3xl font-bold">List of collections</h2>
				<ul className="px-4 py-3 bg-white rounded-lg shadow-lg shadow-[#c2ead5]">
					<For each={metaDataVmSignal.value.collections}>
						{({ name }) => {
							return (
								<li className="mb-2 ml-4" key={name}>
									{name}
								</li>
							);
						}}
					</For>
					{!metaDataVmSignal.value.hasCollections && (
						<li>No collections have been detected</li>
					)}
				</ul>
			</article>
		</article>
	);
};

export const OverviewScreen = OverviewScreenComponent;
