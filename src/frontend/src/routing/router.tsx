import { Router, Route, RootRoute } from "@tanstack/router";
import App from "../App";
import config from "../shared/config";
import { Root } from "./Root";
import { CollectionScreen } from "../components/CollectionScreen";
import { OverviewScreen } from "../components/OverviewScreen";
import { PluginsScreen } from "../components/PluginsScreen";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../auth/LoginPage";

const rootRoute = new RootRoute({
	component: Root,
});

const indexRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "/",
	component: LoginPage,
});

const appRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "app",
	component: props => {
		return (
			<ProtectedRoute redirectTo="/">
				<App />
			</ProtectedRoute>
		);
	},
});

const overviewRoute = new Route({
	getParentRoute: () => appRoute,
	path: "/",
	component: () => {
		return <OverviewScreen />;
	},
});

const collectionRoute = new Route({
	getParentRoute: () => appRoute,
	path: "/collections/$collection_name",
	component: CollectionScreen,
});

const pluginsRoute = new Route({
	getParentRoute: () => appRoute,
	path: "/plugins",
	component: PluginsScreen,
});

// Always insert routes with their children inside route tree, so to link options are automatically generated.
const routeTree = rootRoute.addChildren([
	indexRoute.addChildren([]),
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
