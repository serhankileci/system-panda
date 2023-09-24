import { Route } from "@tanstack/react-router";

import { ErrorScreen } from "../components/ErrorScreen";
import { LoginPage } from "./LoginPage";
import { rootRoute } from "./root.route";

export const indexRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/",
	component: LoginPage,
	onError(error) {
		console.error(error);
	},
	errorComponent: ErrorScreen,
});
