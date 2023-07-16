/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useState } from "react";
import { auth } from "./auth.tsx";
import MobileSideBar from "./components/MobileSideBar/MobileSideBar";
import { MetaDataPresenter } from "./metadata/metadata.presenter";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { block } from "million/react";

function App() {
	const [loggedIn, setLoggedIn] = useState(
		Boolean(JSON.parse(localStorage.getItem("logged_in") || "false"))
	);

	const App = block(() => {
		const [loggedIn, setLoggedIn] = useState(
			Boolean(JSON.parse(localStorage.getItem("logged_in") || "false"))
		);
		const metaDataPresenter = new MetaDataPresenter();

		const [collectionsVM, setCollectionsVM] = useState([]);
		const [pluginsVM, setPluginsVM] = useState({
			activePlugins: [],
			inactivePlugins: [],
		});

		useEffect(() => {
			async function loadCollections() {
				await metaDataPresenter.loadCollections((vm: any) => {
					setCollectionsVM(vm);
				});
			}

			async function loadPlugins() {
				await metaDataPresenter.loadPlugins((vm: any) => {
					setPluginsVM(vm);

					console.log("test", pluginsVM);
				});
			}

			void loadCollections();
			void loadPlugins();
		}, []);

		const viewModel = {
			plugins: pluginsVM,
			collections: collectionsVM,
		};

		return (
			<div>
				{loggedIn ? (
					<>
						<auth.Logout setLoggedIn={setLoggedIn} />
						{/* {routes[window.location.pathname] || routes["/404"]} */}
					</>
				) : (
					<>
						<auth.Login setLoggedIn={setLoggedIn} />
					</>
				)}
				<DashboardLayout viewModel={viewModel}>
					<article className="h-full p-4 rounded-lg" style={{ border: "1px solid blue" }}>
						<h1 className="mb-6 text-6xl font-bold">General Overview</h1>

						<div className="flex gap-4 mb-6">
							<article className="w-auto p-4 text-center bg-white rounded-lg">
								<h3 className="font-normal">Collections</h3>
								<p className="text-6xl font-bold">{collectionsVM.length}</p>
							</article>
							<article className="w-auto p-4 text-center bg-white rounded-lg">
								<h3 className="font-normal">Enabled plugins</h3>
								<p className="text-6xl font-bold">
									{pluginsVM.activePlugins.length}
								</p>
							</article>
							<article className="w-auto p-4 text-center bg-white rounded-lg">
								<h3 className="font-normal">Disabled plugins</h3>
								<p className="text-6xl font-bold">
									{pluginsVM.inactivePlugins.length}
								</p>
							</article>
						</div>
						<article>
							<h2 className="mb-2 text-3xl font-bold">List of collections</h2>
							<ul className="px-4 py-3 bg-white rounded-lg">
								{collectionsVM.map((collection, index) => {
									return (
										<li key={index} className="mb-2">
											{collection}
										</li>
									);
								})}
							</ul>
						</article>
					</article>
				</DashboardLayout>
				<MobileSideBar viewModel={viewModel} />
			</div>
		);
	});
}

export default App;
