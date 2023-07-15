import MobileSideBar from "./components/MobileSideBar/MobileSideBar";

function App() {
	return (
		<>
			<div className="flex items-center w-full h-100vh">
				<div className="flex max-w-[20rem] m-auto gap-4 items-center">
					<aside className="invisible hidden w-auto p-3 bg-white opacity-0 lg:visible lg:block lg:opacity-100">
						<h1 className="font-bold">🐼 System Panda</h1>
						<ul>
							<li>Overview</li>
							<li>Plugins</li>
							<li>Collections</li>
							<li>Settings</li>
							<li>Log out</li>
						</ul>
					</aside>
					<article className="p-4 bg-white">table goes here</article>
				</div>
			</div>
			<MobileSideBar />
		</>
	);
}

export default App;
