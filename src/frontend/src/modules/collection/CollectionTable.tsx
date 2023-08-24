import {
	ColumnDef,
	CoreRow,
	RowData,
	RowModel,
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { singularize } from "inflection";

import { useInjection } from "../../ioc/useInjection";
import { CollectionPresenter } from "./collection.presenter";

import { Modal } from "@mui/base/Modal";

export const CollectionTable = observer((props: { collectionName: string }) => {
	const presenter = useInjection(CollectionPresenter);

	const singlarizedCollectionName = singularize(props.collectionName);

	const [openModal, setOpenModel] = useState(false);
	const [modalState, setModalState] = useState<{ [key: string]: any }>({});

	const columnHelper = createColumnHelper<any>();

	const deleteItem = (id: string) => {
		console.log("delete id: ", id);
	};

	const defaultColumns = [
		columnHelper.accessor("actions", {
			id: "actions",
			cell: info => {
				const original = info.row.original as CoreRow<{ id: string }>;
				const id = original.id;

				return (
					<div className="text-center">
						<button
							className="px-3 py-1 border border-1 border-red-500 bg-red-50 text-red-500 font-medium rounded hover:shadow hover:shadow-red-50 active:shadow-red-100 active:shadow-md"
							onClick={() => deleteItem(id)}
						>
							Delete
						</button>
					</div>
				);
			},
			header: () => <span>Actions</span>,
			footer: info => info.column.id,
		}),
	];

	const [columns, setColumns] = useState<any[]>([]);
	const [data, setData] = useState(presenter.viewModel.dataList);

	useEffect(() => {
		async function load() {
			presenter.reset();
			setColumns([]);
			setData([]);

			if (props.collectionName) {
				await presenter.load(props.collectionName);

				const fieldColumns: any[] = defaultColumns.slice();

				const columnHelper = createColumnHelper<any>();

				presenter.viewModel.fields.forEach(field => {
					fieldColumns.push(
						columnHelper.accessor(field.name, {
							id: field.name,
							cell: info => {
								console.log("column: ", field);

								const originalValue = info.getValue();

								const [editing, setEditing] = useState<boolean>(false);
								const [inputValue, setInputValue] = useState(originalValue);

								const original = info.row.original as CoreRow<{ id: string }>;
								const id = original.id;

								const onCancel = () => {
									setInputValue(originalValue);
									setEditing(false);
								};

								const onSubmit = async () => {
									console.log(id);
									const newData = Object.assign({}, info.row.original, {
										[field.name]: inputValue,
									}) as {
										id: unknown;
										[key: string]: unknown;
									};

									if ("id" in newData) {
										delete newData.id;
									}

									console.log("newData", newData);

									const dto = await presenter.updateItem(
										props.collectionName,
										id,
										newData
									);
									console.log("dto: ", dto);

									setData(presenter.viewModel.dataList);

									setEditing(false);
								};

								let defaultInputType = "text";

								let alignmentClass = "text-center";

								if (field.type === "number") {
									defaultInputType = "number";
									alignmentClass = "text-right";
								}

								if (field.type === "DateTime") {
									defaultInputType = "date";
									alignmentClass = "text-left";
								}

								if (field.type === "String") {
									defaultInputType = "text";
									alignmentClass = "text-center";
								}

								return (
									<div>
										{editing ? (
											<div>
												<input
													value={inputValue}
													type={defaultInputType}
													onChange={e => setInputValue(e.target.value)}
													className="border border-1 bg-white mr-2 rounded py-1 px-2 focus:shadow-lg focus:shadow-blue-50 focus:border-blue-200 outline-0"
												/>
												<button
													className="bg-red-50 text-red-600 rounded py-1 px-3 hover:shadow hover:shadow-red-50 font-bold mr-2 border border-1 border-red-500 active:shadow-md active:shadow-red-100"
													onClick={onCancel}
												>
													X
												</button>
												<button
													className="bg-green-50 text-green-600 rounded py-1 px-3 hover: shadow-green-50 hover:shadow font-bold border border-1 border-green-500 active:shadow-green-100 active:shadow-lg"
													onClick={onSubmit}
												>
													✓
												</button>
											</div>
										) : (
											<div className={`${alignmentClass}`}>
												<p
													onClick={() => setEditing(true)}
													className="hover:bg-[#f2f2f2] hover:cursor-pointer rounded py-1 px-2"
												>
													{info.getValue()}
												</p>
											</div>
										)}
									</div>
								);
							},
							header: () => <span>{field.name}</span>,
							footer: info => info.column.id,
						})
					);
				});

				setColumns(fieldColumns);
				setData(presenter.viewModel.dataList);
			}
		}
		load();
	}, [props.collectionName]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div>
			<Modal
				open={openModal}
				style={{
					position: "fixed",
					zIndex: 1300,
					inset: 0,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					padding: "8px",
					background: "inherit",
					backgroundColor: "rgba(0, 0, 0, 0.5)",
					fontFamily: "'IBM Plex Sans', sans-serif",
				}}
				onClose={() => setOpenModel(false)}
			>
				<div className="bg-white rounded">
					<div className="text-right flex items-center gap-2 p-2">
						<p className="pl-2 pr-6 font-bold">New {singlarizedCollectionName}</p>
						<button
							className="bg-red-100 text-red-500 py-0.5 px-2.5 rounded-full font-bold hover:bg-red-200 hover:shadow active:shadow-md active:bg-red-500 active:text-white"
							onClick={() => setOpenModel(false)}
						>
							<span className="relative bottom-[0.5px]">x</span>
						</button>
					</div>
					<article className="px-3 py-2">
						{Object.keys(modalState).map((key, index) => {
							if (key === "id") {
								return null;
							}

							return (
								<section key={key}>
									<label htmlFor="key">{key}</label>
									<input
										id={key}
										type="text"
										value={modalState[key]}
										className="bg-[#f2f2f2] border border-1"
									/>
								</section>
							);
						})}
					</article>
				</div>
			</Modal>

			<button
				className="border border-1 px-4 py-2 bg-blue-500 rounded-lg text-white font-bold hover:bg-blue-600"
				onClick={() => {
					setOpenModel(true);
				}}
			>
				Create a new {singlarizedCollectionName}
			</button>
			{!presenter.viewModel.hasFields && (
				<p className="mt-3">This collection currently has no items.</p>
			)}
			<table className="bg-white mt-3 shadow-lg shadow-[#c2ead5]">
				<thead>
					{table.getHeaderGroups().map(headerGroup => (
						<tr key={headerGroup.id} className="bg-blue-50">
							{headerGroup.headers.map(header => (
								<th
									key={header.id}
									className="py-2 px-8 border-left-1 border border-top-white capitalize"
								>
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
								<td key={cell.id} className="py-3 px-8 border-left-1 border">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
});
