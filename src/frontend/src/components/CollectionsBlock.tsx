import { For, block } from "million/react";

interface CollectionsBlockProps {
	collections: string[];
}

export const CollectionsBlock = block((props: CollectionsBlockProps) => {
	const { collections = [] } = props;

	return (
		<>
			<For each={collections}>{(item: string) => <li className="mb-2">{item}</li>}</For>
			<li className={`${collections.length === 0 ? "block" : "hidden"}`}>
				There are no collections
			</li>
		</>
	);
});
