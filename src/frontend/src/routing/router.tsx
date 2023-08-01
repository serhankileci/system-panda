import { Router } from "@tanstack/router";
import config from "../shared/config";
import { rootRoute } from "../routes/root.route";
import { indexRoute } from "../routes";
import { appRoute } from "../routes/app";
import { overviewRoute } from "../routes/app/overview";
import { collectionRoute } from "../routes/app/collections";
import { pluginsRoute } from "../routes/app/plugins";

/**
 * Note: Always insert routes with their children inside our route tree.
 * Why: Allows TanStack router to automatically generate types & to prop options.
 @since 0.0.1-beta.108
 */
const routeTree = rootRoute.addChildren([
	indexRoute,
	appRoute.addChildren([overviewRoute, collectionRoute, pluginsRoute]),
]);

export const router = new Router({
	routeTree,
	basepath: config.baseUrl,
});

declare module "@tanstack/router" {
	interface Register {
		router: typeof router;
	}
}
