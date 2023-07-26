import { HttpGateway } from "../shared/http.gateway";
import config, { ConfigType } from "../shared/config";
import { makeAutoObservable } from "mobx";
import { makeLoggable } from "mobx-log";
import Cookies from "js-cookie";

export class AuthenticationRepository {
	config: ConfigType;
	gateway!: InstanceType<typeof HttpGateway>;

	email: string | null = null;
	token: string | boolean = false;
	authenticated = false;

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

	login = async (email: string, password: string) => {
		const dto = {
			email,
			password,
		};

		const response = await this.gateway.post("/auth/login", dto, false);

		if (response.ok) {
			this.email = email;

			const cookie = Cookies.get("system-panda-sid");

			if (cookie?.length && cookie !== "false") {
				this.authenticated = true;
			}
		}

		return response;
	};

	logout = async () => {
		const response = await this.gateway.post("/auth/logout", {}, false);

		if (response.ok) {
			Cookies.remove("system-panda-sid", { path: config.baseUrl });
			this.email = null;
			this.authenticated = false;
		}

		return response;
	};

	checkCookieAuthentication = () => {
		const cookie = Cookies.get("system-panda-sid");
		if (!cookie) {
			this.authenticated = false;
			return cookie;
		}

		this.authenticated = true;
		return cookie;
	};
}

const authenticationRepository = new AuthenticationRepository();

export default authenticationRepository;
