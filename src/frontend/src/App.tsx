/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useState } from "react";
// import MobileSideBar from "./components/MobileSideBar/MobileSideBar";
import { auth } from "./auth.tsx";
// import { useState } from "react";
import { MetaDataPresenter } from "./metadata/metadata.presenter.ts";

function App() {
	const [loggedIn, setLoggedIn] = useState(
		Boolean(JSON.parse(localStorage.getItem("logged_in") || "false"))
	);

	const metaDataPresenter = new MetaDataPresenter();

	const [collectionsVM, setCollectionsVM] = useState([]);

	useEffect(() => {
		async function loadCollections() {
			await metaDataPresenter.loadCollections((vm: any) => {
				setCollectionsVM(vm);
			});
		}

		void loadCollections();
	}, []);

	return (
		<>
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

			<div
				className="flex items-center max-w-[91rem] h-screen mx-auto p-3"
				style={{ border: "1px solid red" }}
			>
				<div className="flex max-w-[20rem] m-auto gap-4 items-center">
					<aside className="invisible hidden w-auto p-3 bg-white rounded-lg opacity-0 lg:visible lg:block lg:opacity-100">
						<h1 className="text-xl font-bold">🐼 System Panda</h1>
						<ul>
							<li className="font-medium">Overview</li>
							<li className="font-medium">Plugins</li>
							<li className="font-medium">
								<h1 className="font-medium">Collections</h1>
								<ul className="ml-4">
									{collectionsVM.map((col, index) => {
										return (
											<li key={index} className="text-slate-600">
												{col}
											</li>
										);
									})}
								</ul>
							</li>
							<li className="font-medium">Settings</li>
							<li className="font-medium">Log out</li>
						</ul>
					</aside>
					<article className="p-4 bg-white rounded-lg">
						{collectionsVM.map((col, index) => {
							return <p key={index}>{col}</p>;
						})}
					</article>
				</div>
			</div>
			{/* <MobileSideBar /> */}
		</>
	);
}

export default App;
