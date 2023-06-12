const toPascalCase = (str: string) =>
	str
		.split(/[^a-zA-Z0-9]/g)
		.map(group => group[0].toUpperCase() + group.slice(1))
		.join("");

export { toPascalCase };
