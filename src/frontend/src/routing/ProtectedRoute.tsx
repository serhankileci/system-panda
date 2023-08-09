import { MakeLinkOptions, Navigate } from "@tanstack/router";
import dayjs from "dayjs";
import { observer } from "mobx-react";
import { ReactNode, useEffect } from "react";

import { AuthPresenter } from "../auth/auth.presenter";
import { useInjection } from "../ioc/useInjection";
import { router } from "./router";

type ProtectedRouteProps = {
	to?: MakeLinkOptions["to"];
	redirectTo?: MakeLinkOptions["to"];
	children?: ReactNode;
};

interface AccessTokenType {
	expired: boolean;
	date: string;
}

export const ProtectedRoute = observer((props: ProtectedRouteProps) => {
	const { redirectTo = "/", children } = props;
	const presenter = useInjection(AuthPresenter);

	useEffect(() => {
		const checkLocalStorage = () => {
			const accessToken = localStorage.getItem("accessToken");

			if (!accessToken) {
				presenter.setAuth(false);
				router.navigate({ to: "/" });
				return null;
			}

			const accessTokenData = JSON.parse(accessToken) as AccessTokenType;

			if (accessTokenData.expired) {
				presenter.setAuth(false);
				router.navigate({ to: "/" });
				return null;
			}

			const dateAfterExpiration = dayjs(accessTokenData.date).isAfter(dayjs().toISOString());

			if (dateAfterExpiration) {
				const updatedExpiredObj = Object.assign({}, accessToken, {
					expired: true,
				});

				localStorage.setItem("accessToken", JSON.stringify(updatedExpiredObj));

				presenter.setAuth(false);
				router.navigate({ to: "/" });
			}
		};

		checkLocalStorage();
	}, []);

	if (!presenter.isAuthenticated) {
		return <Navigate to={redirectTo} />;
	}

	return <>{children}</>;
});
