// import { Table } from "../util";

// function tablesFromModels(prismaSchema: string): Table[] {
// 	const modelRegex = /model\s+(\w+)\s*{([\s\S]*?)}/g;
// 	const tables: Table[] = [];
// 	let match;

// 	while ((match = modelRegex.exec(prismaSchema)) !== null) {
// 		const tableName = match[1];
// 		const fieldsContent = match[2].trim();
// 		const fields = fieldsContent
// 			.split("\n")
// 			.map(line => line.trim().split(" ")[0])
// 			.filter(field => field !== "");

// 		fields.forEach(field => {
// 			const tableExists = tables.findIndex(table => table.name === tableName);

// 			if (tableExists) {
// 				tables[tableExists].fields.push({ name: field } as Table["fields"][number]);
// 			} else {
// 				tables.push({
// 					name: tableName,
// 					fields: [{ name: field } as Table["fields"][number]],
// 				});
// 			}
// 		});
// 	}

// 	return tables;
// }

// export { tablesFromModels };
