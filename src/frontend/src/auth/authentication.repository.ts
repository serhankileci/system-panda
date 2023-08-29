import "reflect-metadata";

import { HttpGateway } from "../shared/gateways/http.gateway";
import config, { ConfigType } from "../shared/config";
import { action, makeAutoObservable } from "mobx";
import { makeLoggable } from "mobx-log";
import dayjs from "dayjs";
import { inject, injectable } from "inversify";
import { Types } from "../shared/types/ioc-types";
import { AuthResponse } from "./auth.types";

@injectable()
export class AuthenticationRepository {
	@inject(Types.IHttpGateway) gateway!: InstanceType<typeof HttpGateway>;
	config: ConfigType;

	email: string | null = null;
	token: string | boolean = false;
	authenticated = false;

	ACCESS_TOKEN = "accessToken";

	constructor() {
		this.config = config;

		makeAutoObservable(this);

		!config.isEnvironmentProd &&
			makeLoggable(this, {
				filters: {
					events: {
						computeds: true,
						observables: true,
						actions: true,
					},
				},
			});
	}

	@action setAuthentication(newValue: boolean) {
		this.authenticated = newValue;
	}

	login = async (email: string, password: string) => {
		const dto = {
			email,
			password,
		};

		const response = await this.gateway.post<AuthResponse>("/auth/login", dto, false);

		if (response.ok) {
			this.email = email;

			localStorage.setItem(
				"accessToken",
				JSON.stringify({ expired: false, date: dayjs().toISOString() })
			);

			const accessToken = !!localStorage.getItem(this.ACCESS_TOKEN);

			if (accessToken) {
				this.setAuthentication(true);
			}
		}

		return response;
	};

	logout = async () => {
		const response = await this.gateway.post<AuthResponse>("/auth/logout", {}, false);

		if (response.ok) {
			localStorage.removeItem(this.ACCESS_TOKEN);
			this.email = null;
			this.setAuthentication(false);
		}

		return response;
	};
}
