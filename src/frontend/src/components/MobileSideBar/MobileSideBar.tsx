import { block } from "million/react";
import { useMobileSideBar } from "./use-mobile-sidebar";

const Icon = ({ show }: any) => {
	return <span>{show ? "x" : "="}</span>;
};

const MobileSideBar = block(() => {
	const { show, setShow } = useMobileSideBar(false);

	return (
		<div
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal={show}
			className="lg:invisible lg:opacity-0"
		>
			<button
				className={`cursor-default transition fixed inset-0 bg-slate-100 transition-all ease-in-out delay-150 ${
					show ? "visible opacity-75" : "invisible opacity-0"
				}`}
				onClick={() => {
					setShow(false);
				}}
			/>
			<aside className="fixed inset-x-0 z-10 max-w-lg p-3 mx-auto text-black bottom-2">
				<div
					className={`${
						show ? "w-3/4" : "w-3/5"
					} h-auto px-4 pt-4 pb-16 mx-auto rounded-lg bg-slate-700 transition-all ease-in-out delay-150  `}
				>
					<div
						className={`${
							show ? "visible relative" : "invisible absolute"
						} pb-4 mb-3 text-white border-b-2 border-slate-600`}
					>
						<ul>
							<li>Overview</li>
							<li>Plugins</li>
							<li>Collections</li>
							<li>Settings</li>
							<li>Log out</li>
						</ul>
					</div>
				</div>
			</aside>
			<div className="fixed inset-x-0 z-20 flex p-3 text-black bottom-6">
				<div className="flex items-center gap-2 px-4 py-2 mx-auto rounded-lg border-1 bg-slate-800">
					<h1 className="font-medium text-white">🐼 System Panda</h1>
					<button
						className="px-3 py-1 mx-auto bg-blue-200 rounded-lg"
						onClick={() => {
							setShow(!show);
						}}
					>
						<Icon show={show} />
					</button>
				</div>
			</div>
		</div>
	);
});

export default MobileSideBar;
