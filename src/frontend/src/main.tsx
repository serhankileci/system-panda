/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (process.env.NODE_ENV === "development") {
	const { worker } = await import("./test-tools/mocks/browser.ts");
	await worker.start();
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
