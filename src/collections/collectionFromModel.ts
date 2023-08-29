import { CollectionSkeletons } from "../util/index.js";

function collectionFromModel(prismaSchema: string): CollectionSkeletons {
	const modelRegex = /model\s+(\w+)\s*{([\s\S]*?)}/g;
	const models: CollectionSkeletons = {};
	let match;

	while ((match = modelRegex.exec(prismaSchema)) !== null) {
		const modelName = match[1];
		const fieldsContent = match[2].trim();

		const fields = fieldsContent
			.split("\n")
			.map(line => line.trim().split(" ")[0])
			.filter(field => field !== "");

		fields.forEach(x => {
			if (!models[modelName]) models[modelName] = {};
			if (models[modelName]) models[modelName][x] = undefined;
		});
	}

	return models;
}

export { collectionFromModel };
