import {
	toPascalCase,
	Database,
	Collections,
	IntField,
	Field,
	DateTimeField,
} from "../util/index.js";

function isField<T extends Field>(field: Field): field is T {
	return field.type === ({} as T)["type"];
}

const makePrismaModel = async (db: Database, collections: Collections) => {
	const dataSource = `// Generated by SystemPanda, do NOT modify,\n// configure your SystemPanda collections object instead.\n\ndatasource db {\n\tprovider = "${
		db.URI?.split(":")[0]
	}"\n\turl = env("DATABASE_URL")\n}\n\ngenerator client {\n\tprovider = "prisma-client-js"\n}\n\n`;

	return (
		dataSource +
		Object.keys(collections)
			.map(collection => {
				const { fields, id } = collections[collection];
				const idType = !id?.type || id?.type === "autoincrement" ? "Int" : "String";
				const idDefault = id?.type ? `${id.type}()` : "autoincrement()";
				const idName = id?.name || "id";

				const lines = [
					`model ${toPascalCase(collection)} {`,
					`\t${idName} ${idType} @id @default(${idDefault})`,
				];

				for (const key in fields) {
					const field = fields[key];
					const { defaultValue, required, type, unique, map } = field;
					const decidedType = isField<IntField>(field) ? field.kind : type;
					const requiredTypeOrNot = required ? decidedType : `${decidedType}?`;
					const parts = ["\t" + key.replace(/\s/g, "_"), requiredTypeOrNot];

					if (unique) parts.push("@unique");
					if (map) parts.push(`@map("${map}")`);
					if (defaultValue) {
						let value = JSON.stringify(defaultValue);

						if (isField<DateTimeField>(field)) {
							if (typeof field.defaultValue === "object")
								value = field.defaultValue.kind;
						}

						parts.push(`@default(${value})`);
					}

					lines.push(parts.join(" "));
				}

				for (const field in fields) {
					const { index } = fields[field];
					const parts = [];

					if (index) {
						parts.push(`\t@@index([${field}])`);
						lines.push(parts.join(""));
					}
				}

				lines.push("}");

				return lines.join("\n") + "\n";
			})
			.join("\n")
	);
};

export { makePrismaModel };
