import { RootRoute } from "@tanstack/react-router";

import { ErrorScreen } from "../components/ErrorScreen";
import { Root } from "./Root";

export const rootRoute = new RootRoute({
	component: Root,
	onError(error) {
		console.error(error);
	},
	errorComponent: ErrorScreen,
});
