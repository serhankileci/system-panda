import { Route } from "@tanstack/router";
import { LoginPage } from "./LoginPage";
import { rootRoute } from "./root.route";
import { ErrorScreen } from "../components/ErrorScreen";

export const indexRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/",
	component: LoginPage,
	onError(error) {
		console.error(error);
	},
	errorComponent: ErrorScreen,
});
