import { Outlet } from "@tanstack/router";
import TanStackRouterDevtools from "../routing/TanStackRouterDevtools";
import { router } from "../routing/router";

export const Root = () => {
	return (
		<div className="relative">
			<Outlet />
			<TanStackRouterDevtools router={router} />
		</div>
	);
};
