import { For } from "million/react";
import { router } from "../routing/router";
import { ViewModel } from "../shared/types/viewmodel";

type CollectionsBlockProps = {
	collections: ViewModel["collections"];
	hasCollections: ViewModel["hasCollections"];
	setState: (value: boolean) => void;
};

export const CollectionsBlock = (props: CollectionsBlockProps) => {
	const { collections = [], setState, hasCollections } = props;

	return (
		<>
			<For each={collections}>
				{({ name }) => {
					return (
						<li className="mb-2 ml-4">
							<button
								onClick={() => {
									router.navigate({
										to: "/app/collections/$collection_name",
										params: {
											collection_name: name,
										},
									});

									setState(false);
								}}
							>
								{name}
							</button>
						</li>
					);
				}}
			</For>
			<li className={`${!hasCollections ? "block" : "hidden"}`}>
				No collections have been detected
			</li>
		</>
	);
};
