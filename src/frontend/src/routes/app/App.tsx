import { Outlet } from "@tanstack/router";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";

import MobileSideBar from "../../components/MobileSideBar/MobileSideBar";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { MetaDataPresenter } from "../../metadata/metadata.presenter";

import type { MetaDataViewModel } from "../../shared/types/viewmodels";
import { metaDataVmSignal } from "../../shared/signals/metaDataVmSignal";
import { useInjection } from "../../ioc/useInjection";

export const App = observer(() => {
	const presenter = useInjection(MetaDataPresenter);

	const [viewModel, setViewModel] = useState<MetaDataViewModel>({
		plugins: {
			enabledPlugins: [],
			disabledPlugins: [],
		},
		collections: [],
		hasCollections: false,
	});

	useEffect(() => {
		const load = () => {
			void presenter.load().then(() => {
				setViewModel(presenter.viewModel);
				metaDataVmSignal.value = presenter.viewModel;
			});
		};
		load();
	}, []);

	return (
		<div className="pt-12 pb-16">
			<DashboardLayout viewModel={viewModel}>
				<Outlet />
			</DashboardLayout>
			<MobileSideBar viewModel={viewModel} />
		</div>
	);
});

export default App;
