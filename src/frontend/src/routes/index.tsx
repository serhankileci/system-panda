import { Route } from "@tanstack/router";
import { LoginPage } from "./LoginPage";
import { rootRoute } from "./root.route";

export const indexRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/",
	component: LoginPage,
});
