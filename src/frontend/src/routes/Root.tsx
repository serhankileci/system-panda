import { Outlet } from "@tanstack/react-router";
import { Suspense } from "react";

import { router } from "../routing/router";
import TanStackRouterDevtools from "../routing/TanStackRouterDevtools";

export const Root = () => {
	return (
		<div className="relative">
			<Outlet />
			<Suspense fallback={null}>
				<TanStackRouterDevtools router={router} />
			</Suspense>
		</div>
	);
};
