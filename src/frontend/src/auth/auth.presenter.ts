import { inject, injectable } from "inversify";
import { action, observable } from "mobx";

import { AuthenticationRepository } from "./authentication.repository";

@injectable()
export class AuthPresenter {
	@inject(AuthenticationRepository) authRepository!: InstanceType<
		typeof AuthenticationRepository
	>;

	@observable
	message: string | null = null;

	get email() {
		return this.authRepository.email;
	}

	get isAuthenticated() {
		return this.authRepository.authenticated;
	}

	@action setMessage(value: string | null) {
		this.message = value;
	}

	get authMessage() {
		return this.message;
	}

	setAuth(value: boolean) {
		this.authRepository.setAuthentication(value);
	}

	login = async (email: string, password: string) => {
		const pm = await this.authRepository.login(email, password);

		if (pm.ok) {
			this.setMessage(null);
		} else {
			this.setMessage("Invalid login credentials");
		}

		return pm;
	};

	logout = async () => {
		const pm = await this.authRepository.logout();

		if (pm.ok) {
			this.setMessage("Log out successful");
		}

		return pm;
	};
}
