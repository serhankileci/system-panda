import { observer } from "mobx-react";

export const CollectionScreen = observer(
	(props: { useParams: () => { collection_name: string } }) => {
		const { collection_name = "" } = props.useParams();

		return (
			<article>
				<h1 className="mb-6 text-6xl font-bold">
					{collection_name.replace("/", "")} collection
				</h1>
				<p>Insert table here</p>
			</article>
		);
	}
);
