import MobileSideBar from "./components/MobileSideBar/MobileSideBar";
import { auth } from "./auth.tsx";
import { useState } from "react";

function App() {
	const [loggedIn, setLoggedIn] = useState(
		Boolean(JSON.parse(localStorage.getItem("logged_in") || "false"))
	);

	// const routes: Record<string, React.JSX.Element> = {
	// 	"/": <h1>Dashboard</h1>,
	// 	"/users": <h1>Users</h1>,
	// 	"/plugins": <h1>Plugins</h1>,
	// 	"/404": <p>Not found</p>,
	// };

	// get collections data from the metadata route
	// collections?.forEach(collection => {
	// 	function Collection() {
	// 		const [data, setData] = useState<unknown>(null);

	// 		useEffect(() => {
	// 			(async () => {
	// 				const res = await fetch(`/system-panda-api/${collection}`);
	// 				if (res.ok) setData(await res.json());
	// 			})();
	// 		}, []);

	// 		return <DataTable ...somePropsHere />
	// 	}

	// 	routes[collection] = <Collection />;
	// });

	return (
		<>
			{loggedIn ? (
				<>
					<auth.Logout setLoggedIn={setLoggedIn} />
					{/* {routes[window.location.pathname] || routes["/404"]} */}
				</>
			) : (
				<>
					<auth.Login setLoggedIn={setLoggedIn} />
				</>
			)}

			<div
				className="flex items-center max-w-[91rem] h-screen mx-auto p-3"
				style={{ border: "1px solid red" }}
			>
				<div className="flex max-w-[20rem] m-auto gap-4 items-center">
					<aside className="invisible hidden w-auto p-3 bg-white rounded-lg opacity-0 lg:visible lg:block lg:opacity-100">
						<h1 className="text-xl font-bold">🐼 System Panda</h1>
						<ul>
							<li>Overview</li>
							<li>Plugins</li>
							<li>Collections</li>
							<li>Settings</li>
						</ul>
					</aside>
					<article className="p-4 bg-white rounded-lg">table goes here</article>
				</div>
			</div>
			{/* <MobileSideBar /> */}
		</>
	);
}

export default App;
