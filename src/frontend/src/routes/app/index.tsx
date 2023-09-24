import { Route } from "@tanstack/react-router";

import { ProtectedRoute } from "../../routing/ProtectedRoute";
import { rootRoute } from "../root.route";
import App from "./App";

export const appRoute = new Route({
	getParentRoute: () => rootRoute,
	path: "app",
	component: () => {
		return (
			<ProtectedRoute redirectTo="/">
				<App />
			</ProtectedRoute>
		);
	},
});
