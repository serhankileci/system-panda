/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Container } from "inversify";

import { AuthenticationRepository } from "../../auth/authentication.repository";
import { InversifyConfig } from "../../ioc/InversifyConfig";
import { getAuthorizedStub, getUnauthorizedStub } from "../stubs/login.stub";

export class LoginTestHarness {
	container: Container;

	authRepository: InstanceType<typeof AuthenticationRepository> | null = null;

	LOGIN = "LOGIN";

	LOGOUT = "LOGOUT";

	mode = this.LOGIN;

	constructor() {
		const inversifyConfig = new InversifyConfig();
		inversifyConfig.setupBindings();

		this.container = inversifyConfig.container;
	}

	init = ({ mode = this.LOGIN }) => {
		this.authRepository = this.container.get(AuthenticationRepository);

		jest.clearAllMocks();
		localStorage.clear();

		this.authRepository.email = null;
		this.authRepository.authenticated = false;

		if (mode === this.LOGOUT) {
			this.authRepository.authenticated = true;
		}

		this.authRepository.gateway.post = jest.fn().mockImplementation(path => {
			if (path === "/auth/login") {
				this.authRepository!.authenticated = true;

				return getAuthorizedStub();
			}

			if (path === "/auth/logout") {
				this.authRepository!.authenticated = false;

				return getAuthorizedStub();
			}

			return getUnauthorizedStub();
		});
	};
}
