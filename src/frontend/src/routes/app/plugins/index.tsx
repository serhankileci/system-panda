import { Route } from "@tanstack/react-router";

import { appRoute } from "..";
import { PluginsScreen } from "./PluginsScreen";

export const pluginsRoute = new Route({
	getParentRoute: () => appRoute,
	path: "/plugins",
	component: PluginsScreen,
});
