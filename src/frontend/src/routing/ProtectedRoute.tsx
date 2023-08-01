import { MakeLinkOptions, Navigate } from "@tanstack/router";
import { observer } from "mobx-react";
import { ReactNode, useEffect } from "react";
import { router } from "./router";
import dayjs from "dayjs";
import { AuthPresenter } from "../auth/auth.presenter";

interface ProtectedRouteProps {
	to?: MakeLinkOptions["to"];
	redirectTo?: MakeLinkOptions["to"];
	children?: ReactNode;
}

interface AccessTokenType {
	expired: boolean;
	date: string;
}

export const ProtectedRoute = observer((props: ProtectedRouteProps) => {
	const { redirectTo = "/", children } = props;
	const authPresenter = new AuthPresenter();

	useEffect(() => {
		const checkLocalStorage = () => {
			const accessToken = localStorage.getItem("accessToken");

			if (!accessToken) {
				authPresenter.setAuth(false);
				router.navigate({ to: "/" });
				return null;
			}

			const accessTokenData = JSON.parse(accessToken) as AccessTokenType;

			if (accessTokenData.expired) {
				authPresenter.setAuth(false);
				router.navigate({ to: "/" });
				return null;
			}

			const dateAfterExpiration = dayjs(accessTokenData.date).isAfter(dayjs().toISOString());

			if (dateAfterExpiration) {
				const updatedExpiredObj = Object.assign({}, accessToken, {
					expired: true,
				});

				localStorage.setItem("accessToken", JSON.stringify(updatedExpiredObj));

				authPresenter.setAuth(false);
				router.navigate({ to: "/" });
			}
		};

		checkLocalStorage();
	}, []);

	if (!authPresenter.isAuthenticated) {
		return <Navigate to={redirectTo} />;
	}

	return <>{children}</>;
});
