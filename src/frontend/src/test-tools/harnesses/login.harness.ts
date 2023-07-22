import authRepository from "../../auth/authentication.repository";
import { getAuthorizedStub, getUnauthorizedStub } from "../stubs/login.stub";
import Cookies from "js-cookie";

export class LoginTestHarness {
	LOGIN = "LOGIN";

	LOGOUT = "LOGOUT";

	mode = this.LOGIN;

	init = ({ mode = this.LOGIN }) => {
		jest.clearAllMocks();

		authRepository.email = null;
		authRepository.authenticated = false;

		if (mode === this.LOGOUT) {
			authRepository.authenticated = true;
		}

		authRepository.gateway.post = jest.fn().mockImplementation(path => {
			if (path === "/auth/login") {
				Cookies.set = jest.fn().mockImplementation(() => {
					authRepository.authenticated = true;
				});

				Cookies.get = jest.fn().mockImplementation(() => {
					authRepository.authenticated = true;
				});

				return getAuthorizedStub();
			}

			if (path === "/auth/logout") {
				Cookies.set = jest.fn().mockImplementation(() => {
					authRepository.authenticated = false;
				});

				Cookies.get = jest.fn().mockImplementation(() => {
					authRepository.authenticated = false;
				});

				return getAuthorizedStub();
			}

			return getUnauthorizedStub();
		});
	};
}
