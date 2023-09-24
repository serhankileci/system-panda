import { Route } from "@tanstack/react-router";

import { appRoute } from "..";
import { OverviewScreen } from "./OverviewScreen";

export const overviewRoute = new Route({
	getParentRoute: () => appRoute,
	path: "/",
	component: OverviewScreen,
});
