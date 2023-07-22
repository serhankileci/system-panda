import { useEffect, useState } from "react";
import MobileSideBar from "./components/MobileSideBar/MobileSideBar";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Outlet } from "@tanstack/router";
import { observer } from "mobx-react";
import { MetaDataPresenter } from "./metadata/metadata.presenter";

const App = observer(() => {
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
			<DashboardLayout>
				<Outlet />
			</DashboardLayout>
			<MobileSideBar viewModel={viewModel} />
		</div>
	);
});

export default App;
