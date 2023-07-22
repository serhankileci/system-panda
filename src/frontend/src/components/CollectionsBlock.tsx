import { For, block } from "million/react";
import { router } from "../routing/router";

interface CollectionsBlockProps {
	collections: string[];
	setState: (value: boolean) => void;
}

export const CollectionsBlock = block((props: CollectionsBlockProps) => {
	const { collections = [], setState } = props;

	return (
		<>
			<For each={collections}>
				{(collection: string) => {
					return (
						<li className="mb-2 ml-4">
							<button
								onClick={() => {
									router.navigate({
										to: "/app/collections/$collection_name",
										params: {
											collection_name: collection.replace("/", ""),
										},
									});

									setState(false);
								}}
							>
								{collection.replace("/", "")}
							</button>
						</li>
					);
				}}
			</For>
			<li className={`${collections.length === 0 ? "block" : "hidden"}`}>
				There are no collections
			</li>
		</>
	);
});
