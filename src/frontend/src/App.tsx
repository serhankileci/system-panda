import { useEffect, useState } from "react";
import { auth } from "./auth.tsx";
import MobileSideBar from "./components/MobileSideBar/MobileSideBar";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Outlet } from "@tanstack/router";
import { observer } from "mobx-react";
import { MetaDataPresenter } from "./metadata/metadata.presenter";

const App = observer(() => {
	const [loggedIn, setLoggedIn] = useState(
		Boolean(JSON.parse(localStorage.getItem("logged_in") || "false"))
	);
	const presenter = new MetaDataPresenter();
	const [viewModel, setViewModel] = useState(presenter.viewModel);

	useEffect(() => {
		const load = () => {
			void presenter.load().then(() => {
				setViewModel(presenter.viewModel);
			});
		};
		load();
	}, []);

	return (
		<div className="pt-12">
			<div className="bg-white p-4 fixed bottom-0 right-0 shadow shadow-md m-6">
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
			</div>

			<DashboardLayout>
				<Outlet />
			</DashboardLayout>

			<MobileSideBar viewModel={viewModel} />
		</div>
	);
});

export default App;
