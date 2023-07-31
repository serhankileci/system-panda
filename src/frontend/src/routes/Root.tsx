import { Outlet } from "@tanstack/router";

export const Root = () => {
	return (
		<div className="relative">
			<Outlet />
		</div>
	);
};
