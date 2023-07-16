/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ReactNode, useEffect, useState } from "react";
import { block } from "million/react";
import baseUrl from "../shared/constants/baseUrl";

interface DashboardLayoutProps {
	children: ReactNode | ReactNode[];
	viewModel: any;
}

export const DashboardLayout = block((props: DashboardLayoutProps) => {
	const { children, viewModel } = props;
	const [isNavbarOpen, setIsNavbarOpen] = useState(true);

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.metaKey && event.key === "b") {
				setIsNavbarOpen(!isNavbarOpen);
			}
		};

		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
		};
	}, [isNavbarOpen]);

	const dashboardClassName = [
		"grid grid-cols-1 max-w-[93rem] mx-auto h-full p-4  gap-4",
		isNavbarOpen && "lg:grid-cols-[auto_1fr]",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={dashboardClassName} style={{ border: "1px solid red" }}>
			{isNavbarOpen && (
				<aside className="invisible hidden w-auto h-full bg-white rounded-lg opacity-0 lg:visible lg:block lg:opacity-100">
					<header className="px-6 pt-6">
						<h1 className="text-2xl font-bold">🐼 System Panda</h1>
					</header>
					<nav className="px-6 py-3">
						<a href={baseUrl} className="block mb-2 text-lg font-medium">
							Dashboard
						</a>
						<h2 className="text-lg font-medium">Collections</h2>
						<ul className="mb-2">
							{viewModel.collections.length ? (
								viewModel.collections.map((collection: string, index: number) => {
									return (
										<li key={index} className="ml-6">
											<a href={`${baseUrl}/collections${collection}`}>
												{collection.replace("/", "")}
											</a>
										</li>
									);
								})
							) : (
								<p>No collections have been detected</p>
							)}
						</ul>
						<a href={`${baseUrl}/plugins`} className="text-lg font-medium">
							Plugins
						</a>
					</nav>
				</aside>
			)}
			<main>{children}</main>
		</div>
	);
});
