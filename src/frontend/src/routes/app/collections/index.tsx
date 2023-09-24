import { Route } from "@tanstack/react-router";

import { appRoute } from "..";
import { CollectionScreen } from "./CollectionScreen";

export const collectionRoute = new Route({
	getParentRoute: () => appRoute,
	path: "/collections/$collection_name",
	component: CollectionScreen,
});
