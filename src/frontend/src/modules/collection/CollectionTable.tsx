import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { CollectionRepository } from "./collection.repository";
import { useInjection } from "../../ioc/useInjection";

type Student = {
	id?: number | string;
	name: string | null;
};

const defaultData: Student[] = [];

const columnHelper = createColumnHelper<Student>();

const columns = [
	columnHelper.accessor(row => row.name, {
		id: "name",
		cell: info => <p className="px-3 py-1">{info.getValue() || "Empty"}</p>,
		header: () => <span>Name</span>,
		footer: info => info.column.id,
	}),
	columnHelper.accessor(row => row.id, {
		id: "actions",
		cell: info => (
			<div>
				<button
					className="mr-2 px-3 py-1 border border-1"
					onClick={() => {
						console.log(info.getValue());
					}}
				>
					Edit
				</button>
				<button
					className="px-3 py-1 border border-1"
					onClick={() => {
						console.log(info.getValue());
					}}
				>
					Delete
				</button>
			</div>
		),
		header: () => <span>Actions</span>,
		footer: info => info.column.id,
	}),
];

export const CollectionTable = (props: { collectionName: string }) => {
	const collectionRepository = useInjection(CollectionRepository);

	const [data, setData] = useState(() => [...defaultData]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	useEffect(() => {
		async function load() {
			if (props.collectionName) {
				console.log("name: ", props.collectionName);
				const data = await collectionRepository.getCollectionData(props.collectionName);

				console.log("data: ", data);

				setData(data);
			}
		}
		load();
	}, []);

	return (
		<div>
			<button className="border border-1 p-3">Create new element</button>
			<table>
				<thead>
					{table.getHeaderGroups().map(headerGroup => (
						<tr key={headerGroup.id}>
							{headerGroup.headers.map(header => (
								<th key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
										  )}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map(row => (
						<tr key={row.id}>
							{row.getVisibleCells().map(cell => (
								<td key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
