import { FormEvent } from "react";
import config from "../shared/config.ts";

export const Auth = {
	Login: function ({ setLoggedIn }: { setLoggedIn: (bool: boolean) => void }) {
		const handleForm = async (e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			const res = await fetch(config.apiUrl + "/auth/login", {
				method: "post",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
			});

			if (res.ok) {
				setLoggedIn(true);
				localStorage.setItem("logged_in", "true");
			}
		};

		return (
			<form
				onSubmit={e => {
					handleForm(e);
				}}
			>
				<div>
					<label htmlFor="email">Email</label>
					<input type="email" id="email" name="email" required />
				</div>
				<div>
					<label htmlFor="password">Password</label>
					<input type="password" id="password" name="password" required />
				</div>
				<div>
					<button type="submit">Login</button>
				</div>
			</form>
		);
	},
	Logout: function ({ setLoggedIn }: { setLoggedIn: (bool: boolean) => void }) {
		const handleForm = async (e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();

			const res = await fetch(config.apiUrl + "/auth/logout", {
				method: "post",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
			});

			if (res.ok) {
				setLoggedIn(false);
				localStorage.removeItem("logged_in");
			}
		};

		return (
			<form
				onSubmit={e => {
					handleForm(e);
				}}
			>
				<button type="submit">Logout</button>
			</form>
		);
	},
};
