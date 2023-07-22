import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/router";
import { router } from "./routing/router.tsx";
import { StrictMode } from "react";
import { Provider } from "mobx-react";
import "./index.css";
import TanStackRouterDevtools from "./routing/TanStackRouterDevtools.tsx";

if (process.env.NODE_ENV === "development") {
	const { worker } = await import("./test-tools/mocks/browser.ts");
	await worker.start();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Provider>
			<RouterProvider router={router} />
			<TanStackRouterDevtools router={router} />
		</Provider>
	</StrictMode>
);
