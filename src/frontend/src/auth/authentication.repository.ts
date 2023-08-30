import { HttpGateway } from "../shared/http.gateway";
import config, { ConfigType } from "../shared/config";
import { action, makeAutoObservable } from "mobx";
import { makeLoggable } from "mobx-log";
import dayjs from "dayjs";

export class AuthenticationRepository {
	config: ConfigType;
	gateway!: InstanceType<typeof HttpGateway>;

	email: string | null = null;
	token: string | boolean = false;
	authenticated = false;

	ACCESS_TOKEN = "accessToken";

	constructor() {
		this.config = config;
		this.gateway = new HttpGateway();

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

		const response = await this.gateway.post("/auth/login", dto, false);

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
		const response = await this.gateway.post("/auth/logout", {}, false);

		if (response.ok) {
			localStorage.removeItem(this.ACCESS_TOKEN);
			this.email = null;
			this.setAuthentication(false);
		}

		return response;
	};
}

const authenticationRepository = new AuthenticationRepository();

export default authenticationRepository;
