import { CollectionScreen } from "./CollectionScreen";
import { appRoute } from "..";
import { Route } from "@tanstack/router";

export const collectionRoute = new Route({
	getParentRoute: () => appRoute,
	path: "/collections/$collection_name",
	component: CollectionScreen,
});
