import { useForm } from "react-hook-form";
import { AuthPresenter } from "../auth/auth.presenter";
import { observer } from "mobx-react";
import { router } from "../routing/router";
import { Outlet } from "@tanstack/router";
import { useEffect } from "react";
import authenticationRepository from "../auth/authentication.repository";
import Cookies from "js-cookie";
import config from "../shared/config";

export const LoginPage = observer(() => {
	const { handleSubmit, register } = useForm();
	const authPresenter = new AuthPresenter();

	const onSubmit = async (fieldValues: { [key: string]: string }) => {
		const response = await authPresenter.login(fieldValues.email, fieldValues.password);

		if (response.ok) {
			router.navigate({
				from: "/",
				to: "/app",
			});
		}
	};

	useEffect(() => {
		const cookie = Cookies.get("system-panda-sid");

		if (cookie?.length && cookie !== "false") {
			authenticationRepository.authenticated = true;
		}

		if (cookie === "false") {
			Cookies.remove("system-panda-sid", { path: config.baseUrl });
			authenticationRepository.authenticated = false;
		}

		if (authenticationRepository.authenticated) {
			router.navigate({
				to: "/app",
			});
		}
	}, []);

	return (
		<div className="h-screen flex justify-center items-center bg-[#f0f8f1]">
			<Outlet />
			<article className="bg-white rounded-lg w-[20rem]">
				<div className="text-6xl text-center relative h-[0px] bottom-[33px]">🐼</div>
				<h1 className="text-center font-bold text-3xl pt-7">SystemPanda</h1>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col justify-center items-center pt-4 px-8 pb-8"
				>
					<label htmlFor="email" className="w-full mb-1 text-sm">
						Email
					</label>
					<input
						type="email"
						{...register("email")}
						className="mb-3 bg-white border border-1 px-3 py-2 rounded-[4px] w-full"
					/>
					<label htmlFor="password" className="w-full mb-1 text-sm">
						Password
					</label>
					<input
						type="password"
						{...register("password")}
						className="mb-6 bg-white border border-1 px-3 py-2 rounded-[4px] w-full"
					/>
					<button
						type="submit"
						className="border border-1 px-12 py-3 bg-[#224714] rounded-lg text-white font-bold w-full hover:shadow-lg"
					>
						Login
					</button>
				</form>
			</article>
		</div>
	);
});
