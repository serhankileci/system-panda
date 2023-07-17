import { useMobileSideBar } from "./use-mobile-sidebar";
import baseUrl from "../../shared/constants/baseUrl";
import { block } from "million/react";
import { ViewModel } from "src/shared/types/viewmodel";
import { CollectionsBlock } from "../CollectionsBlock";

interface MenuIconProps {
	open: boolean;
}

const MenuIcon = ({ open }: MenuIconProps) => {
	return <span className="relative bottom-[1px]">{open ? "x" : "="}</span>;
};

interface MobileSideBarProps {
	viewModel: ViewModel;
}

const MobileSideBar = block((props: MobileSideBarProps) => {
	const { viewModel } = props;

	const { showMenu, setShowMenu } = useMobileSideBar(false);
	const backdropClassName = [
		"cursor-default transition fixed inset-0 bg-slate-100 transition-all ease-in-out delay-150",
		showMenu ? "visible opacity-75" : "invisible opacity-0",
	]
		.filter(Boolean)
		.join(" ");

	const menuContainerClassName = [
		"h-auto px-4 pt-4 pb-16 mx-auto transition-all ease-in-out delay-150 rounded-lg bg-slate-700",
		showMenu ? "w-3/4" : "w-3/5",
	]
		.filter(Boolean)
		.join(" ");

	const listContainerClassName = [
		"pb-4 mb-3 text-white border-b-2 border-slate-600",
		showMenu ? "visible relative" : "invisible absolute",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			aria-labelledby="modal-title"
			role="dialog"
			aria-modal={showMenu}
			className="lg:invisible lg:opacity-0"
		>
			<button
				className={backdropClassName}
				onClick={() => {
					setShowMenu(false);
				}}
			/>
			<aside className="fixed inset-x-0 z-10 max-w-lg p-3 mx-auto text-black bottom-2">
				<div className={menuContainerClassName}>
					<div className={listContainerClassName}>
						<nav className="px-6 py-3">
							<a href={baseUrl} className="block mb-2 text-lg font-medium">
								Dashboard
							</a>
							<h2 className="text-lg font-medium">Collections</h2>
							<ul className="mb-2">
								<CollectionsBlock collections={viewModel.collections} />
							</ul>
							<a href={`${baseUrl}/plugins`} className="text-lg font-medium">
								Plugins
							</a>
						</nav>
					</div>
				</div>
			</aside>
			<div className="fixed inset-x-0 z-20 flex p-3 text-black bottom-6">
				<div className="flex items-center gap-2 px-4 py-2 mx-auto rounded-lg border-1 bg-slate-800">
					<h1 className="font-medium text-white">🐼 System Panda</h1>
					<button
						className="px-3 py-1 mx-auto bg-blue-200 rounded-lg"
						onClick={() => {
							setShowMenu(!showMenu);
						}}
					>
						<MenuIcon open={showMenu} />
					</button>
				</div>
			</div>
		</div>
	);
});

export default MobileSideBar;