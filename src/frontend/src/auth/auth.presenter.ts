import authRepository from "./authentication.repository";

export class AuthPresenter {
	message: string | null = null;

	get email() {
		return authRepository.email;
	}

	get isAuthenticated() {
		return authRepository.authenticated;
	}

	login = async (email: string, password: string) => {
		const pm = await authRepository.login(email, password);

		if (pm.ok) {
			this.message = "Login successful";
		} else {
			this.message = "Invalid login credentials";
		}

		return pm;
	};

	logout = async () => {
		const pm = await authRepository.logout();

		if (pm.ok) {
			this.message = "Log out successful";
		}

		return pm;
	};

	setAuth(value: boolean) {
		authRepository.authenticated = value;
	}
}
