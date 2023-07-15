import MobileSideBar from "./components/MobileSideBar/MobileSideBar";

function App() {
	return (
		<>
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
							<li>Log out</li>
						</ul>
					</aside>
					<article className="p-4 bg-white rounded-lg">table goes here</article>
				</div>
			</div>
			<MobileSideBar />
		</>
	);
}

export default App;
