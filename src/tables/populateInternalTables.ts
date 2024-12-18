import {
	AuthenticationTable,
	Table,
	defaultAuthFields,
	internalTablesKeys,
} from "../util/index.js";

function populateInternalTables(userDefinedAuthTable?: AuthenticationTable): {
	authentication: AuthenticationTable;
	sessions: Table;
	plugins: Table;
} {
	const commonProps = {
		type: "string",
		required: true,
	} as const;

	// merge used defined authentication table with default/additional values
	const authentication: typeof userDefinedAuthTable = {
		...defaultAuthFields,
		...userDefinedAuthTable,
	};

	const identifierField: Table["fields"][number] = {
		...commonProps,
		name: authentication.identifierField as string,
		index: true,
		unique: true,
	};
	const roleField: Table["fields"][number] = {
		...commonProps,
		name: authentication.roleField as string,
	};
	const secretField: Table["fields"][number] = {
		...commonProps,
		name: authentication.secretField as string,
	};
	const relationField: Table["fields"][number] = {
		name: "relation_session",
		type: "relation",
		many: true,
		ref: `${internalTablesKeys.sessions}.id` as never,
	};

	if (!authentication.fields || authentication.fields.length === 0)
		authentication.fields = [] as any;
	authentication.fields!.push(identifierField, roleField, secretField, relationField);

	const sessions: Table = {
		name: internalTablesKeys.sessions,
		id: {
			type: "cuid",
		},
		fields: [
			{
				name: "data",
				type: "json",
			},
			{
				name: "created_at",
				type: "date",
				defaultValue: {
					kind: "now",
				},
			},
			{
				name: "updated_at",
				type: "date",
				defaultValue: {
					kind: "updatedAt",
				},
			},
			{
				name: `relation_${authentication.name}`,
				type: "relation",
				many: false,
				ref: authentication.name as never,
			},
		],
	};
	const plugins: Table = {
		name: internalTablesKeys.plugins,
		fields: [
			{ name: "title", required: true, type: "string", unique: true },
			{ name: "description", required: true, type: "string" },
			{ name: "author", required: true, type: "string" },
			{ name: "version", required: true, type: "string" },
			{ name: "sourceCode", required: true, type: "string" },
			{ name: "active", required: true, type: "boolean" },
		],
	};

	return { authentication, sessions, plugins };
}

export { populateInternalTables };
