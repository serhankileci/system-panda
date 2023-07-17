import { Outlet } from "@tanstack/router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
const isProd = process.env.NODE_ENV === "production";

export const Root = () => {
	return (
		<>
			<Outlet />
			{!isProd && <TanStackRouterDevtools initialIsOpen={true} />}
		</>
	);
};
