import { RouterProvider } from "@tanstack/router";
import { configure } from "mobx";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { InjectionProvider } from "./ioc/InjectionProvider.tsx";
import { InversifyConfig } from "./ioc/InversifyConfig.ts";
import { router } from "./routing/router.tsx";
import config from "./shared/config.ts";

import "./index.css";

// if (!config.isEnvironmentProd) {
// 	const { worker } = await import("./test-tools/mocks/browser.ts");
// 	await worker.start();
// }

configure({
	enforceActions: "never",
	computedRequiresReaction: false,
	reactionRequiresObservable: false,
	observableRequiresReaction: false,
	disableErrorBoundaries: false,
});

const inversifyConfig = new InversifyConfig();

inversifyConfig.setupBindings();

const container = inversifyConfig.container;

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<InjectionProvider container={container}>
			<RouterProvider router={router} />
		</InjectionProvider>
	</StrictMode>
);
