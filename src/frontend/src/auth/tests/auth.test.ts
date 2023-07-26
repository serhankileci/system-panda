import { loadFeature, defineFeature } from "jest-cucumber";
import authRepository from "../authentication.repository";
import { AuthPresenter } from "../auth.presenter";
import { LoginTestHarness } from "../../test-tools/harnesses/login.harness";

const featureLoggingIn = loadFeature("src/auth/tests/features/login.feature");

defineFeature(featureLoggingIn, test => {
	test("Entering the correct password", ({ given, when, then }) => {
		let authPresenter: InstanceType<typeof AuthPresenter>;

		beforeEach(() => {
			authPresenter = new AuthPresenter();
			const testHarness = new LoginTestHarness();
			testHarness.init({ mode: "LOGIN" });
		});

		given("the dashboard tell its Presenter to load data on mount.", () => {
			expect(authRepository.authenticated).toBeFalsy();
		});

		when("I enter my admin password correctly", async () => {
			const pm = await authPresenter.login("admin@system-panda.com", "1234");

			expect(authRepository.gateway.post).toHaveBeenCalledTimes(1);
			expect(authPresenter.email).toBe("admin@system-panda.com");

			expect(pm.ok).toBe("OK");
		});

		then("I should be authorized and granted access", () => {
			expect(authRepository.authenticated).toBeTruthy();
		});
	});
});

const featureLoggingOut = loadFeature("src/auth/tests/features/logout.feature");

defineFeature(featureLoggingOut, test => {
	let authPresenter: InstanceType<typeof AuthPresenter>;

	beforeEach(() => {
		authPresenter = new AuthPresenter();
		const testHarness = new LoginTestHarness();
		testHarness.init({ mode: "LOGOUT" });
	});

	test("Wanting to log out", ({ given, when, then }) => {
		given("I am already logged in", async () => {
			await authPresenter.login("admin@system-panda.com", "1234");

			expect(authPresenter.email).not.toBe(null);
			expect(authRepository.authenticated).toBe(true);
		});

		when("I click to log out", async () => {
			const pm = await authPresenter.logout();

			expect(pm.ok).toBe("OK");
			expect(authPresenter.email).toBe(null);
			expect(authRepository.authenticated).toBeFalsy();
		});

		then("I should no longer have access and have been unauthorized", async () => {
			const pm = await authPresenter.logout();

			expect(pm.ok).toBe("OK");
		});
	});
});
