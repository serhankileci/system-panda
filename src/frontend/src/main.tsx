// million-ignore
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/router";
import { router } from "./routing/router.tsx";
import { StrictMode } from "react";
import { Provider } from "mobx-react";
import config from "./shared/config.ts";
import "./index.css";

if (!config.isEnvironmentProd) {
	const { worker } = await import("./test-tools/mocks/browser.ts");
	await worker.start();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider>
			<RouterProvider router={router} />
		</Provider>
	</StrictMode>
);
