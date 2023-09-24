import { block } from "million/react";

export const PluginsScreen = block(() => {
	return (
		<article>
			<h1 className="mb-6 text-6xl font-bold">Plugins List</h1>
			<p className="mb-4">Enable or disable plugins</p>

			<section className="inline-flex w-auto px-3 py-4 border border-1 border-red-500 text-red-500 rounded bg-red-50">
				<h2>
					This page is currently a work in progress. Please visit our GitHub repository
					for future updates.
				</h2>
			</section>
		</article>
	);
});
