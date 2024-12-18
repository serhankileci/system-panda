import { InternalTables, Table } from "../util/index.js";

function checkOverlappingTables(
	internalTables: InternalTables,
	userDefinedTables: Table[]
): string[] {
	const overlappingTableNames = Object.values(userDefinedTables)
		.map(table => table.name)
		.filter(name =>
			Object.values(internalTables)
				.map(table => table.name)
				.includes(name)
		);

	return overlappingTableNames;
}

export { checkOverlappingTables };
