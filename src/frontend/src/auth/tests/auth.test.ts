import { loadFeature, defineFeature } from "jest-cucumber";
import authRepository from "../authentication.repository";
import { LoginPresenter } from "../login.presenter";
import { LoginTestHarness } from "../../test-tools/harnesses/login.harness";

const featureLoggingIn = loadFeature("src/auth/tests/features/login.feature");

defineFeature(featureLoggingIn, test => {
	test("Entering the correct password", ({ given, when, then }) => {
		let loginPresenter: InstanceType<typeof LoginPresenter>;

		beforeEach(() => {
			loginPresenter = new LoginPresenter();
			const testHarness = new LoginTestHarness();
			testHarness.init({ mode: "LOGIN" });
		});

		given("the dashboard tell its Presenter to load data on mount.", () => {
			expect(authRepository.authenticated).toBeFalsy();
		});

		when("I enter my admin password correctly", async () => {
			const pm = await loginPresenter.login("admin@system-panda.com", "1234");

			expect(authRepository.gateway.post).toHaveBeenCalledTimes(1);
			expect(loginPresenter.email).toBe("admin@system-panda.com");

			expect(pm.ok).toBe("OK");
		});

		then("I should be authorized and granted access", () => {
			expect(authRepository.authenticated).toBeTruthy();
		});
	});
});

const featureLoggingOut = loadFeature("src/auth/tests/features/logout.feature");

defineFeature(featureLoggingOut, test => {
	let loginPresenter: InstanceType<typeof LoginPresenter>;

	beforeEach(() => {
		loginPresenter = new LoginPresenter();
		const testHarness = new LoginTestHarness();
		testHarness.init({ mode: "LOGOUT" });
	});

	test("Wanting to log out", ({ given, when, then }) => {
		given("I am already logged in", async () => {
			await loginPresenter.login("admin@system-panda.com", "1234");

			expect(loginPresenter.email).not.toBe(null);
			expect(authRepository.authenticated).toBe(true);
		});

		when("I click to log out", async () => {
			const pm = await loginPresenter.logout();

			expect(pm.ok).toBe("OK");
			expect(loginPresenter.email).toBe(null);
			expect(authRepository.authenticated).toBeFalsy();
		});

		then("I should no longer have access and have been unauthorized", async () => {
			const pm = await loginPresenter.logout();

			expect(pm.ok).toBe("Unauthorized");
		});
	});
});
