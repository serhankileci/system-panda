import authRepository from "../../auth/authentication.repository";
import { getAuthorizedStub, getUnauthorizedStub } from "../stubs/login.stub";

export class LoginTestHarness {
	LOGIN = "LOGIN";

	LOGOUT = "LOGOUT";

	mode = this.LOGIN;

	init = ({ mode = this.LOGIN }) => {
		jest.clearAllMocks();
		localStorage.clear();

		authRepository.email = null;
		authRepository.authenticated = false;

		if (mode === this.LOGOUT) {
			authRepository.authenticated = true;
		}

		authRepository.gateway.post = jest.fn().mockImplementation(path => {
			if (path === "/auth/login") {
				authRepository.authenticated = true;

				return getAuthorizedStub();
			}

			if (path === "/auth/logout") {
				authRepository.authenticated = false;

				return getAuthorizedStub();
			}

			return getUnauthorizedStub();
		});
	};
}
