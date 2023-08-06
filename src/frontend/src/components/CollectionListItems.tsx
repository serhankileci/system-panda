import { For } from "million/react";

import { collectionRoute } from "../routes/app/collections";
import { router } from "../routing/router";

import type { MetaDataViewModel } from "../shared/types/viewmodels";

type CollectionListItemsProps = {
	collections: MetaDataViewModel["collections"];
	hasCollections: MetaDataViewModel["hasCollections"];
	setState: (value: boolean) => void;
};

export const CollectionListItems = (props: CollectionListItemsProps) => {
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
										to: collectionRoute.to,
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

CollectionListItems.defaultProps = {
	collections: [],
	hasCollections: false,
};
