import dayjs from "dayjs";
import { defineFeature, loadFeature } from "jest-cucumber";

import { InversifyConfig } from "../../ioc/InversifyConfig";
import { AuthPresenter } from "../../modules/auth/auth.presenter";
import { AuthenticationRepository } from "../../modules/auth/authentication.repository";
import { LoginTestHarness } from "../support/harnesses/login.harness";

const featureLoggingIn = loadFeature("src/__tests__/features/auth/login.feature");

defineFeature(featureLoggingIn, test => {
	test("Entering the correct password", ({ given, when, then }) => {
		const inversifyConfig = new InversifyConfig("test");
		inversifyConfig.setupBindings();

		const container = inversifyConfig.container;

		let authPresenter = container.get(AuthPresenter);
		const authRepository = container.get(AuthenticationRepository);

		beforeEach(() => {
			localStorage.clear();
			authPresenter = container.get(AuthPresenter);

			const testHarness = new LoginTestHarness();
			testHarness.init({ mode: "LOGIN" });

			authRepository.gateway.post = jest.fn().mockImplementation(() => {
				return Promise.resolve({
					ok: true,
					statusText: "OK",
				});
			});
		});

		given("the dashboard tell its Presenter to load data on mount.", () => {
			expect(authRepository.authenticated).toBeFalsy();
		});

		when("I enter my admin password correctly", async () => {
			const pm = await authPresenter.login("admin@system-panda.com", "1234");

			expect(authRepository.gateway.post).toHaveBeenCalledTimes(1);
			expect(authPresenter.email).toBe("admin@system-panda.com");

			expect(pm.ok).toBe(true);
		});

		then("I should be authorized and granted access", () => {
			expect(authRepository.authenticated).toBeTruthy();
		});
	});
});

const featureLoggingOut = loadFeature("src/__tests__/features/auth/logout.feature");

defineFeature(featureLoggingOut, test => {
	const inversifyConfig = new InversifyConfig("test");
	inversifyConfig.setupBindings();

	const container = inversifyConfig.container;

	const authPresenter = container.get(AuthPresenter);
	const authRepository = container.get(AuthenticationRepository);

	let setItemSpy: jest.SpyInstance<void, [key: string, value: string], unknown> | null = null;

	beforeEach(() => {
		localStorage.clear();
		setItemSpy = jest.spyOn(localStorage, "setItem");

		const testHarness = new LoginTestHarness();
		testHarness.init({ mode: "LOGOUT" });

		authRepository.gateway.post = jest.fn().mockImplementation(() => {
			return Promise.resolve({
				ok: true,
				statusText: "OK",
			});
		});
	});

	test("Wanting to log out", ({ given, when, then }) => {
		given("I am already logged in", async () => {
			await authPresenter.login("admin@system-panda.com", "1234");

			expect(authPresenter.email).not.toBe(null);

			expect(setItemSpy).toHaveBeenLastCalledWith(
				"accessToken",
				JSON.stringify({
					expired: false,
					date: dayjs().toISOString(),
				})
			);

			expect(authRepository.authenticated).toBe(true);
		});

		when("I click to log out", async () => {
			const pm = await authPresenter.logout();

			expect(pm.ok).toBe(true);
			expect(authPresenter.email).toBe(null);
			expect(localStorage.getItem("accessToken")).toBeNull();
			expect(authRepository.authenticated).toBeFalsy();
		});

		then("I should no longer have access and have been unauthorized", async () => {
			const pm = await authPresenter.logout();

			expect(pm.ok).toBe(true);
		});
	});
});
