import { useForm } from "react-hook-form";
import { AuthPresenter } from "../auth/auth.presenter";
import { observer } from "mobx-react";
import { router } from "../routing/router";
import { Outlet } from "@tanstack/router";
import { useEffect } from "react";
import dayjs from "dayjs";
import { emailRegex } from "../utilities/regex";
import { withInjection } from "../ioc/withInjection";

interface AccessTokenType {
	expired: boolean;
	date: string;
}

type LoginPageProps = {
	presenter?: InstanceType<typeof AuthPresenter>;
};

const LoginPageComponent = observer((props: LoginPageProps) => {
	const { presenter: authPresenter } = props;
	const {
		handleSubmit,
		register,
		formState: { errors },
	} = useForm();

	const onSubmit = async (fieldValues: { [key: string]: string }) => {
		const response = await authPresenter?.login(fieldValues.email, fieldValues.password);

		if (response?.ok) {
			router.navigate({
				from: "/",
				to: "/app",
			});
		}
	};

	useEffect(() => {
		const checkLocalStorage = () => {
			const accessToken = localStorage.getItem("accessToken");

			if (!accessToken) {
				authPresenter?.setAuth(false);
				return null;
			}

			const accessTokenData = JSON.parse(accessToken) as AccessTokenType;

			if (accessTokenData.expired) {
				authPresenter?.setAuth(false);
				return null;
			}

			const dateAfterExpiration = dayjs(accessTokenData.date).isAfter(dayjs().toISOString());

			if (dateAfterExpiration) {
				const updatedExpiredObj = Object.assign({}, accessToken, {
					expired: true,
				});

				localStorage.setItem("accessToken", JSON.stringify(updatedExpiredObj));

				authPresenter?.setAuth(false);

				return null;
			}

			authPresenter?.setAuth(true);
		};

		checkLocalStorage();

		if (authPresenter?.isAuthenticated) {
			router.navigate({
				to: "/app",
			});
		}
	}, []);

	return (
		<div className="h-screen flex justify-center items-center bg-transparent">
			<Outlet />
			<article className="bg-white rounded-lg w-[20rem] shadow-lg shadow-[#c2ead5]">
				<div className="text-6xl text-center relative h-[0px] bottom-[33px]">🐼</div>
				<h1 className="text-center font-bold text-3xl pt-7">SystemPanda</h1>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col justify-center items-center pt-4 px-8 pb-8"
				>
					<label htmlFor="email" className="w-full mb-1 text-sm">
						Email
						{errors.email?.type === "required" && (
							<span role="alert" className="text-red-700">
								*
							</span>
						)}
					</label>
					<input
						type="email"
						{...register("email", {
							required: true,
							pattern: emailRegex,
						})}
						className="mb-3 bg-white border border-1 px-3 py-2 rounded-[4px] w-full"
					/>
					{errors.email?.type === "pattern" && (
						<p
							role="alert"
							className="text-red-700 text-sm inline text-left w-full mt-[-0.5rem] mb-3"
						>
							You've entered an invalid email.
						</p>
					)}
					<label htmlFor="password" className="w-full mb-1 text-sm">
						Password{" "}
						{errors.password?.type === "required" && (
							<span role="alert" className="text-red-700">
								*
							</span>
						)}
					</label>
					<input
						type="password"
						{...register("password", {
							required: true,
							minLength: 1,
						})}
						className="mb-6 bg-white border border-1 px-3 py-2 rounded-[4px] w-full"
					/>
					<button
						type="submit"
						className="border border-1 px-12 py-3 bg-[#224714] rounded-lg text-white font-bold w-full hover:shadow-lg"
					>
						Login
					</button>
					{authPresenter?.message && authPresenter?.message?.length && (
						<p role="alert" className="text-red-700 text-sm mt-2">
							{authPresenter?.authMessage}
						</p>
					)}
				</form>
			</article>
		</div>
	);
});

export const LoginPage = withInjection({
	presenter: AuthPresenter,
})(LoginPageComponent);
