import { ReactNode, useEffect, useState } from "react";
import { observer } from "mobx-react";
import { MetaDataPresenter } from "../metadata/metadata.presenter";
import { Link } from "@tanstack/router";
import { AuthPresenter } from "../auth/auth.presenter";

type DashboardLayoutProps = {
	children: ReactNode | ReactNode[];
};

export const DashboardLayout = observer((props: DashboardLayoutProps) => {
	const { children } = props;
	const [isNavbarOpen, setIsNavbarOpen] = useState(true);

	const metaDataPresenter = new MetaDataPresenter();
	const authPresenter = new AuthPresenter();

	const { viewModel } = metaDataPresenter;

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
		<div className={dashboardClassName}>
			{isNavbarOpen && (
				<aside className="invisible hidden w-auto h-full bg-white rounded-lg opacity-0 lg:visible lg:flex lg:flex-col lg:opacity-100 shadow-lg shadow-[#c2ead5]">
					<header className="px-6 pt-6 h-[10%] mb-4">
						<h1 className="text-2xl font-bold">🐼 SystemPanda</h1>
					</header>
					<nav className="px-6 py-3 h-full grid grid-rows-[1fr_auto_auto]">
						<div className="">
							<Link className="block mb-2 text-lg font-medium" to="/app">
								Dashboard
							</Link>
							<h2 className="text-lg font-medium">Collections</h2>
							<ul className="mb-2">
								{viewModel.hasCollections &&
									viewModel.collections.map(({ name }, index: number) => {
										return (
											<li
												key={index}
												className="ml-6 text-slate-600 hover:text-slate-800"
											>
												<Link
													to="/app/collections/$collection_name"
													params={{
														collection_name: name,
													}}
												>
													{name}
												</Link>
											</li>
										);
									})}
								<li className={`${!viewModel.hasCollections ? "block" : "hidden"}`}>
									No collections have been detected
								</li>
							</ul>
							<Link to="/app/plugins" className="text-lg font-medium">
								Plugins
							</Link>
						</div>
						<button
							className="block w-full text-lg px-12 bg-gray-200 py-2 rounded-lg text-gray-600 font-medium border border-1 border-white hover:border-black hover:bg-black hover:text-white"
							onClick={() => {
								authPresenter.logout();
							}}
						>
							Log out
						</button>
						<span className="block text-center text-xs mt-2 text-slate-600">⌘ + B</span>
					</nav>
				</aside>
			)}
			<main>{children}</main>
		</div>
	);
});
