import { Route } from "@tanstack/router";
import { rootRoute } from "../root.route";
import { ProtectedRoute } from "../../routing/ProtectedRoute";
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
