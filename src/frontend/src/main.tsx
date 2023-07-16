/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "@tanstack/router";
import { router } from "./routing/router.tsx";
import { StrictMode } from "react";
import { Provider } from "mobx-react";

if (process.env.NODE_ENV === "development") {
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
