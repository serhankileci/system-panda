import authRepository from "./authentication.repository";
import { observable, action } from "mobx";

export class AuthPresenter {
	@observable message: string | null = null;

	get email() {
		return authRepository.email;
	}

	get isAuthenticated() {
		return authRepository.authenticated;
	}

	@action setMessage(value: string | null) {
		this.message = value;
	}

	get authMessage() {
		return this.message;
	}

	setAuth(value: boolean) {
		authRepository.setAuthentication(value);
	}

	login = async (email: string, password: string) => {
		const pm = await authRepository.login(email, password);

		if (pm.ok) {
			this.setMessage(null);
		} else {
			this.setMessage("Invalid login credentials");
		}

		return pm;
	};

	logout = async () => {
		const pm = await authRepository.logout();

		if (pm.ok) {
			this.setMessage("Log out successful");
		}

		return pm;
	};
}
