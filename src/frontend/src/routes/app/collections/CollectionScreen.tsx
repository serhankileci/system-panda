import { observer } from "mobx-react";
import { CollectionTable } from "../../../modules/collection/CollectionTable";

export const CollectionScreen = observer(
	(props: { useParams: () => { collection_name: string } }) => {
		const { collection_name = "" } = props.useParams();

		console.log("collectionParam: ", collection_name);

		return (
			<article className="h=full pt-4 px-4 pb-12">
				<h1 className="mb-6 text-6xl font-bold">
					<span className="text-[#20852d] capitalize">
						{collection_name.replace("/", "")}
					</span>{" "}
					collection
				</h1>
				<CollectionTable collectionName={collection_name} />
			</article>
		);
	}
);
