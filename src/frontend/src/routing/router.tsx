import { Route, Router } from "@tanstack/react-router";

import { LostScreen } from "../components/LostScreen";
import { indexRoute } from "../routes";
import { appRoute } from "../routes/app";
import { collectionRoute } from "../routes/app/collections";
import { overviewRoute } from "../routes/app/overview";
import { pluginsRoute } from "../routes/app/plugins";
import { rootRoute } from "../routes/root.route";
import config from "../shared/config";

const catchAllRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "*",
	component: LostScreen,
});

/**
 * Note: Always insert routes with their children inside our route tree.
 * Why: Allows TanStack router to automatically generate types & to prop options.
 @since 0.0.1-beta.108
 */
const routeTree = rootRoute.addChildren([
	indexRoute,
	catchAllRoute,
	appRoute.addChildren([overviewRoute, collectionRoute, pluginsRoute]),
]);

export const router = new Router({
	routeTree,
	basepath: config.baseUrl,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
