// million-ignore
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/router";
import { router } from "./routing/router.tsx";
import { StrictMode } from "react";
import { configure } from "mobx";
import config from "./shared/config.ts";
import { container } from "./ioc/container.ts";
import "./index.css";
import { InjectionProvider } from "./ioc/InjectionProvider.tsx";

if (!config.isEnvironmentProd) {
	const { worker } = await import("./test-tools/mocks/browser.ts");
	await worker.start();
}

configure({
	enforceActions: "never",
	computedRequiresReaction: false,
	reactionRequiresObservable: false,
	observableRequiresReaction: false,
	disableErrorBoundaries: false,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<InjectionProvider container={container}>
			<RouterProvider router={router} />
		</InjectionProvider>
	</StrictMode>
);
