import { Route } from "@tanstack/router";
import { OverviewScreen } from "./OverviewScreen";
import { appRoute } from "..";

export const overviewRoute = new Route({
	getParentRoute: () => appRoute,
	path: "/",
	component: OverviewScreen,
});
