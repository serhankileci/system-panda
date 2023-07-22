import { Router, Route, RootRoute } from "@tanstack/router";
import App from "../App";
import config from "../shared/config";
import { Root } from "./Root";
import { CollectionScreen } from "../components/CollectionScreen";
import { OverviewScreen } from "../components/OverviewScreen";
import { PluginsScreen } from "../components/PluginsScreen";

const rootRoute = new RootRoute({
	component: Root,
});

const indexRoute = new Route({
	getParentRoute: () => rootRoute,
	path: config.baseUrl,
	component: App,
});

const overviewRoute = new Route({
	getParentRoute: () => indexRoute,
	path: "/",
	component: () => {
		return <OverviewScreen />;
	},
});

const collectionRoute = new Route({
	getParentRoute: () => indexRoute,
	path: "/collections/$collection_name",
	component: CollectionScreen,
});

const pluginsRoute = new Route({
	getParentRoute: () => indexRoute,
	path: "/plugins",
	component: PluginsScreen,
});

const routeTree = rootRoute.addChildren([
	indexRoute.addChildren([overviewRoute, collectionRoute, pluginsRoute]),
]);

export const router = new Router({
	routeTree,
});

declare module "@tanstack/router" {
	interface Register {
		router: typeof router;
	}
}
