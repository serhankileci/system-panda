import { MakeLinkOptions, Navigate } from "@tanstack/router";
import { observer } from "mobx-react";
import { ReactNode, useEffect } from "react";
import authenticationRepository from "../auth/authentication.repository";
import Cookies from "js-cookie";
import { router } from "./router";

interface ProtectedRouteProps {
	to?: MakeLinkOptions["to"];
	redirectTo?: MakeLinkOptions["to"];
	children?: ReactNode;
}

export const ProtectedRoute = observer((props: ProtectedRouteProps) => {
	const { redirectTo = "/", children } = props;

	useEffect(() => {
		const checkCookie = () => {
			const cookie = Cookies.get("system-panda-sid");

			if (!cookie) {
				authenticationRepository.authenticated = false;
				router.navigate({ to: "/" });
			}

			if (!cookie?.length) {
				authenticationRepository.authenticated = false;
				router.navigate({ to: "/" });
			}

			if (cookie === "false") {
				authenticationRepository.authenticated = false;
				Cookies.remove("system-panda-sid");
				router.navigate({ to: "/" });
			}
		};

		checkCookie();
	}, []);

	if (!authenticationRepository.authenticated) {
		return <Navigate to={redirectTo} />;
	}

	return <>{children}</>;
});
